# DocMaker

A Word-style document editor that runs in the browser, built with Next.js and [Tiptap](https://tiptap.dev/). Deploys to Vercel with zero configuration.

## Features

- Rich text editing: headings, bold/italic/underline/strikethrough, font family & size, text color, highlight, alignment, bullet/numbered/checklist lists, blockquotes, tables, images, and links.
- Multiple documents, listed in a sidebar, stored in the browser's `localStorage` (no account or server needed).
- Autosave as you type.
- Export a document as **PDF** (via the browser's print dialog), **.docx**, **.html**, or **.txt**.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

1. Push this repository to GitHub (or your Git provider of choice).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Vercel auto-detects Next.js — no configuration needed. Click **Deploy**.

Or, from the CLI:

```bash
npx vercel
```

## Notes

Documents are stored per-browser in `localStorage`, so they don't sync across devices and aren't sent to any server — everything happens client-side.
