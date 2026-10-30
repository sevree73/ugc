import { NextResponse } from "next/server";
import { Prisma, BriefStatus } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CREATOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) {
    return NextResponse.json(
      { error: "Creator profile not found" },
      { status: 404 },
    );
  }

  const body = await req.json();
  const { briefId, message } = body as { briefId?: string; message?: string };

  if (!briefId) {
    return NextResponse.json({ error: "briefId is required" }, { status: 400 });
  }

  const brief = await prisma.brief.findUnique({ where: { id: briefId } });
  if (!brief || brief.status !== BriefStatus.PUBLISHED) {
    return NextResponse.json(
      { error: "This brief is not open for applications" },
      { status: 400 },
    );
  }

  try {
    const application = await prisma.application.create({
      data: { briefId, creatorId: profile.id, message: message || null },
    });
    return NextResponse.json(application, { status: 201 });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "You already applied to this brief" },
        { status: 409 },
      );
    }
    throw e;
  }
}
