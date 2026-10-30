import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BriefStatus } from "@prisma/client";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
  });
  if (!company) {
    return NextResponse.json(
      { error: "Company profile not found" },
      { status: 404 },
    );
  }

  const body = await req.json();
  const {
    title,
    sector,
    format,
    budget,
    description,
    deadline,
    creatorsNeeded,
    isDraft,
  } = body as {
    title?: string;
    sector?: string;
    format?: string;
    budget?: number | string;
    description?: string;
    deadline?: string;
    creatorsNeeded?: number | string;
    isDraft?: boolean;
  };

  if (!title || !sector || !format || budget === undefined) {
    return NextResponse.json(
      { error: "title, sector, format and budget are required" },
      { status: 400 },
    );
  }

  const budgetNumber = Number(budget);
  if (!Number.isFinite(budgetNumber) || budgetNumber <= 0) {
    return NextResponse.json(
      { error: "budget must be a positive number" },
      { status: 400 },
    );
  }

  let deadlineDate: Date | null = null;
  if (deadline) {
    const parsed = new Date(deadline);
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json({ error: "invalid deadline" }, { status: 400 });
    }
    deadlineDate = parsed;
  }

  let creatorsNeededNumber: number | null = null;
  if (creatorsNeeded !== undefined && creatorsNeeded !== "") {
    const parsed = Number(creatorsNeeded);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return NextResponse.json(
        { error: "creatorsNeeded must be a positive number" },
        { status: 400 },
      );
    }
    creatorsNeededNumber = Math.round(parsed);
  }

  const brief = await prisma.brief.create({
    data: {
      companyId: company.id,
      title,
      sector,
      format,
      budget: Math.round(budgetNumber),
      description: description || null,
      deadline: deadlineDate,
      creatorsNeeded: creatorsNeededNumber,
      status: isDraft ? BriefStatus.DRAFT : BriefStatus.PUBLISHED,
    },
  });

  return NextResponse.json(brief, { status: 201 });
}

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
  });
  if (!company) {
    return NextResponse.json([]);
  }

  const briefs = await prisma.brief.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(briefs);
}
