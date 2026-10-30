import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { readStoredFile } from "@/lib/storage";
import { getBriefAccess } from "@/lib/project-access";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".pdf": "application/pdf",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await params;

  // Keys are always shaped "briefs/<briefId>/<filename>".
  if (key.length < 3 || key[0] !== "briefs") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const briefId = key[1];
  const filename = key[key.length - 1];

  const { brief, isCompanyOwner, isAssignedCreator } = await getBriefAccess(
    briefId,
    session.user.id,
    session.user.role,
  );

  if (!brief || (!isCompanyOwner && !isAssignedCreator)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const data = await readStoredFile(key.join("/"));
    const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
    const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(filename)}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
