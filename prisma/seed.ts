import "dotenv/config";
import { PrismaClient, Role, BriefStatus, ApplicationStatus, DeliverableStatus, PaymentStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { saveFile } from "../src/lib/storage";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const PASSWORD = "password123";
const COMMISSION_RATE = 0.15;

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

async function upsertUser(email: string, role: Role) {
  const password = await bcrypt.hash(PASSWORD, 10);
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, password, role },
  });
}

async function upsertCompany(email: string, name: string, sector: string) {
  const user = await upsertUser(email, Role.COMPANY);
  return prisma.company.upsert({
    where: { userId: user.id },
    update: { name, sector },
    create: { userId: user.id, name, sector },
  });
}

async function upsertCreator(
  email: string,
  bio: string,
  sectors: string[],
  portfolioUrls: string[],
) {
  const user = await upsertUser(email, Role.CREATOR);
  return prisma.creatorProfile.upsert({
    where: { userId: user.id },
    update: { bio, sectors, portfolioUrls },
    create: { userId: user.id, bio, sectors, portfolioUrls },
  });
}

async function findOrCreateBrief(input: {
  companyId: string;
  title: string;
  sector: string;
  format: string;
  budget: number;
  description?: string;
  status: BriefStatus;
  deadline?: Date;
  creatorsNeeded?: number;
  createdAt?: Date;
}) {
  const existing = await prisma.brief.findFirst({
    where: { companyId: input.companyId, title: input.title },
  });
  if (existing) return existing;

  return prisma.brief.create({
    data: {
      companyId: input.companyId,
      title: input.title,
      sector: input.sector,
      format: input.format,
      budget: input.budget,
      description: input.description,
      status: input.status,
      deadline: input.deadline,
      creatorsNeeded: input.creatorsNeeded,
      createdAt: input.createdAt,
      updatedAt: input.createdAt,
    },
  });
}

async function upsertApplication(
  briefId: string,
  creatorId: string,
  status: ApplicationStatus,
  message?: string,
  createdAt?: Date,
) {
  return prisma.application.upsert({
    where: { briefId_creatorId: { briefId, creatorId } },
    update: { status },
    create: { briefId, creatorId, status, message, createdAt, updatedAt: createdAt },
  });
}

async function seedDeliverableIfMissing(
  briefId: string,
  creatorId: string,
  version: number,
  fileName: string,
  content: string,
  status: DeliverableStatus,
  createdAt?: Date,
) {
  const existing = await prisma.deliverable.findFirst({ where: { briefId, version } });
  if (existing) return existing;

  const buffer = Buffer.from(content, "utf-8");
  const key = `briefs/${briefId}/v${version}-${fileName}`;
  await saveFile(key, buffer);

  return prisma.deliverable.create({
    data: {
      briefId,
      creatorId,
      fileUrl: key,
      fileName,
      sizeBytes: buffer.length,
      version,
      status,
      createdAt,
    },
  });
}

async function seedMessagesIfMissing(
  briefId: string,
  thread: Array<{ senderId: string; body: string; createdAt?: Date }>,
) {
  const existingCount = await prisma.message.count({ where: { briefId } });
  if (existingCount > 0) return;

  for (const m of thread) {
    await prisma.message.create({
      data: { briefId, senderId: m.senderId, body: m.body, createdAt: m.createdAt },
    });
  }
}

async function upsertPayment(briefId: string, amount: number, status: PaymentStatus) {
  const commission = Math.round(amount * COMMISSION_RATE);
  return prisma.payment.upsert({
    where: { briefId },
    update: {},
    create: { briefId, amount, commission, status },
  });
}

async function upsertReview(
  briefId: string,
  creatorId: string,
  rating: number,
  comment: string,
) {
  return prisma.review.upsert({
    where: { briefId },
    update: {},
    create: { briefId, creatorId, rating, comment },
  });
}

