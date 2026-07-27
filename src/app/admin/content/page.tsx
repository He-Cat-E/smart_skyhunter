import { collectionGet } from "@/lib/cache";
import { ContentEditor } from "@/components/admin/ContentEditor";
import {
  PERSONAS,
  MEMBERS,
  COMMUNITY_STATS,
  ROLE_TRACKS,
  PRINCIPLES,
  OFFERINGS,
  JOIN_STEPS,
  PARTNERS,
} from "@/lib/community";
import { STORIES, RESOURCES, STEPS } from "@/lib/content";

const COLLECTIONS = [
  { key: "principles", label: "Principles", seed: PRINCIPLES },
  { key: "offerings", label: "What we offer", seed: OFFERINGS },
  { key: "partners", label: "Contract partners", seed: PARTNERS },
  { key: "personas", label: "Who it's for", seed: PERSONAS },
  { key: "members", label: "Members", seed: MEMBERS },
  { key: "community_stats", label: "Community stats", seed: COMMUNITY_STATS },
  { key: "role_tracks", label: "Role tracks", seed: ROLE_TRACKS },
  { key: "join_steps", label: "How it works", seed: JOIN_STEPS },
  { key: "stories", label: "Stories", seed: STORIES },
  { key: "resources", label: "Reskill / support", seed: RESOURCES },
  { key: "steps", label: "Home steps", seed: STEPS },
] as const;

export default async function AdminContentPage() {
  const collections = await Promise.all(
    COLLECTIONS.map(async (c) => ({
      key: c.key,
      label: c.label,
      value: await collectionGet(c.key, c.seed),
    })),
  );

  return (
    <div>
      <h2 className="mb-1 font-display text-xl font-semibold text-chrome">
        Site &amp; community content
      </h2>
      <p className="mb-4 text-sm text-fog">
        Edit any section as JSON. Changes go live immediately and fall back to
        the built-in defaults if cleared.
      </p>
      <ContentEditor collections={collections} />
    </div>
  );
}
