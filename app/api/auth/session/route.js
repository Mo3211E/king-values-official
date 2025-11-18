// app/api/auth/session/route.js
import { NextResponse } from "next/server";
import { readSessionFromRequest } from "../../_lib/session";

export async function GET(req) {
  const session = readSessionFromRequest(req);
  if (!session || !session.loggedIn) {
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }

  return NextResponse.json(
    {
      loggedIn: true,
      user: {
        id: session.accountId,
        name: session.accountName,
        type: session.accountType,
        inGuild: !!session.inGuild,
      },
    },
    { status: 200 }
  );
}
