import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/(admin)/admin/_lib/prisma";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim();

  if (!token) {
    return NextResponse.json(
      { error: "Reset-Link fehlt.", reason: "missing" },
      { status: 400 },
    );
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      email: true,
      expiresAt: true,
      usedAt: true,
    },
  });

  if (!resetToken) {
    return NextResponse.json(
      { error: "Dieser Reset-Link ist nicht mehr gueltig.", reason: "invalid" },
      { status: 400 },
    );
  }

  if (resetToken.usedAt) {
    return NextResponse.json(
      {
        email: resetToken.email,
        error: "Dieser Reset-Link wurde bereits verwendet. Bitte fordere einen neuen Link an.",
        reason: "used",
      },
      { status: 400 },
    );
  }

  if (resetToken.expiresAt < new Date()) {
    return NextResponse.json(
      {
        email: resetToken.email,
        error: "Dieser Reset-Link ist abgelaufen. Bitte fordere einen neuen Link an.",
        reason: "expired",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
