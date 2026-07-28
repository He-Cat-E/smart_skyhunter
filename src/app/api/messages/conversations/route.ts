import { NextResponse } from "next/server";
import { getCurrentUser, isAdminUser, findUser } from "@/lib/auth";
import { conversationsForUser, conversationsAll } from "@/lib/store";

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

  const conversations = await Promise.all(
    convs.map(async (c) => {
      let display: string;
      if (c.kind === "support") {
        if (admin) {
          const m = await findUser(c.participants[0] ?? "");
          display = m ? `${m.name} · Support` : "Support chat";
        } else {
          display = "SkyHunter Support";
        }
      } else {
        const other = c.participants.find((p) => p !== me);
        const m = other ? await findUser(other) : null;
        display = m ? m.name : (other ?? "Member");
      }
      return {
        id: c.id,
        kind: c.kind,
        display,
        title: c.title,
        lastMessage: c.lastMessage,
        lastMessageAt: c.lastMessageAt,
      };
    }),
  );

  return NextResponse.json({ ok: true, conversations, me, isAdmin: admin });
}
