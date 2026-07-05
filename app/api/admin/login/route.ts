import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, createAdminSession } from "@/app/lib/adminSession";
import { hashPassword, verifyPassword } from "@/app/lib/password";
import { prisma } from "@/app/(admin)/admin/_lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");

  if (!email || !password) {
    return NextResponse.json({ error: "Bitte E-Mail und Passwort eingeben." }, { status: 400 });
  }

  const adminCount = await prisma.user.count();
  const envAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const envAdminPassword = process.env.ADMIN_PASSWORD;

  if (adminCount === 0) {
    if (!envAdminEmail || !envAdminPassword) {
      return NextResponse.json(
        { error: "ADMIN_EMAIL und ADMIN_PASSWORD fehlen in .env.local." },
        { status: 500 },
      );
    }

    if (email !== envAdminEmail || password !== envAdminPassword) {
      return NextResponse.json({ error: "Login ist nicht korrekt." }, { status: 401 });
    }

    await prisma.user.create({
      data: {
        email: envAdminEmail,
        name: "JC Detailing Admin",
        password: hashPassword(envAdminPassword),
        role: "ADMIN",
      },
    });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !verifyPassword(password, user.password)) {
    return NextResponse.json({ error: "Login ist nicht korrekt." }, { status: 401 });
  }

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
}
