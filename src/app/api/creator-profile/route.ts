import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SECTORS } from "@/lib/constants";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CREATOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json(profile);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CREATOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { bio, sectors, portfolioUrls } = body as {
    bio?: string;
    sectors?: string[];
    portfolioUrls?: string[];
  };

  if (sectors && !sectors.every((s) => (SECTORS as readonly string[]).includes(s))) {
    return NextResponse.json({ error: "Invalid sector" }, { status: 400 });
  }

  if (portfolioUrls) {
    const allValid = portfolioUrls.every((url) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    });
    if (!allValid) {
      return NextResponse.json(
        { error: "portfolioUrls must all be valid URLs" },
        { status: 400 },
      );
    }
  }

  const profile = await prisma.creatorProfile.update({
    where: { userId: session.user.id },
    data: {
      ...(bio !== undefined ? { bio } : {}),
      ...(sectors !== undefined ? { sectors } : {}),
      ...(portfolioUrls !== undefined ? { portfolioUrls } : {}),
    },
  });

  return NextResponse.json(profile);
}
