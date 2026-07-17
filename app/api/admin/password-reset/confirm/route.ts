import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/(admin)/admin/_lib/prisma";
import { ADMIN_SESSION_COOKIE, createAdminSession } from "@/app/lib/adminSession";
import { hashPassword } from "@/app/lib/password";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const token = String(body?.token ?? "").trim();
    const password = String(body?.password ?? "");
    const confirmPassword = String(body?.confirmPassword ?? "");

    if (!token || password.length < 8) {
      return NextResponse.json(
        { error: "Bitte ein Passwort mit mindestens 8 Zeichen eingeben." },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Die Passwoerter stimmen nicht ueberein." }, { status: 400 });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: true },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: "Dieser Reset-Link ist nicht mehr gueltig." }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashPassword(password) },
    });

    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    });

    const session = await createAdminSession({
      email: user.email,
      id: user.id,
      role: user.role,
    });
    const response = NextResponse.json({ ok: true });

    response.cookies.set({
      httpOnly: true,
      maxAge: 60 * 60 * 12,
      name: ADMIN_SESSION_COOKIE,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      value: session,
    });

    return response;
  } catch (error) {
    console.error("Password reset confirm failed:", error);
    return NextResponse.json({ error: "Passwort konnte nicht geaendert werden." }, { status: 500 });
  }
}
