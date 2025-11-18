import { NextResponse } from "next/server";

function buildThreadName(trade) {
  const getNames = (arr = []) =>
    (arr || [])
      .map((u) => u?.Name || u?.name || u?.inGameName || u?.title)
      .filter(Boolean)
      .slice(0, 4); // cap so names don't get too long

  const offerNames = getNames(trade.player1);
  const requestNames = getNames(trade.player2);

  if (offerNames.length || requestNames.length) {
    const lhs = offerNames.join(", ") || "Offer";
    const rhs = requestNames.join(", ") || "Request";
    return `Trade: ${lhs} FOR ${rhs}`;
  }

  if (trade.title) return `Trade: ${trade.title}`;
  return "Trade Discussion";
}

function buildSummary(trade) {
  const getNames = (arr = []) =>
    (arr || [])
      .map((u) => u?.Name || u?.name || u?.inGameName || u?.title)
      .filter(Boolean)
      .join(", ");

  const offerNames = getNames(trade.player1) || "—";
  const requestNames = getNames(trade.player2) || "—";

  return `**Offer:** ${offerNames}\n**Request:** ${requestNames}\n**Verdict:** ${
    trade.verdict || "N/A"
  }`;
}

async function createDM(botToken, userId, content) {
  // Create DM channel
  const dmRes = await fetch("https://discord.com/api/users/@me/channels", {
    method: "POST",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ recipient_id: userId }),
  });

  const dm = await dmRes.json();
  if (!dm?.id) return;

  // Send message in DM
  await fetch(`https://discord.com/api/channels/${dm.id}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      trade, // full trade object from frontend
      viewerDiscordId,
      viewerDiscordName,
    } = body;

    if (!trade?._id) {
      return NextResponse.json(
        { error: "Missing trade data" },
        { status: 400 }
      );
    }

    const botToken = process.env.DISCORD_BOT_TOKEN;
    const guildId = process.env.DISCORD_GUILD_ID;
    const baseChannelId = process.env.DISCORD_THREAD_CHANNEL_ID;

    if (!botToken || !guildId || !baseChannelId) {
      console.error("Missing Discord env vars");
      return NextResponse.json(
        { error: "Discord bot not configured" },
        { status: 500 }
      );
    }

    // Poster info (from trade)
    const posterId = trade.accountId; // Discord user id if logged-in when posting
    const posterName = trade.accountName || trade.discord || "Unknown";

    // Viewer info (current user)
    const viewerId = viewerDiscordId;
    const viewerName = viewerDiscordName || "Viewer";

    if (!viewerId) {
      return NextResponse.json(
        { error: "Viewer must be logged in with Discord" },
        { status: 401 }
      );
    }

    // Build auto name + summary
    const threadName = buildThreadName(trade).slice(0, 90); // Discord name limit
    const summary = buildSummary(trade);

    // 1. Create private thread in your configured channel
    const threadRes = await fetch(
      `https://discord.com/api/channels/${baseChannelId}/threads`,
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${botToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: threadName,
          type: 12, // private thread
          auto_archive_duration: 10080, // 7 days (in minutes)
          invitable: false,
        }),
      }
    );

    const thread = await threadRes.json();

    if (!thread?.id) {
      console.error("Thread creation failed:", thread);
      return NextResponse.json(
        { error: "Failed to create Discord thread" },
        { status: 500 }
      );
    }

    const threadId = thread.id;

    // 2. Add participants to the thread (only if we know their ids)
    const addMember = async (userId) => {
      if (!userId) return;
      await fetch(
        `https://discord.com/api/channels/${threadId}/thread-members/${userId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bot ${botToken}` },
        }
      );
    };

    await addMember(posterId);
    await addMember(viewerId);

    // 3. Post an intro message in the thread
    const link = `https://discord.com/channels/${guildId}/${threadId}`;
    await fetch(`https://discord.com/api/channels/${threadId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: [
          `🔔 **Trade Discussion Started!**`,
          posterId ? `<@${posterId}>` : posterName,
          viewerId ? `<@${viewerId}>` : viewerName,
          "",
          summary,
          "",
          `Thread link: ${link}`,
          "",
          `_This thread will auto-archive after 7 days of inactivity._`,
        ].join("\n"),
      }),
    });

    // 4. DM both users (if we know their Discord IDs)
    const dmText = [
      `🔔 A trade discussion thread was created for you on **King Values**.`,
      "",
      summary,
      "",
      `Open it here: ${link}`,
      "",
      `_The thread will auto-archive after 7 days of inactivity._`,
    ].join("\n");

    if (posterId) {
      await createDM(botToken, posterId, dmText);
    }
    if (viewerId) {
      await createDM(botToken, viewerId, dmText);
    }

    return NextResponse.json({ ok: true, threadId, link }, { status: 200 });
  } catch (err) {
    console.error("start-thread error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
