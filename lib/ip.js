import crypto from "crypto";

export function getClientIp(req) {
  const xf = req.headers.get("x-forwarded-for") || "";
  const ip = xf.split(",")[0].trim() || req.headers.get("x-real-ip") || "0.0.0.0";
  return ip;
}

export function hashIp(ip) {
  const salt = process.env.IP_HASH_SALT || "default-salt-change-me";
  return crypto.createHmac("sha256", salt).update(ip).digest("hex");
}
