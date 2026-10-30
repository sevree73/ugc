import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getBriefAccess } from "@/lib/project-access";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const briefId = new URL(req.url).searchParams.get("briefId");
  if (!briefId) {
    return NextResponse.json({ error: "briefId is required" }, { status: 400 });
  }

  const { brief, isCompanyOwner, isAssignedCreator } = await getBriefAccess(
    briefId,
    session.user.id,
    session.user.role,
  );

  if (!brief || (!isCompanyOwner && !isAssignedCreator)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: { briefId },
    include: { sender: { select: { email: true, role: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(messages);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { briefId, body: text } = body as { briefId?: string; body?: string };

  if (!briefId || !text?.trim()) {
    return NextResponse.json(
      { error: "briefId and a non-empty body are required" },
      { status: 400 },
    );
  }

  const { brief, isCompanyOwner, isAssignedCreator } = await getBriefAccess(
    briefId,
    session.user.id,
    session.user.role,
  );

  if (!brief || (!isCompanyOwner && !isAssignedCreator)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const message = await prisma.message.create({
    data: { briefId, senderId: session.user.id, body: text.trim() },
    include: { sender: { select: { email: true, role: true } } },
  });

  return NextResponse.json(message, { status: 201 });
}
