"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Download, FileType, FileCode2, Printer, FileDown } from "lucide-react";
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
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        const updated = saveDoc(activeDoc.id, { content: html });
        if (updated) {
          setDocs((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
          setActiveDoc((prev) => (prev && prev.id === updated.id ? updated : prev));
        }
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
    return <div className="flex h-full items-center justify-center text-slate-400">Loading…</div>;
  }

  return (
    <div className="docmaker-app-root flex h-full flex-col">
      <header className="flex items-center gap-4 border-b border-slate-200 bg-white px-4 py-2 print:hidden">
        <div className="flex items-center gap-2 text-blue-700">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-sm font-bold text-white">D</div>
          <span className="hidden font-semibold sm:inline">DocMaker</span>
        </div>
        <input
          value={activeDoc.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Untitled document"
          className="flex-1 rounded px-2 py-1 text-lg font-medium text-slate-800 outline-none hover:bg-slate-100 focus:bg-slate-100"
        />
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowExportMenu((s) => !s)}
            className="flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Download size={16} />
            Export
            <ChevronDown size={14} />
          </button>
          {showExportMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
              <div className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
                <button
                  onClick={() => {
                    setShowExportMenu(false);
                    handlePrint();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                >
                  <Printer size={16} /> Print / Save as PDF
                </button>
                <button
                  onClick={handleExportDocx}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                >
                  <FileDown size={16} /> Download as .docx
                </button>
                <button
                  onClick={handleExportHtml}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                >
                  <FileCode2 size={16} /> Download as .html
                </button>
                <button
                  onClick={handleExportText}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                >
                  <FileType size={16} /> Download as .txt
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
