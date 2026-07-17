import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/(admin)/admin/_lib/prisma";
import { ADMIN_SESSION_COOKIE, createAdminSession } from "@/app/lib/adminSession";
import { hashPassword } from "@/app/lib/password";
import { loginRateLimit } from "@/app/lib/rateLimit";

const ADMIN_REGISTER_CODE = process.env.ADMIN_REGISTER_CODE ?? "9586354";

export async function POST(request: NextRequest) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const identifier = `register:${forwardedFor?.split(",")[0]?.trim() ?? "unknown"}`;
    const { success, reset } = await loginRateLimit.limit(identifier);

    if (!success) {
      const retryAfterSeconds = Math.max(0, Math.ceil((reset - Date.now()) / 1000));
      return NextResponse.json(
        { error: "Zu viele Versuche. Bitte spaeter erneut versuchen.", retryAfter: retryAfterSeconds },
        { status: 429, headers: { "Retry-After": retryAfterSeconds.toString() } },
      );
    }

    const body = await request.json().catch(() => null);
    const code = String(body?.code ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const name = String(body?.name ?? "JC Detailing Admin").trim();
    const password = String(body?.password ?? "");
    const confirmPassword = String(body?.confirmPassword ?? "");

    if (code !== ADMIN_REGISTER_CODE) {
      return NextResponse.json({ error: "Registrierungscode ist nicht korrekt." }, { status: 401 });
    }

    if (!email || !password || password.length < 8) {
      return NextResponse.json(
        { error: "Bitte E-Mail und ein Passwort mit mindestens 8 Zeichen eingeben." },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Die Passwoerter stimmen nicht ueberein." }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: name || "JC Detailing Admin",
        password: hashPassword(password),
        role: "ADMIN",
      },
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
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Diese E-Mail ist bereits registriert." }, { status: 409 });
    }

    return NextResponse.json({ error: "Registrierung fehlgeschlagen." }, { status: 500 });
  }
}
