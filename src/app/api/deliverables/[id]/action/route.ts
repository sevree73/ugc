import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BriefStatus, DeliverableStatus, PaymentStatus } from "@prisma/client";
import { COMMISSION_RATE } from "@/lib/constants";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { action } = (await req.json()) as { action?: "revise" | "approve" };

  if (action !== "revise" && action !== "approve") {
    return NextResponse.json(
      { error: "action must be 'revise' or 'approve'" },
      { status: 400 },
    );
  }

  const deliverable = await prisma.deliverable.findUnique({
    where: { id },
    include: { brief: { include: { company: true } } },
  });

  if (!deliverable || deliverable.brief.company.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (deliverable.status !== DeliverableStatus.SUBMITTED) {
    return NextResponse.json(
      { error: "This deliverable has already been reviewed" },
      { status: 400 },
    );
  }

  const latest = await prisma.deliverable.aggregate({
    where: { briefId: deliverable.briefId },
    _max: { version: true },
  });
  if (deliverable.version !== latest._max.version) {
    return NextResponse.json(
      { error: "Only the latest version can be reviewed" },
      { status: 400 },
    );
  }

  if (action === "revise") {
    const [updatedDeliverable] = await prisma.$transaction([
      prisma.deliverable.update({
        where: { id },
        data: { status: DeliverableStatus.REVISION_REQUESTED },
      }),
      prisma.brief.update({
        where: { id: deliverable.briefId },
        data: { status: BriefStatus.IN_PROGRESS },
      }),
    ]);
    return NextResponse.json(updatedDeliverable);
  }

  const budget = deliverable.brief.budget;
  const commission = Math.round(budget * COMMISSION_RATE);

  const [updatedDeliverable] = await prisma.$transaction([
    prisma.deliverable.update({
      where: { id },
      data: { status: DeliverableStatus.APPROVED },
    }),
    prisma.brief.update({
      where: { id: deliverable.briefId },
      data: { status: BriefStatus.COMPLETED },
    }),
    prisma.payment.upsert({
      where: { briefId: deliverable.briefId },
      create: {
        briefId: deliverable.briefId,
        amount: budget,
        commission,
        status: PaymentStatus.RELEASED,
      },
      update: {
        amount: budget,
        commission,
        status: PaymentStatus.RELEASED,
      },
    }),
  ]);

  return NextResponse.json(updatedDeliverable);
}
