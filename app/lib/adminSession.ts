export const ADMIN_SESSION_COOKIE = "jc_admin_session";

type AdminSession = {
  email: string;
  exp: number;
  id: string;
  role: string;
};

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || "local-dev-admin-session-secret-change-me";
}

function base64UrlEncode(value: string) {
  return btoa(unescape(encodeURIComponent(value)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlEncodeBytes(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");

  return decodeURIComponent(escape(atob(padded)));
}

async function signPayload(payload: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSessionSecret()),
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));

  return base64UrlEncodeBytes(new Uint8Array(signature));
}

export async function createAdminSession(input: Omit<AdminSession, "exp">) {
  const session: AdminSession = {
    ...input,
    exp: Date.now() + 1000 * 60 * 60 * 12,
  };
  const payload = base64UrlEncode(JSON.stringify(session));
  const signature = await signPayload(payload);

  return `${payload}.${signature}`;
}

export async function verifyAdminSession(cookieValue?: string | null) {
  if (!cookieValue) return null;

  const [payload, signature] = cookieValue.split(".");
  if (!payload || !signature) return null;

  const expectedSignature = await signPayload(payload);
  if (signature !== expectedSignature) return null;

  try {
    const session = JSON.parse(base64UrlDecode(payload)) as AdminSession;
    if (!session.id || !session.email || !session.role || session.exp < Date.now()) return null;

    return session;
  } catch {
    return null;
  }
}
