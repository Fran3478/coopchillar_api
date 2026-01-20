import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";

export function newRefreshToken() {
  return crypto.randomBytes(48).toString("base64url");
}

export async function hashToken(token) {
  return bcrypt.hash(token, 10);
}

export async function compareToken(token, hash) {
  return bcrypt.compare(token, hash);
}

export function refreshExpiryDate() {
  const d = new Date();
  d.setDate(d.getDate() + env.refresh.expiresDays);
  return d;
}

export function cookieOptions(path = "/v1/auth") {
  const opts = {
    httpOnly: true,
    secure: !!env.refresh.cookieSecure,
    sameSite: env.refresh.cookieSecure ? "none" : "lax",
    maxAge: env.refresh.expiresDays * 24 * 60 * 60 * 1000,
    path,
  };

  if (env.refresh.cookieDomain && String(env.refresh.cookieDomain).trim().length > 0) {
    opts.domain = env.refresh.cookieDomain;
  }

  return opts;
}
