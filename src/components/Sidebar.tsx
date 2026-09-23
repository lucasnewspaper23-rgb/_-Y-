"use client";

import type { DocRecord } from "@/lib/types";
import { FilePlus2, FileText, Trash2, Copy } from "lucide-react";

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
  return (
    <aside className="flex h-full w-64 flex-none flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-3">
        <button
          type="button"
          onClick={onCreate}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <FilePlus2 size={16} />
          New document
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {docs.length === 0 && (
          <p className="px-2 py-6 text-center text-sm text-slate-400">No documents yet.</p>
        )}
        <ul className="flex flex-col gap-1">
          {docs.map((doc) => (
            <li key={doc.id}>
              <div
                className={`group flex items-center gap-2 rounded-md px-2 py-2 text-left transition-colors ${
                  doc.id === activeId ? "bg-blue-50 text-blue-800" : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(doc.id)}
                  className="flex flex-1 items-center gap-2 overflow-hidden text-left"
                >
                  <FileText size={16} className="flex-none text-slate-400" />
                  <span className="flex flex-col overflow-hidden">
                    <span className="truncate text-sm font-medium">{doc.title || "Untitled document"}</span>
                    <span className="truncate text-xs text-slate-400">{formatDate(doc.updatedAt)}</span>
                  </span>
                </button>
                <button
                  type="button"
                  title="Duplicate"
                  onClick={() => onDuplicate(doc.id)}
                  className="flex-none rounded p-1 text-slate-400 opacity-0 hover:bg-slate-200 hover:text-slate-600 group-hover:opacity-100"
                >
                  <Copy size={14} />
                </button>
                <button
                  type="button"
                  title="Delete"
                  onClick={() => onDelete(doc.id)}
                  className="flex-none rounded p-1 text-slate-400 opacity-0 hover:bg-red-100 hover:text-red-600 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
