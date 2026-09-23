import { v4 as uuid } from "uuid";
import type { DocRecord } from "./types";

const STORAGE_KEY = "docmaker.documents.v1";

const BLANK_CONTENT = "<p></p>";

function readAll(): DocRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(docs: DocRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

export function listDocs(): DocRecord[] {
  return readAll().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getDoc(id: string): DocRecord | undefined {
  return readAll().find((d) => d.id === id);
}

export function createDoc(title = "Untitled document"): DocRecord {
  const now = Date.now();
  const doc: DocRecord = {
    id: uuid(),
    title,
    content: BLANK_CONTENT,
    createdAt: now,
    updatedAt: now,
  };
  const docs = readAll();
  docs.push(doc);
  writeAll(docs);
  return doc;
}

export function saveDoc(id: string, patch: Partial<Pick<DocRecord, "title" | "content">>): DocRecord | undefined {
  const docs = readAll();
  const idx = docs.findIndex((d) => d.id === id);
  if (idx === -1) return undefined;
  docs[idx] = { ...docs[idx], ...patch, updatedAt: Date.now() };
  writeAll(docs);
  return docs[idx];
}

export function deleteDoc(id: string) {
  const docs = readAll().filter((d) => d.id !== id);
  writeAll(docs);
}

export function duplicateDoc(id: string): DocRecord | undefined {
  const source = getDoc(id);
  if (!source) return undefined;
  const now = Date.now();
  const copy: DocRecord = {
    id: uuid(),
    title: `${source.title} (copy)`,
    content: source.content,
    createdAt: now,
    updatedAt: now,
  };
  const docs = readAll();
  docs.push(copy);
  writeAll(docs);
  return copy;
}
