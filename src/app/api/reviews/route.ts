import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BriefStatus } from "@prisma/client";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { briefId, rating, comment } = body as {
    briefId?: string;
    rating?: number;
    comment?: string;
  };

  if (!briefId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "briefId and a rating between 1 and 5 are required" },
      { status: 400 },
    );
  }

  const brief = await prisma.brief.findUnique({
    where: { id: briefId },
    include: {
      company: true,
      applications: { where: { status: "ACCEPTED" } },
      review: true,
    },
  });

  if (!brief || brief.company.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (brief.status !== BriefStatus.COMPLETED) {
    return NextResponse.json(
      { error: "You can only review a completed brief" },
      { status: 400 },
    );
  }

  if (brief.review) {
    return NextResponse.json(
      { error: "This brief has already been reviewed" },
      { status: 409 },
    );
  }

  const assigned = brief.applications[0];
  if (!assigned) {
    return NextResponse.json(
      { error: "No assigned creator found for this brief" },
      { status: 400 },
    );
  }

  const review = await prisma.review.create({
    data: {
      briefId,
      creatorId: assigned.creatorId,
      rating: Math.round(rating),
      comment: comment || null,
    },
  });

  const agg = await prisma.review.aggregate({
    where: { creatorId: assigned.creatorId },
    _avg: { rating: true },
    _count: true,
  });

  await prisma.creatorProfile.update({
    where: { id: assigned.creatorId },
    data: {
      ratingAvg: agg._avg.rating ?? 0,
      reviewCount: agg._count,
    },
  });

  return NextResponse.json(review, { status: 201 });
}
