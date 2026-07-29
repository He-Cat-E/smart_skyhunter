import { NextResponse } from "next/server";
import { getCurrentUser, isAdminUser, findUser } from "@/lib/auth";
import {
  conversationsForUser,
  conversationsAll,
  conversationReads,
  unreadCount,
} from "@/lib/store";
import { anyoneTyping } from "@/lib/typing";

export const runtime = "nodejs";

// List the current user's conversations (admins see all — they're support).
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, conversations: [] }, { status: 401 });
  }
  const admin = isAdminUser(user);
  const me = user.email.toLowerCase();
  const convs = admin
    ? await conversationsAll()
    : await conversationsForUser(user.email);

  const reads = await conversationReads(me);

  const conversations = await Promise.all(
    convs.map(async (c) => {
      let display: string;
      let avatarUrl = ""; // the other party's photo, shown in the list/header
      if (c.kind === "support") {
        if (admin) {
          const m = await findUser(c.participants[0] ?? "");
          display = m ? `${m.name} · Support` : "Support chat";
          avatarUrl = m?.profile.avatarUrl ?? "";
        } else {
          display = "SkyHunter Support";
        }
      } else {
        const other = c.participants.find((p) => p !== me);
        const m = other ? await findUser(other) : null;
        display = m ? m.name : (other ?? "Member");
        avatarUrl = m?.profile.avatarUrl ?? "";
      }
      // Contract peer's email — lets the list avatar open their profile.
      const peerEmail =
        c.kind === "contract" ? (c.participants.find((p) => p !== me) ?? null) : null;
      return {
        id: c.id,
        kind: c.kind,
        display,
        avatarUrl,
        title: c.title,
        lastMessage: c.lastMessage,
        lastMessageAt: c.lastMessageAt,
        typing: anyoneTyping(c.id, me),
        peerEmail,
        unread: await unreadCount(c.id, me, reads[c.id]),
      };
    }),
  );

  return NextResponse.json({ ok: true, conversations, me, isAdmin: admin });
}
