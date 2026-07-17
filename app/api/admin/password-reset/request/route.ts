import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/(admin)/admin/_lib/prisma";
import { loginRateLimit } from "@/app/lib/rateLimit";
import { sendResendEmail } from "@/app/lib/resendEmail";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

const PASSWORD_RESET_TTL_MS = 1000 * 60 * 30;

export async function POST(request: NextRequest) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const identifier = `password-reset:${forwardedFor?.split(",")[0]?.trim() ?? "unknown"}`;
    const { success, reset } = await loginRateLimit.limit(identifier);

    if (!success) {
      const retryAfterSeconds = Math.max(0, Math.ceil((reset - Date.now()) / 1000));
      return NextResponse.json(
        { error: "Zu viele Versuche. Bitte spaeter erneut versuchen.", retryAfter: retryAfterSeconds },
        { status: 429, headers: { "Retry-After": retryAfterSeconds.toString() } },
      );
    }

    const body = await request.json().catch(() => null);
    const email = String(body?.email ?? "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Bitte E-Mail eingeben." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

      await prisma.passwordResetToken.updateMany({
        where: {
          userId: user.id,
          usedAt: null,
        },
        data: { usedAt: new Date() },
      });

      await prisma.passwordResetToken.create({
        data: {
          email,
          expiresAt,
          tokenHash: hashToken(token),
          userId: user.id,
        },
      });

      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        `${request.nextUrl.protocol}//${request.nextUrl.host}`;
      const resetUrl = `${baseUrl}/admin/login?reset=${token}`;

      await sendResendEmail({
        html: `Klicken Sie auf diesen Link, um Ihr Admin-Passwort zurueckzusetzen:<br /><br /><a href="${resetUrl}">${resetUrl}</a><br /><br />Der Link ist 30 Minuten gueltig.`,
        subject: "JC Detailing Admin Passwort zuruecksetzen",
        text: `Klicken Sie auf diesen Link, um Ihr Admin-Passwort zurueckzusetzen:\n\n${resetUrl}\n\nDer Link ist 30 Minuten gueltig.`,
        to: email,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Password reset request failed:", error);
    return NextResponse.json({ error: "Reset-Link konnte nicht gesendet werden." }, { status: 500 });
  }
}
