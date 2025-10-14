# Copilot Instructions for AI Coding Agents

## Project Overview
- This is a Next.js (TypeScript) blog project, bootstrapped with `create-next-app`.
- Uses Tailwind CSS for styling (`tailwind.config.ts`, `postcss.config.js`).
- Main app code is in `src/app/` (pages, layouts, global styles).
- UI components are in `components/ui/` and `src/components/`.
- Articles are stored as Markdown in `articles/` and loaded via `lib/articles.ts`.
- RSS generation script: `scripts/gen-rss.js`.

## Key Patterns & Conventions
- Page routes follow Next.js App Router conventions: `src/app/[route]/page.tsx`.
- Layouts are defined in `src/app/layout.tsx`.
- Global styles: `src/app/globals.css`.
- Article rendering uses `src/components/article.tsx`.
- Dynamic article pages: `src/app/articles/[slug]/page.tsx`.
- Project images/assets: `public/projects/`.
- Use TypeScript for all logic and React components.

## Developer Workflows
- **Start dev server:** `npm run dev` (or `yarn dev`, `pnpm dev`, `bun dev`).
- **Build for production:** `npm run build`.
- **Generate RSS:** `node scripts/gen-rss.js`.
- **Add new article:** Place Markdown file in `articles/`, update logic in `lib/articles.ts` if needed.
- **Styling:** Use Tailwind utility classes in components.

## Integration Points
- No custom backend; all data is static or loaded at build time.
- External dependencies: Next.js, React, Tailwind CSS.
- No custom API routes or serverless functions detected.

## Examples
- To add a new page: create `src/app/[newpage]/page.tsx` and link it in `src/app/Header.tsx`.
- To add a new UI component: place in `components/ui/` and import as needed.
- To render a new article: add Markdown to `articles/`, ensure `lib/articles.ts` parses it.

## Tips for AI Agents
- Follow Next.js App Router and Tailwind conventions.
- Reference existing files for examples of routing, layout, and Markdown rendering.
- Keep logic in TypeScript, avoid adding custom server code unless requested.
- Use concise, idiomatic React and Next.js patterns.

---
_Last updated: 2025-10-12_
