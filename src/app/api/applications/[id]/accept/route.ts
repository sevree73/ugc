import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ApplicationStatus, BriefStatus } from "@prisma/client";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const application = await prisma.application.findUnique({
    where: { id },
    include: { brief: { include: { company: true } } },
  });

  if (!application || application.brief.company.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (application.brief.status !== BriefStatus.PUBLISHED) {
    return NextResponse.json(
      { error: "This brief is not open for assignment" },
      { status: 400 },
    );
  }

  const [, , updatedBrief] = await prisma.$transaction([
    prisma.application.update({
      where: { id: application.id },
      data: { status: ApplicationStatus.ACCEPTED },
    }),
    prisma.application.updateMany({
      where: {
        briefId: application.briefId,
        id: { not: application.id },
        status: ApplicationStatus.PENDING,
      },
      data: { status: ApplicationStatus.REJECTED },
    }),
    prisma.brief.update({
      where: { id: application.briefId },
      data: { status: BriefStatus.IN_PROGRESS },
    }),
  ]);

  return NextResponse.json(updatedBrief);
}
