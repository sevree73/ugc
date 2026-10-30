import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ApplyForm } from "@/components/apply-form";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function CreatorBriefDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const brief = await prisma.brief.findUnique({
    where: { id },
    include: { company: { select: { name: true, sector: true } } },
  });

  if (!brief) {
    notFound();
  }

  const profile = session?.user
    ? await prisma.creatorProfile.findUnique({
        where: { userId: session.user.id },
      })
    : null;

  const existingApplication = profile
    ? await prisma.application.findUnique({
        where: { briefId_creatorId: { briefId: brief.id, creatorId: profile.id } },
      })
    : null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link
        href="/creator/briefs"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour aux briefs
      </Link>

      <PageHeader title={brief.title} description={brief.company.name} />

      <div className="flex flex-wrap gap-1.5">
        <Badge tone="neutral">{brief.sector}</Badge>
        <Badge tone="neutral">{brief.format}</Badge>
        <Badge tone="info">{brief.budget.toLocaleString("fr-DZ")} DA</Badge>
        {brief.creatorsNeeded && (
          <Badge tone="neutral">
            {brief.creatorsNeeded} créateur{brief.creatorsNeeded > 1 ? "s" : ""}
          </Badge>
        )}
        {brief.deadline && (
          <Badge tone="warning">
            Deadline : {brief.deadline.toLocaleDateString("fr-FR")}
          </Badge>
        )}
      </div>

      {brief.description && (
        <Card className="p-5">
          <p className="text-sm leading-relaxed text-slate-700">{brief.description}</p>
        </Card>
      )}

      <Card className="p-6">
        {brief.status !== "PUBLISHED" ? (
          <p className="text-sm text-slate-500">
            Ce brief n&apos;accepte plus de candidatures.
          </p>
        ) : existingApplication ? (
          <p className="text-sm text-slate-700">
            Vous avez déjà postulé. Statut :{" "}
            <span className="font-medium">{existingApplication.status}</span>
          </p>
        ) : (
          <ApplyForm briefId={brief.id} />
        )}
      </Card>
    </div>
  );
}
