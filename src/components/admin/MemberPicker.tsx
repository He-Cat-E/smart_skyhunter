"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "@/components/icons";

type Member = { email: string; name: string };

const label = (m: Member) => (m.name ? `${m.name} — ${m.email}` : m.email);

// Searchable member combobox — type to filter by name or email, click to pick.
// Controlled by `value` (the selected email); calls onChange with the email
// (or "" when the admin edits the text without picking a match yet).
export function MemberPicker({
  members,
  value,
  onChange,
}: {
  members: Member[];
  value: string;
  onChange: (email: string) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(() => {
    const m = members.find((x) => x.email === value);
    return m ? label(m) : "";
  });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? members.filter((m) => `${m.name} ${m.email}`.toLowerCase().includes(q))
      : members;
    return list.slice(0, 50);
  }, [members, query]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pick(m: Member) {
    onChange(m.email);
    setQuery(label(m));
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[active]) pick(filtered[active]);
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <input
        type="text"
        value={query}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder="Search by name or email…"
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
          if (value) onChange(""); // editing invalidates the current pick
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="w-full rounded-lg border border-steel-line bg-void px-3.5 py-2.5 pr-9 text-sm text-chrome outline-none transition-colors placeholder:text-faint focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fog" />

      {open && (
        <div className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-steel-line bg-void p-1 shadow-xl">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-sm text-fog">No members match.</p>
          ) : (
            filtered.map((m, i) => (
              <button
                type="button"
                key={m.email}
                onClick={() => pick(m)}
                onMouseEnter={() => setActive(i)}
                className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  i === active ? "bg-abyss text-chrome" : "text-mist"
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium text-chrome">
                    {m.name || m.email}
                  </span>
                  {m.name && (
                    <span className="block truncate text-xs text-fog">
                      {m.email}
                    </span>
                  )}
                </span>
                {m.email === value && (
                  <Check className="h-4 w-4 shrink-0 text-blue-500" />
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
