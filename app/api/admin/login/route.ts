import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, createAdminSession } from "@/app/lib/adminSession";
import { hashPassword, verifyPassword } from "@/app/lib/password";
import { prisma } from "@/app/(admin)/admin/_lib/prisma";
import { loginRateLimit } from "@/app/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const identifier = forwardedFor?.split(",")[0]?.trim() ?? "unknown";

    const { success, reset } = await loginRateLimit.limit(identifier);

    if (!success) {
      const retryAfterSeconds = Math.max(0, Math.ceil((reset - Date.now()) / 1000));

      return NextResponse.json(
        { error: "Zu viele Versuche. Bitte später erneut versuchen.", retryAfter: retryAfterSeconds },
        { status: 429, headers: { "Retry-After": retryAfterSeconds.toString() } },
      );
    }

    const body = await request.json().catch(() => null);
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ error: "Bitte E-Mail und Passwort eingeben." }, { status: 400 });
    }

    const adminCount = await prisma.user.count();

    if (adminCount === 0) {
      const envAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
      const envAdminPassword = process.env.ADMIN_PASSWORD;

      if (!envAdminEmail || !envAdminPassword) {
        return NextResponse.json(
          { error: "ADMIN_EMAIL und ADMIN_PASSWORD fehlen in .env.local." },
          { status: 500 },
        );
      }

      if (email !== envAdminEmail || password !== envAdminPassword) {
        return NextResponse.json({ error: "Login ist nicht korrekt." }, { status: 401 });
      }

      try {
        await prisma.user.create({
          data: {
            email: envAdminEmail,
            name: "JC Detailing Admin",
            password: hashPassword(envAdminPassword),
            role: "ADMIN",
          },
        });
      } catch {
        // Another request bootstrapped the admin first — fall through to normal lookup.
      }
    }

    const user = await prisma.user.findUnique({ where: { email } });

    let passwordValid = false;
    try {
      passwordValid = !!user && verifyPassword(password, user.password);
    } catch {
      passwordValid = false;
    }

    if (!user || !passwordValid) {
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
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json({ error: "Ein Fehler ist aufgetreten." }, { status: 500 });
  }
}