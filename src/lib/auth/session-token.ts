import type { Session } from "@/types/auth";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function encodeBase64Url(value: Uint8Array | string): string {
  const bytes = typeof value === "string" ? encoder.encode(value) : value;
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function decodeBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);

  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function importKey(secret: string): Promise<CryptoKey> {
  return globalThis.crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

/** Creates a signed, compact session token. The payload is not encrypted. */
export async function createSessionToken(session: Session, secret: string): Promise<string> {
  const payload = encodeBase64Url(JSON.stringify(session));
  const signature = await globalThis.crypto.subtle.sign("HMAC", await importKey(secret), encoder.encode(payload));

  return `${payload}.${encodeBase64Url(new Uint8Array(signature))}`;
}

/** Verifies the signature and expiry of a session token. Returns null when invalid. */
export async function verifySessionToken(token: string, secret: string): Promise<Session | null> {
  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return null;
  }

  try {
    const isValid = await globalThis.crypto.subtle.verify(
      "HMAC",
      await importKey(secret),
      decodeBase64Url(signature),
      encoder.encode(payload),
    );

    if (!isValid) {
      return null;
    }

    const session = JSON.parse(decoder.decode(decodeBase64Url(payload))) as Session;

    if (!session.user.id || typeof session.expiresAt !== "number" || session.expiresAt <= Date.now()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}
