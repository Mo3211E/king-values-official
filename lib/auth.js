// lib/auth.js
import crypto from "crypto";

/**
 * The session cookie looks like:
 * base64( { json: "{...userData}", sig: "hash" } )
 *
 * This file:
 * 1. Reads it
 * 2. Verifies HMAC signature
 * 3. Returns the session payload (accountId, accountName, accountType)
 */

const SESSION_COOKIE_NAME = "session";

export function parseSessionCookie(cookieHeader = "") {
  try {
    if (!cookieHeader) return null;

    const cookies = Object.fromEntries(
      cookieHeader
        .split(";")
        .map((v) => v.trim().split("="))
        .filter(([k, v]) => k && v)
    );

    const raw = cookies[SESSION_COOKIE_NAME];
    if (!raw) return null;

    const decoded = Buffer.from(raw, "base64").toString("utf8");
    const parsed = JSON.parse(decoded);

    const { json, sig } = parsed;
    if (!json || !sig) return null;

    const secret = process.env.SESSION_SECRET || "";
    const actualSig = crypto
      .createHmac("sha256", secret)
      .update(json)
      .digest("hex");

    if (actualSig !== sig) {
      console.warn("⚠ Invalid session signature detected.");
      return null;
    }

    const data = JSON.parse(json);

    // Must include accountId + accountType
    if (!data.accountId || !data.accountType) {
      return null;
    }

    return data;
  } catch (err) {
    console.error("parseSessionCookie error:", err);
    return null;
  }
}

/**
 * Helper for Server Components:
 * await authFromRequest(request)
 */
export function authFromRequest(req) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    return parseSessionCookie(cookieHeader);
  } catch {
    return null;
  }
}

/**
 * Helper for API routes:
 * const auth = authFromHeaders(request.headers)
 */
export function authFromHeaders(headers) {
  try {
    const cookieHeader = headers.get("cookie") || "";
    return parseSessionCookie(cookieHeader);
  } catch {
    return null;
  }
}
