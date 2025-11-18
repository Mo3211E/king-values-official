// app/api/auth/discord/login/route.js
import { NextResponse } from "next/server";

/**
 * ENV VARS YOU MUST ADD:
 *
 * DISCORD_CLIENT_ID       = your Discord application client id
 * DISCORD_REDIRECT_URI    = https://your-domain.com/api/auth/discord/callback
 * DISCORD_GUILD_ID        = your Discord server id (for membership check later)
 *
 * (we’ll use DISCORD_GUILD_ID in the callback route)
 */

export async function GET() {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    console.error("Missing Discord OAuth env vars");
    return NextResponse.json(
      { error: "Discord login not configured." },
      { status: 500 }
    );
  }

  // scopes: identify + guilds so we can check if they’re in your server
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify guilds",
    prompt: "consent",
  });

  const url = `https://discord.com/oauth2/authorize?${params.toString()}`;

  return NextResponse.redirect(url);
}