async function recomputeCreatorRating(creatorId: string) {
  const agg = await prisma.review.aggregate({
    where: { creatorId },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.creatorProfile.update({
    where: { id: creatorId },
    data: { ratingAvg: agg._avg.rating ?? 0, reviewCount: agg._count },
  });
}

async function main() {
  console.log("Seeding admin...");
  await upsertUser("admin@example.com", Role.ADMIN);

  console.log("Seeding companies...");
  const acme = await upsertCompany("acme@example.com", "Acme Corp", "Beauty");
  const technova = await upsertCompany("technova@example.com", "TechNova", "Tech");
  const freshbite = await upsertCompany("freshbite@example.com", "FreshBite", "Food & Beverage");
  const urbanfit = await upsertCompany("urbanfit@example.com", "UrbanFit", "Fitness & Health");

  console.log("Seeding creators...");
  const jane = await upsertCreator(
    "jane.creator@example.com",
    "Beauty and skincare content creator, 50k+ TikTok followers.",
    ["Beauty", "Fashion"],
    ["https://tiktok.com/@janecreator", "https://instagram.com/janecreator"],
  );
  const mia = await upsertCreator(
    "mia.chen@example.com",
    "Fashion stylist and content creator based in Algiers.",
    ["Fashion", "Beauty"],
    ["https://instagram.com/miachen", "https://tiktok.com/@miachen"],
  );
  const sam = await upsertCreator(
    "sam.malik@example.com",
    "Tech reviewer specializing in unboxing and gadget content.",
    ["Tech"],
    ["https://youtube.com/@sammalik", "https://tiktok.com/@sammalik"],
  );
  const leo = await upsertCreator(
    "leo.duarte@example.com",
    "Food and recipe content creator, home cooking specialist.",
    ["Food & Beverage"],
    ["https://instagram.com/leocooks"],
  );
  const nora = await upsertCreator(
    "nora.haddad@example.com",
    "Fitness coach and lifestyle creator, daily workout content.",
    ["Fitness & Health", "Home & Lifestyle"],
    ["https://instagram.com/norafit", "https://tiktok.com/@norafit"],
  );
  const omar = await upsertCreator(
    "omar.belkacem@example.com",
    "Travel and lifestyle vlogger exploring Algeria and beyond.",
    ["Travel", "Other"],
    ["https://youtube.com/@omartravels"],
  );

  console.log("Seeding briefs...");

  // Existing Acme briefs (from earlier manual testing) are left untouched by
  // findOrCreateBrief's guard. We only add one new published brief for them.
  await findOrCreateBrief({
    companyId: acme.id,
    title: "Nouvelle gamme soins visage - vidéo UGC",
    sector: "Beauty",
    format: "UGC Video",
    budget: 18000,
    description: "Vidéo authentique présentant notre nouvelle gamme de soins visage.",
    status: BriefStatus.PUBLISHED,
    creatorsNeeded: 2,
    deadline: daysAgo(-14),
  });

  await findOrCreateBrief({
    companyId: technova.id,
    title: "Test d'un nouvel écouteur sans fil",
    sector: "Tech",
    format: "Testimonial",
    budget: 12000,
    description: "Retour d'expérience honnête sur nos nouveaux écouteurs.",
    status: BriefStatus.DRAFT,
  });

  await findOrCreateBrief({
    companyId: technova.id,
    title: "Unboxing du dernier smartphone",
    sector: "Tech",
    format: "Unboxing",
    budget: 20000,
    description: "Unboxing complet avec démonstration des fonctionnalités clés.",
    status: BriefStatus.PUBLISHED,
    creatorsNeeded: 1,
    deadline: daysAgo(-21),
  });

  const techPublished2 = await findOrCreateBrief({
    companyId: technova.id,
    title: "Avis produit - chargeur rapide",
    sector: "Tech",
    format: "Testimonial",
    budget: 8000,
    status: BriefStatus.PUBLISHED,
  });

  const techInProgress = await findOrCreateBrief({
    companyId: technova.id,
    title: "Vidéo de présentation app mobile",
    sector: "Tech",
    format: "UGC Video",
    budget: 22000,
    description: "Vidéo montrant l'usage quotidien de notre application.",
    status: BriefStatus.IN_PROGRESS,
    createdAt: daysAgo(6),
  });

  await findOrCreateBrief({
    companyId: freshbite.id,
    title: "Recette healthy avec nos produits",
    sector: "Food & Beverage",
    format: "Reel / TikTok",
    budget: 9000,
    status: BriefStatus.PUBLISHED,
  });

  const foodDelivered = await findOrCreateBrief({
    companyId: freshbite.id,
    title: "Dégustation en story Instagram",
    sector: "Food & Beverage",
    format: "Story",
    budget: 7000,
    status: BriefStatus.DELIVERED,
    createdAt: daysAgo(5),
  });

  await findOrCreateBrief({
    companyId: urbanfit.id,
    title: "Séance sport avec nos équipements",
    sector: "Fitness & Health",
    format: "Reel / TikTok",
    budget: 15000,
    status: BriefStatus.PUBLISHED,
  });

  const fitnessCompleted = await findOrCreateBrief({
    companyId: urbanfit.id,
    title: "Programme fitness 30 jours - vidéo témoignage",
    sector: "Fitness & Health",
    format: "Testimonial",
    budget: 30000,
    description: "Témoignage vidéo après 30 jours d'utilisation de notre programme.",
    status: BriefStatus.COMPLETED,
    createdAt: daysAgo(10),
  });

  console.log("Seeding applications...");

  await upsertApplication(
    techPublished2.id,
    sam.id,
    ApplicationStatus.PENDING,
    "Je serais ravi de tester ce chargeur, j'ai une audience très tech.",
  );

  await upsertApplication(
    techInProgress.id,
    sam.id,
    ApplicationStatus.ACCEPTED,
    "Votre app a l'air super, j'adorerais la présenter à ma communauté.",
    daysAgo(6),
  );
  await upsertApplication(
    techInProgress.id,
    mia.id,
    ApplicationStatus.REJECTED,
    "Intéressée par ce projet même si ce n'est pas mon secteur habituel.",
    daysAgo(6),
  );

  await upsertApplication(
    foodDelivered.id,
    leo.id,
    ApplicationStatus.ACCEPTED,
    "J'adore vos produits, je peux livrer une story authentique rapidement.",
    daysAgo(5),
  );

  await upsertApplication(
    fitnessCompleted.id,
    nora.id,
    ApplicationStatus.ACCEPTED,
    "30 jours de coaching, ça tombe bien, c'est exactement mon univers !",
    daysAgo(10),
  );

  console.log("Seeding deliverables...");

  await seedDeliverableIfMissing(
    foodDelivered.id,
    leo.id,
    1,
    "degustation_story_v1.mp4",
    "placeholder video content - dégustation story v1",
    DeliverableStatus.SUBMITTED,
    daysAgo(1),
  );

  await seedDeliverableIfMissing(
    fitnessCompleted.id,
    nora.id,
    1,
    "temoignage_v1.mp4",
    "placeholder video content - témoignage fitness v1",
    DeliverableStatus.REVISION_REQUESTED,
    daysAgo(6),
  );
  await seedDeliverableIfMissing(
    fitnessCompleted.id,
    nora.id,
    2,
    "temoignage_v2_final.mp4",
    "placeholder video content - témoignage fitness v2 final",
    DeliverableStatus.APPROVED,
    daysAgo(2),
  );

  console.log("Seeding messages...");

  await seedMessagesIfMissing(techInProgress.id, [
    { senderId: sam.userId, body: "Salut ! Hâte de commencer sur cette vidéo app.", createdAt: daysAgo(6) },
    { senderId: technova.userId, body: "Top ! N'hésite pas si tu as des questions sur les fonctionnalités à mettre en avant.", createdAt: daysAgo(5) },
    { senderId: sam.userId, body: "Je pensais mettre l'accent sur la fonction de recherche, ça vous va ?", createdAt: daysAgo(4) },
  ]);

  await seedMessagesIfMissing(foodDelivered.id, [
    { senderId: leo.userId, body: "Voici un premier aperçu de la story, dites-moi ce que vous en pensez !", createdAt: daysAgo(1) },
    { senderId: freshbite.userId, body: "On adore le rendu, merci pour la rapidité !", createdAt: daysAgo(1) },
  ]);

  await seedMessagesIfMissing(fitnessCompleted.id, [
    { senderId: nora.userId, body: "Voici la première version du témoignage.", createdAt: daysAgo(6) },
    { senderId: urbanfit.userId, body: "Super travail ! Pourriez-vous ajouter un plan proche sur le produit à la fin ?", createdAt: daysAgo(5) },
    { senderId: nora.userId, body: "Bien sûr, je vous envoie la version finale.", createdAt: daysAgo(2) },
    { senderId: urbanfit.userId, body: "Parfait, exactement ce qu'on voulait !", createdAt: daysAgo(1) },
  ]);

  console.log("Seeding payments and reviews...");

  await upsertPayment(fitnessCompleted.id, 30000, PaymentStatus.RELEASED);
  await upsertReview(
    fitnessCompleted.id,
    nora.id,
    5,
    "Contenu authentique et professionnel, on recommande !",
  );

  console.log("Recomputing creator ratings from real reviews...");
  for (const creator of [jane, mia, sam, leo, nora, omar]) {
    await recomputeCreatorRating(creator.id);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
