// app/api/_lib/session.js
import crypto from "crypto";

const SESSION_COOKIE = "session";
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET env var is required");
}

function sign(value) {
  return crypto.createHmac("sha256", SESSION_SECRET).update(value).digest("hex");
}

export function signSessionCookie(payload) {
  const json = JSON.stringify(payload);
  const base = Buffer.from(json, "utf8").toString("base64url");
  const hmac = sign(base);
  return `${base}.${hmac}`;
}

export function verifySessionCookie(cookieValue) {
  if (!cookieValue) return null;
  const [base, hmac] = cookieValue.split(".");
  if (!base || !hmac) return null;
  const expected = sign(base);
  if (!crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expected))) {
    return null;
  }
  const json = Buffer.from(base, "base64url").toString("utf8");
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function readSessionFromRequest(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((part) => {
      const [k, ...rest] = part.trim().split("=");
      return [k, rest.join("=")];
    })
  );
  const raw = cookies[SESSION_COOKIE];
  if (!raw) return null;
  return verifySessionCookie(raw);
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
