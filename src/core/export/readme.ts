import type { Project } from "@/core/projects/types";

/**
 * Renders a portable README explaining how to install, develop, and deploy
 * the exported Next.js project outside the platform.
 */
export function renderReadme(project: Project): string {
  const safeName = project.name.replace(/[`*_]/g, "").trim() || "Untitled";
  return `# ${safeName}

This project was exported from the AI Open Builder. It is a standalone
Next.js 14 application — no platform runtime required.

## Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS

## Getting started

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000).

## Build for production

\`\`\`bash
npm run build
npm start
\`\`\`

## Deploy

This project is portable. You can deploy it to any Node-compatible host:

- **Vercel** — \`vercel\` (recommended for Next.js)
- **Netlify** — connect the repo and use the Next.js runtime
- **Self-host** — \`npm run build && npm start\` behind your reverse proxy

## Project structure

\`\`\`
app/             # App Router routes
components/      # Reusable React components
public/          # Static assets (logos, banners, fonts)
tailwind.config  # Design tokens
\`\`\`

---

Exported on ${new Date().toISOString().split("T")[0]}.
`;
}
