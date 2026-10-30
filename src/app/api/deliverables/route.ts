import path from "path";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { saveFile } from "@/lib/storage";
import { getBriefAccess } from "@/lib/project-access";
import { BriefStatus, DeliverableStatus } from "@prisma/client";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CREATOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const briefId = formData.get("briefId");
  const file = formData.get("file");

  if (typeof briefId !== "string" || !(file instanceof File)) {
    return NextResponse.json(
      { error: "briefId and file are required" },
      { status: 400 },
    );
  }

  const { brief, isAssignedCreator, assignedApplication } = await getBriefAccess(
    briefId,
    session.user.id,
    session.user.role,
  );

  if (!brief || !isAssignedCreator || !assignedApplication) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (
    brief.status !== BriefStatus.IN_PROGRESS &&
    brief.status !== BriefStatus.DELIVERED
  ) {
    return NextResponse.json(
      { error: "This brief is not accepting deliverables right now" },
      { status: 400 },
    );
  }

  const lastVersion = await prisma.deliverable.aggregate({
    where: { briefId },
    _max: { version: true },
  });
  const version = (lastVersion._max.version ?? 0) + 1;

  const originalName = path.basename(file.name);
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `briefs/${briefId}/v${version}-${safeName}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  await saveFile(key, buffer);

  const [deliverable] = await prisma.$transaction([
    prisma.deliverable.create({
      data: {
        briefId,
        creatorId: assignedApplication.creatorId,
        fileUrl: key,
        fileName: originalName,
        sizeBytes: buffer.length,
        version,
        status: DeliverableStatus.SUBMITTED,
      },
    }),
    prisma.brief.update({
      where: { id: briefId },
      data: { status: BriefStatus.DELIVERED },
    }),
  ]);

  return NextResponse.json(deliverable, { status: 201 });
}
