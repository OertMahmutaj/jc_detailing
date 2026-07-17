type ResendAttachment = {
  content: string;
  filename: string;
};

type SendResendEmailInput = {
  attachments?: ResendAttachment[];
  html?: string;
  replyTo?: string;
  subject: string;
  text: string;
  to: string;
};

export async function sendResendEmail({
  attachments = [],
  html,
  replyTo,
  subject,
  text,
  to,
}: SendResendEmailInput) {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    throw new Error("RESEND_API_KEY is missing.");
  }

  const from =
    process.env.BOOKING_FROM_EMAIL ?? "JC Detailing <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      attachments,
      from,
      html,
      reply_to:
        replyTo ?? process.env.BOOKING_OWNER_EMAIL ?? "jcdetailinglucerne@gmail.com",
      subject,
      text,
      to,
    }),
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend email failed: ${errorText}`);
  }
}
