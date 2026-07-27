"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner, Check } from "@/components/icons";

type Item = Record<string, unknown>;
type Collection = { key: string; label: string; value: unknown };
type Save = "idle" | "saving" | "saved" | "error";

// Friendlier labels for cryptic keys.
const LABELS: Record<string, string> = {
  n: "Value",
  l: "Caption",
  to: "New roles (one per line)",
  from: "Current roles",
  humanEdge: "Why it holds up",
  monthsToRehire: "Months to re-hire",
  initials: "Initials",
  cta: "Button text",
  href: "Link (URL)",
};

// Known enum-ish fields get a dropdown.
const ENUMS: Record<string, string[]> = {
  icon: ["spark", "shield", "users", "briefcase", "book", "lifebuoy"],
  accent: ["clay", "sage", "sky"],
  kind: ["Reskilling", "Financial", "Government", "Mental health"],
  cost: ["Free", "Free + paid", "Low-cost"],
};

// Fields that deserve a textarea.
const LONG = new Set([
  "body",
  "blurb",
  "quote",
  "summary",
  "humanEdge",
  "from",
  "description",
  "was",
  "now",
]);

function humanize(k: string) {
  return (
    LABELS[k] ??
    k
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (c) => c.toUpperCase())
      .replace(/\s+/g, " ")
      .trim()
  );
}

function blankLike(v: unknown): unknown {
  if (typeof v === "number") return 0;
  if (Array.isArray(v)) return [];
  return "";
}

const inputCls =
  "w-full rounded-lg border border-steel-line bg-void px-3 py-2 text-sm text-chrome outline-none transition-colors placeholder:text-faint focus:border-blue-500";

