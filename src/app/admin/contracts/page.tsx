import { conversationsAll, listUsers, chatTablesReady } from "@/lib/store";
import { findUser } from "@/lib/auth";
import {
  ContractsManager,
  type ContractRow,
} from "@/components/admin/ContractsManager";
import { ChatSetupBanner } from "@/components/admin/ChatSetupBanner";

export const dynamic = "force-dynamic";

export default async function AdminContractsPage() {
  const [all, users, chatReady] = await Promise.all([
    conversationsAll(),
    listUsers(),
    chatTablesReady(),
  ]);
  const raw = all.filter((c) => c.kind === "contract");

  const contracts: ContractRow[] = await Promise.all(
    raw.map(async (c) => {
      const [ea, eb] = c.participants;
      const [ua, ub] = await Promise.all([
        ea ? findUser(ea) : null,
        eb ? findUser(eb) : null,
      ]);
      return {
        id: c.id,
        memberA: { name: ua?.name ?? ea ?? "—", email: ea ?? "" },
        memberB: { name: ub?.name ?? eb ?? "—", email: eb ?? "" },
        title: c.title,
        createdAt: c.createdAt,
        lastMessage: c.lastMessage,
        lastMessageAt: c.lastMessageAt,
      };
    }),
  );

  const members = users
    .filter((u) => !u.profile?.suspended)
    .map((u) => ({ email: u.email, name: u.name }));

  return (
    <div>
      <h2 className="mb-1 font-display text-xl font-semibold text-chrome">
        Contracts
      </h2>
      <p className="mb-5 max-w-2xl text-sm text-fog">
        Member-to-member contract matches. Connect two members in a private
        real-time chat, open the conversation, or close a match.
      </p>

      {!chatReady && <ChatSetupBanner />}

      <ContractsManager contracts={contracts} members={members} />
    </div>
  );
}
