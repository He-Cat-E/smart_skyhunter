import { NextResponse } from "next/server";
import { getCurrentUser, isAdminUser, findUser } from "@/lib/auth";
import {
  conversationGet,
  messagesList,
  messageAdd,
  type Conversation,
} from "@/lib/store";
import { notifyUser, notifyAdmins } from "@/lib/notify";

export const runtime = "nodejs";

function canAccess(conv: Conversation, email: string, admin: boolean): boolean {
  return admin || conv.participants.includes(email.toLowerCase());
}

// What the current viewer sees this conversation titled as.
async function displayFor(
  conv: Conversation,
  me: string,
  admin: boolean,
): Promise<string> {
  if (conv.kind === "support") {
    if (admin) {
      const m = await findUser(conv.participants[0] ?? "");
      return m ? `${m.name} · Support chat` : "Support chat";
    }
    return "SkyHunter Support";
  }
  const other = conv.participants.find((p) => p !== me);
  const m = other ? await findUser(other) : null;
  return m ? m.name : (other ?? "Member");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  const conv = await conversationGet(id);
  if (!conv) return NextResponse.json({ ok: false }, { status: 404 });

  const admin = isAdminUser(user);
  const me = user.email.toLowerCase();
  if (!canAccess(conv, me, admin)) {
    return NextResponse.json({ ok: false, error: "No access." }, { status: 403 });
  }

  const messages = await messagesList(id);
  return NextResponse.json({
    ok: true,
    me,
    conversation: {
      id: conv.id,
      kind: conv.kind,
      display: await displayFor(conv, me, admin),
    },
    messages,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const { id } = await params;
  const conv = await conversationGet(id);
  if (!conv) return NextResponse.json({ ok: false }, { status: 404 });

  const admin = isAdminUser(user);
  const me = user.email.toLowerCase();
  if (!canAccess(conv, me, admin)) {
    return NextResponse.json({ ok: false, error: "No access." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const text = String(body?.body ?? "").trim().slice(0, 4000);
  if (!text) {
    return NextResponse.json({ ok: false, error: "Empty message." }, { status: 400 });
  }

  // Admins speak for the support team in support chats.
  const senderName =
    admin && conv.kind === "support" ? "SkyHunter Support" : user.name;
  const message = await messageAdd(conv.id, me, senderName, text);

  // Notify the other side (best-effort).
  const preview = text.length > 90 ? text.slice(0, 90) + "…" : text;
  if (conv.kind === "support") {
    if (admin) {
      // support → the member
      await notifyUser(conv.participants[0] ?? "", {
        type: `message:${conv.id}`,
        title: "New message from SkyHunter Support",
        body: preview,
      });
    } else {
      // member → the support team
      await notifyAdmins({
        type: `message:${conv.id}`,
        title: `New message from ${user.name}`,
        body: preview,
      });
    }
  } else {
    // contract chat: notify the other participant
    const other = conv.participants.find((p) => p !== me);
    if (other) {
      await notifyUser(other, {
        type: `message:${conv.id}`,
        title: `New message from ${user.name}`,
        body: preview,
      });
    }
  }

  return NextResponse.json({ ok: true, message });
}
