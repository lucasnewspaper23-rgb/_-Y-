"use client";

import { useMemo, useState } from "react";
import type { DocRecord } from "@/lib/types";
import { FilePlus2, FileText, Trash2, Copy, Search, FileStack } from "lucide-react";

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Sidebar({
  docs,
  activeId,
  onSelect,
  onCreate,
  onDelete,
  onDuplicate,
}: {
  docs: DocRecord[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter((d) => (d.title || "Untitled document").toLowerCase().includes(q));
  }, [docs, query]);

  return (
    <aside className="flex h-full w-64 flex-none flex-col border-r border-border-soft bg-surface-muted/60">
      <div className="flex flex-col gap-2.5 border-b border-border-soft p-3">
        <button
          type="button"
          onClick={onCreate}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-accent-500 to-accent-600 px-3 py-2 text-sm font-medium text-white shadow-sm shadow-accent-600/25 transition-all hover:shadow-md hover:shadow-accent-600/30 active:scale-[0.98]"
        >
          <FilePlus2 size={16} />
          New document
        </button>
        {docs.length > 3 && (
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents"
              className="w-full rounded-lg border border-border-soft bg-white py-1.5 pl-8 pr-2.5 text-sm text-ink-900 outline-none placeholder:text-ink-400 focus:border-accent-300 focus:ring-2 focus:ring-accent-100"
            />
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-2 py-10 text-center">
            <FileStack size={22} className="text-ink-300" />
            <p className="text-sm text-ink-400">{query ? "No matching documents." : "No documents yet."}</p>
          </div>
        )}
        <ul className="flex flex-col gap-0.5">
          {filtered.map((doc) => {
            const active = doc.id === activeId;
            return (
              <li key={doc.id}>
                <div
                  className={`group relative flex items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors ${
                    active ? "bg-white text-ink-900 shadow-sm ring-1 ring-border-soft" : "text-ink-700 hover:bg-white/70"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-accent-500" />
                  )}
                  <button
                    type="button"
                    onClick={() => onSelect(doc.id)}
                    className="flex flex-1 items-center gap-2.5 overflow-hidden text-left"
                  >
                    <span
                      className={`flex h-7 w-7 flex-none items-center justify-center rounded-md ${
                        active ? "bg-accent-100 text-accent-700" : "bg-white text-ink-400 ring-1 ring-border-soft"
                      }`}
                    >
                      <FileText size={14} />
                    </span>
                    <span className="flex flex-col overflow-hidden">
                      <span className="truncate text-sm font-medium">{doc.title || "Untitled document"}</span>
                      <span className="truncate text-xs text-ink-400">{formatDate(doc.updatedAt)}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    title="Duplicate"
                    onClick={() => onDuplicate(doc.id)}
                    className="flex-none rounded-md p-1 text-ink-400 opacity-0 transition-opacity hover:bg-accent-50 hover:text-accent-700 group-hover:opacity-100"
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    type="button"
                    title="Delete"
                    onClick={() => onDelete(doc.id)}
                    className="flex-none rounded-md p-1 text-ink-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
