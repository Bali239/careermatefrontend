<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Styling rules

- Use Tailwind CSS utility classes for layout, spacing, colors, typography, responsive behavior, and component styling.
- Do not add custom CSS rules, CSS variables, resets, or component-specific styles to `src/app/globals.css` or new CSS files. Keep `globals.css` to the Tailwind import only; use Tailwind utilities and library components for all styling.
- Prefer the existing Ant Design components and `@ant-design/icons` for controls and icons. Use an existing animation library if present; do not add one for simple transitions that Tailwind can handle.
- Tailwind CSS 4 is configured through `@tailwindcss/postcss` and `@import "tailwindcss" source(".")` in `src/app/globals.css`. Keep this source detection so app and component classes are generated.
