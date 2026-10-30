import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password, role, name, sector, bio } = body as {
    email?: string;
    password?: string;
    role?: string;
    name?: string;
    sector?: string;
    bio?: string;
  };

  if (!email || !password || !role) {
    return NextResponse.json(
      { error: "email, password and role are required" },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "password must be at least 8 characters" },
      { status: 400 },
    );
  }

  if (role !== Role.COMPANY && role !== Role.CREATOR) {
    return NextResponse.json(
      { error: "role must be COMPANY or CREATOR" },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "an account with this email already exists" },
      { status: 409 },
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role,
      ...(role === Role.COMPANY
        ? { company: { create: { name: name ?? email, sector: sector ?? "" } } }
        : {
            creatorProfile: {
              create: { bio: bio ?? "", sectors: [], portfolioUrls: [] },
            },
          }),
    },
    select: { id: true, email: true, role: true },
  });

  return NextResponse.json(user, { status: 201 });
}
