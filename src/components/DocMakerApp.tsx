"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Download, FileType, FileCode2, Printer, FileDown, PenLine } from "lucide-react";
import Sidebar from "./Sidebar";
import PageEditor from "./PageEditor";
import { createDoc, deleteDoc, duplicateDoc, getDoc, listDocs, saveDoc } from "@/lib/storage";
import type { DocRecord } from "@/lib/types";
import { exportAsDocx, exportAsHtml, exportAsText } from "@/lib/export";

export default function DocMakerApp() {
  const [docs, setDocs] = useState<DocRecord[]>([]);
  const [activeDoc, setActiveDoc] = useState<DocRecord | null>(null);
  const [ready, setReady] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Tracks the editor's live HTML for the active document, independent of
  // the debounced localStorage write, so exports never read stale content.
  const latestContentRef = useRef<string>("");

  // Documents live in localStorage, which only exists once mounted in the
  // browser, so the initial load has to happen here rather than in state
  // initializers (those also run during server-side prerendering).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let all = listDocs();
    if (all.length === 0) {
      createDoc("Untitled document");
      all = listDocs();
    }
    setDocs(all);
    latestContentRef.current = all[0].content;
    setActiveDoc(all[0]);
    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const refreshDocs = useCallback(() => {
    setDocs(listDocs());
  }, []);

  const selectDoc = useCallback(
    (doc: DocRecord) => {
      // Flush any unsaved edits to the document we're leaving before
      // switching away, so a fast switch can't drop the last keystrokes.
      if (saveTimer.current && activeDoc) {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
        saveDoc(activeDoc.id, { content: latestContentRef.current });
      }
      latestContentRef.current = doc.content;
      setSaveStatus("saved");
      setActiveDoc(doc);
    },
    [activeDoc]
  );

  const handleSelect = useCallback(
    (id: string) => {
      const doc = getDoc(id);
      if (doc) selectDoc(doc);
    },
    [selectDoc]
  );

  const handleCreate = useCallback(() => {
    const doc = createDoc("Untitled document");
    refreshDocs();
    selectDoc(doc);
  }, [refreshDocs, selectDoc]);

  const handleDelete = useCallback(
    (id: string) => {
      if (!window.confirm("Delete this document? This cannot be undone.")) return;
      deleteDoc(id);
      const remaining = listDocs();
      setDocs(remaining);
      if (activeDoc?.id === id) {
        if (remaining.length > 0) {
          selectDoc(remaining[0]);
        } else {
          const doc = createDoc("Untitled document");
          setDocs(listDocs());
          selectDoc(doc);
        }
      }
    },
    [activeDoc, selectDoc]
  );

  const handleDuplicate = useCallback(
    (id: string) => {
      const copy = duplicateDoc(id);
      refreshDocs();
      if (copy) selectDoc(copy);
    },
    [refreshDocs, selectDoc]
  );

  const handleTitleChange = useCallback(
    (title: string) => {
      if (!activeDoc) return;
      setActiveDoc({ ...activeDoc, title });
      const updated = saveDoc(activeDoc.id, { title });
      if (updated) setDocs((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    },
    [activeDoc]
  );

  const handleContentChange = useCallback(
    (html: string) => {
      if (!activeDoc) return;
      latestContentRef.current = html;
      setSaveStatus("saving");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        const updated = saveDoc(activeDoc.id, { content: html });
        if (updated) {
          setDocs((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
          setActiveDoc((prev) => (prev && prev.id === updated.id ? updated : prev));
        }
        setSaveStatus("saved");
      }, 400);
    },
    [activeDoc]
  );

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleExportDocx = useCallback(async () => {
    if (!activeDoc) return;
    setShowExportMenu(false);
    await exportAsDocx(activeDoc.title, latestContentRef.current);
  }, [activeDoc]);

  const handleExportHtml = useCallback(() => {
    if (!activeDoc) return;
    setShowExportMenu(false);
    exportAsHtml(activeDoc.title, latestContentRef.current);
  }, [activeDoc]);

  const handleExportText = useCallback(() => {
    if (!activeDoc) return;
    setShowExportMenu(false);
    const text = new DOMParser().parseFromString(latestContentRef.current, "text/html").body.textContent ?? "";
    exportAsText(activeDoc.title, text);
  }, [activeDoc]);

  if (!ready || !activeDoc) {
    return (
      <div className="flex h-full items-center justify-center bg-surface-muted text-sm text-ink-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="docmaker-app-root flex h-full flex-col">
      <header className="flex items-center gap-4 border-b border-border-soft bg-white/95 px-4 py-2.5 shadow-[0_1px_0_0_rgba(23,21,31,0.03)] backdrop-blur print:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-500 to-accent-700 text-white shadow-sm shadow-accent-600/30">
            <PenLine size={16} strokeWidth={2.25} />
          </div>
          <span className="hidden font-semibold tracking-tight text-ink-900 sm:inline">DocMaker</span>
        </div>
        <div className="h-6 w-px bg-border-soft" />
        <div className="flex min-w-0 flex-1 items-baseline gap-3">
          <input
            value={activeDoc.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled document"
            className="min-w-0 flex-1 truncate rounded-md border border-transparent bg-transparent px-2 py-1 text-[15px] font-medium text-ink-900 outline-none transition-colors placeholder:text-ink-400 hover:border-border-soft focus:border-accent-300 focus:bg-white focus:ring-2 focus:ring-accent-100"
          />
          <span className="hidden shrink-0 text-xs text-ink-400 sm:inline">
            {saveStatus === "saving" ? "Saving…" : "Saved"}
          </span>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowExportMenu((s) => !s)}
            className="flex items-center gap-1.5 rounded-lg border border-border-strong bg-white px-3 py-1.5 text-sm font-medium text-ink-700 shadow-sm transition-colors hover:border-accent-300 hover:bg-accent-50 hover:text-accent-700"
          >
            <Download size={15} />
            Export
            <ChevronDown size={14} className={`transition-transform ${showExportMenu ? "rotate-180" : ""}`} />
          </button>
          {showExportMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
              <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-border-soft bg-white p-1.5 shadow-xl shadow-ink-900/10">
                <button
                  onClick={() => {
                    setShowExportMenu(false);
                    handlePrint();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-ink-700 transition-colors hover:bg-accent-50 hover:text-accent-700"
                >
                  <Printer size={16} className="text-ink-400" /> Print / Save as PDF
                </button>
                <button
                  onClick={handleExportDocx}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-ink-700 transition-colors hover:bg-accent-50 hover:text-accent-700"
                >
                  <FileDown size={16} className="text-ink-400" /> Download as .docx
                </button>
                <button
                  onClick={handleExportHtml}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-ink-700 transition-colors hover:bg-accent-50 hover:text-accent-700"
                >
                  <FileCode2 size={16} className="text-ink-400" /> Download as .html
                </button>
                <button
                  onClick={handleExportText}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-ink-700 transition-colors hover:bg-accent-50 hover:text-accent-700"
                >
                  <FileType size={16} className="text-ink-400" /> Download as .txt
                </button>
              </div>
            </>
          )}
        </div>
      </header>
      <div className="docmaker-body flex min-h-0 flex-1">
        <div className="print:hidden">
          <Sidebar
            docs={docs}
            activeId={activeDoc.id}
            onSelect={handleSelect}
            onCreate={handleCreate}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
          />
        </div>
        <PageEditor key={activeDoc.id} content={activeDoc.content} onChange={handleContentChange} />
      </div>
    </div>
  );
}