export function ContentEditor({ collections }: { collections: Collection[] }) {
  const router = useRouter();
  const [key, setKey] = useState(collections[0]?.key ?? "");
  const initialItems = Array.isArray(collections[0]?.value)
    ? (collections[0]!.value as Item[])
    : [];
  const [items, setItems] = useState<Item[]>(initialItems);
  const [original, setOriginal] = useState(JSON.stringify(initialItems));
  const [mode, setMode] = useState<"form" | "json">("form");
  const [jsonText, setJsonText] = useState("");
  const [save, setSave] = useState<Save>("idle");
  const [message, setMessage] = useState("");

  const active = collections.find((c) => c.key === key);

  // A template row (keys of the first item) so "Add" works even when emptied.
  const template = useMemo(() => {
    const first = items[0] ?? initialItems[0];
    if (!first) return null;
    const t: Item = {};
    for (const k of Object.keys(first)) t[k] = blankLike(first[k]);
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const jsonValid = useMemo(() => {
    if (mode !== "json") return true;
    try {
      JSON.parse(jsonText);
      return true;
    } catch {
      return false;
    }
  }, [mode, jsonText]);

  const currentValue = (): unknown => {
    if (mode === "json") {
      try {
        return JSON.parse(jsonText);
      } catch {
        return undefined;
      }
    }
    return items;
  };
  const currentJSON = JSON.stringify(currentValue() ?? null);
  const dirty = currentJSON !== original && currentJSON !== "null";

  function select(c: Collection) {
    const arr = Array.isArray(c.value) ? (c.value as Item[]) : [];
    setKey(c.key);
    setItems(arr.map((it) => ({ ...it })));
    setOriginal(JSON.stringify(arr));
    setMode(Array.isArray(c.value) ? "form" : "json");
    setJsonText(JSON.stringify(c.value ?? null, null, 2));
    setSave("idle");
    setMessage("");
  }

  function edited() {
    if (save === "saved" || save === "error") setSave("idle");
  }
  function setField(i: number, k: string, v: unknown) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)));
    edited();
  }
  function addItem() {
    if (!template) return;
    setItems((prev) => [...prev, { ...template }]);
    edited();
  }
  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
    edited();
  }
  function move(i: number, dir: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    edited();
  }

  function toggleMode() {
    if (mode === "form") {
      setJsonText(JSON.stringify(items, null, 2));
      setMode("json");
    } else {
      try {
        const parsed = JSON.parse(jsonText);
        if (Array.isArray(parsed)) setItems(parsed as Item[]);
      } catch {
        /* keep items */
      }
      setMode("form");
    }
  }

  async function submit() {
    const value = currentValue();
    if (value === undefined || !dirty) return;
    setSave("saving");
    setMessage("");
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Save failed.");
      setOriginal(JSON.stringify(value));
      setSave("saved");
      router.refresh();
      setTimeout(() => setSave((s) => (s === "saved" ? "idle" : s)), 2500);
    } catch (err) {
      setSave("error");
      setMessage(err instanceof Error ? err.message : "Save failed.");
    }
  }

  function revert() {
    const arr = JSON.parse(original) as Item[];
    setItems(arr);
    setJsonText(JSON.stringify(arr, null, 2));
    setSave("idle");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      {/* Sections */}
      <aside>
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-fog">
          Sections
        </p>
        <ul className="space-y-1">
          {collections.map((c) => (
            <li key={c.key}>
              <button
                onClick={() => select(c)}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  key === c.key
                    ? "border-blue-500/60 bg-blue-500/5 text-chrome"
                    : "border-transparent text-mist hover:bg-abyss hover:text-chrome"
                }`}
              >
                <span>{c.label}</span>
                {Array.isArray(c.value) && (
                  <span className="rounded bg-steel px-1.5 py-0.5 text-[0.65rem] font-medium text-fog">
                    {c.value.length}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Editor */}
      <div className="overflow-hidden rounded-2xl border border-steel-line bg-navy">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-steel-line px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="font-display text-sm font-semibold text-chrome">
              {active?.label}
            </span>
            <span className="text-xs text-fog">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {mode === "form" && template && (
              <button
                onClick={addItem}
                className="rounded-md bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-500 hover:bg-blue-500/20"
              >
                + Add item
              </button>
            )}
            <button
              onClick={toggleMode}
              className="rounded-md border border-steel-line px-2.5 py-1 text-xs font-medium text-mist transition-colors hover:text-chrome"
            >
              {mode === "form" ? "Advanced (JSON)" : "Form view"}
            </button>
          </div>
        </div>

        {/* Body */}
        {mode === "form" ? (
          <div className="max-h-[520px] space-y-4 overflow-y-auto p-4">
            {items.length === 0 && (
              <p className="py-8 text-center text-sm text-fog">
                No items. Use “+ Add item”.
              </p>
            )}
            {items.map((item, i) => (
              <div key={i} className="rounded-xl border border-steel-line bg-void/40 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-fog">
                    Item {i + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="rounded px-1.5 text-fog hover:text-chrome disabled:opacity-30" aria-label="Move up">↑</button>
                    <button onClick={() => move(i, 1)} disabled={i === items.length - 1} className="rounded px-1.5 text-fog hover:text-chrome disabled:opacity-30" aria-label="Move down">↓</button>
                    <button onClick={() => removeItem(i)} className="rounded px-1.5 text-fog hover:text-red-600" aria-label="Remove">✕</button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {Object.keys(item).map((k) => {
                    const v = item[k];
                    const isArr = Array.isArray(v);
                    const isLong = LONG.has(k) || (typeof v === "string" && v.length > 80);
                    const full = isArr || isLong;
                    return (
                      <div key={k} className={full ? "sm:col-span-2" : ""}>
                        <label className="mb-1 block text-xs font-medium text-fog">
                          {humanize(k)}
                        </label>
                        {ENUMS[k] ? (
                          <select
                            className={inputCls}
                            value={String(v ?? "")}
                            onChange={(e) => setField(i, k, e.target.value)}
                          >
                            {ENUMS[k].map((o) => (
                              <option key={o}>{o}</option>
                            ))}
                          </select>
                        ) : isArr ? (
                          <textarea
                            className={`${inputCls} h-20`}
                            value={(v as string[]).join("\n")}
                            onChange={(e) =>
                              setField(i, k, e.target.value.split("\n"))
                            }
                          />
                        ) : typeof v === "number" ? (
                          <input
                            type="number"
                            className={inputCls}
                            value={v as number}
                            onChange={(e) => setField(i, k, Number(e.target.value) || 0)}
                          />
                        ) : isLong ? (
                          <textarea
                            className={`${inputCls} h-20`}
                            value={String(v ?? "")}
                            onChange={(e) => setField(i, k, e.target.value)}
                          />
                        ) : (
                          <input
                            className={inputCls}
                            value={String(v ?? "")}
                            onChange={(e) => setField(i, k, e.target.value)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <textarea
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              edited();
            }}
            spellCheck={false}
            className="block h-[480px] w-full resize-y bg-void p-4 font-mono text-[0.8rem] leading-relaxed text-chrome outline-none"
          />
        )}

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-steel-line px-4 py-3">
          <span className="text-xs text-fog">
            {save === "error" ? (
              <span className="text-red-600">{message}</span>
            ) : mode === "json" && !jsonValid ? (
              <span className="text-red-600">Invalid JSON</span>
            ) : dirty ? (
              "Unsaved changes"
            ) : (
              "All changes saved"
            )}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={revert}
              disabled={!dirty || save === "saving"}
              className="rounded-lg border border-steel-line px-4 py-2 text-sm font-medium text-mist transition-colors hover:text-chrome disabled:opacity-40"
            >
              Revert
            </button>
            <button
              onClick={submit}
              disabled={!dirty || save === "saving" || (mode === "json" && !jsonValid)}
              className="inline-flex min-w-[8.5rem] items-center justify-center gap-2 rounded-lg bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {save === "saving" && <Spinner className="h-4 w-4" />}
              {save === "saved" && <Check className="h-4 w-4" />}
              {save === "saving" ? "Saving…" : save === "saved" ? "Saved" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
