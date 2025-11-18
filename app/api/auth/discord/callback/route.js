// app/api/auth/discord/callback/route.js
import { NextResponse } from "next/server";
import { readSessionFromRequest, signSessionCookie, SESSION_COOKIE_NAME } from '../_lib/session';

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    console.error("Discord callback error:", error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/trade-hub`);
  }

  // 1. Exchange code for access token
  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: DISCORD_REDIRECT_URI,
    }),
  });

  if (!tokenRes.ok) {
    console.error("Discord token exchange failed", await tokenRes.text());
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/trade-hub`);
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  // 2. Get user
  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!userRes.ok) {
    console.error("Failed to fetch user", await userRes.text());
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/trade-hub`);
  }

  const user = await userRes.json();

  // 3. Check guild membership
  let inGuild = false;
  try {
    const guildRes = await fetch("https://discord.com/api/users/@me/guilds", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (guildRes.ok) {
      const guilds = await guildRes.json();
      inGuild = guilds.some((g) => g.id === DISCORD_GUILD_ID);
    }
  } catch (err) {
    console.error("Guild check failed:", err);
  }

  // 4. Build session payload (THIS shape is what /api/trades & /api/manage/trades expect)
  const sessionPayload = {
    accountId: user.id,
    accountName: user.username,
    accountType: "discord",
    avatar: user.avatar,
    inGuild,
    loggedIn: true,
  };

  const signed = signSessionCookie(sessionPayload);

  const response = NextResponse.redirect(
    inGuild
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/trade-hub`
      : `${process.env.NEXT_PUBLIC_SITE_URL}/trade-hub?join=discord`
  );

  response.cookies.set(SESSION_COOKIE_NAME, signed, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return response;
}
