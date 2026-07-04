type BookingPayload = {
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  vehicle?: string;
  condition?: string;
  date?: string;
  time?: string;
  message?: string;
};

const ownerEmail = process.env.BOOKING_OWNER_EMAIL ?? "jcdetailinglucerne@gmail.com";
const fromEmail = process.env.BOOKING_FROM_EMAIL ?? "JC Detailing <onboarding@resend.dev>";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function requiredFields(payload: BookingPayload) {
  return [
    payload.name,
    payload.email,
    payload.phone,
    payload.service,
    payload.vehicle,
    payload.condition,
    payload.date,
    payload.time,
  ].every((value) => clean(value).length > 0);
}

function bookingSummary(payload: Required<BookingPayload>) {
  return [
    `Name: ${payload.name}`,
    `E-Mail: ${payload.email}`,
    `Telefon: ${payload.phone}`,
    `Leistung: ${payload.service}`,
    `Fahrzeug: ${payload.vehicle}`,
    `Zustand: ${payload.condition}`,
    `Wunschdatum: ${payload.date}`,
    `Wunschzeit: ${payload.time}`,
    `Nachricht: ${payload.message || "-"}`,
  ].join("\n");
}

async function sendEmail({ to, subject, text }: { to: string; subject: string; text: string }) {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    throw new Error("Missing RESEND_API_KEY");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to,
      subject,
      text,
    }),
  });

  if (!response.ok) {
    throw new Error("Email provider rejected the request");
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BookingPayload;
    const payload = {
      name: clean(body.name),
      email: clean(body.email),
      phone: clean(body.phone),
      service: clean(body.service),
      vehicle: clean(body.vehicle),
      condition: clean(body.condition),
      date: clean(body.date),
      time: clean(body.time),
      message: clean(body.message),
    };

    if (!requiredFields(payload)) {
      return Response.json({ message: "Bitte alle Pflichtfelder ausfuellen." }, { status: 400 });
    }

    const summary = bookingSummary(payload);

    await sendEmail({
      to: ownerEmail,
      subject: `Neue Buchungsanfrage: ${payload.service}`,
      text: `Neue Buchungsanfrage ueber die Website:\n\n${summary}`,
    });

    await sendEmail({
      to: payload.email,
      subject: "JC Detailing - Deine Anfrage ist eingegangen",
      text:
        `Hallo ${payload.name}\n\n` +
        "Danke fuer deine Anfrage bei JC Detailing. Wir pruefen deinen Wunschtermin und melden uns so schnell wie moeglich mit einer Bestaetigung oder einem Terminvorschlag.\n\n" +
        `Deine Angaben:\n\n${summary}\n\n` +
        "Freundliche Gruesse\nJC Detailing",
    });

    return Response.json({ message: "Anfrage gesendet." });
  } catch {
    return Response.json(
      { message: "Die Anfrage konnte nicht gesendet werden. Bitte versuche es spaeter erneut." },
      { status: 500 },
    );
  }
}
