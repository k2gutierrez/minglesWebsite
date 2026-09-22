# Visual Studio Code and Next.js handoff

> Update September 22: wallet backend and verification are now implemented. See `EMPIEZA_AQUI.md` and `docs/07-BACKEND-API.md`; their backend instructions supersede the earlier frontend-only scope below.

## Runtime and setup

Use Node 24 LTS (or Node 22.18+ for built-in TypeScript test stripping). `package-lock.json` records the versions installed and verified. The app uses Next.js 16.3.5, React 19, TypeScript 5, Motion 12, and Supabase JS 2. Dependency updates should be deliberate and followed by the checks below.

Open the project root in VS Code, open its terminal, run `npm ci`, then `npm run dev`. The root already contains VS Code editor recommendations/settings. On macOS, `code .` works only after installing the VS Code shell command; File → Open Folder works regardless.

| Command             | Purpose                                   |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Local preview on port 3000                |
| `npm run typecheck` | TypeScript verification                   |
| `npm test`          | Content validation and URL boundary tests |
| `npm run format`    | Format source and docs                    |
| `npm run build`     | Optimized production build                |
| `npm start`         | Serve the built application               |

If port 3000 is occupied, run `npm run dev -- --port 3001`. If your global npm cache has ownership errors, use `npm ci --cache /tmp/mingles-npm-cache`; do not blindly change permissions on the whole user directory.

## File map

```text
src/app/layout.tsx             Metadata, server content read, shared provider/shell
src/app/page.tsx               Homepage
src/app/[section]/page.tsx     Tequila, Art, Story, Experiments, Play, Updates, Mission
src/app/portal/page.tsx        Holder surface
src/app/admin/page.tsx         Content studio
src/app/globals.css            Tokens, layout, responsive rules, motion
src/components/home.tsx        Home modules and experiment cards
src/components/section-page.tsx Public detail pages and art tabs
src/components/portal.tsx      Holder UI and email sign-in adapter
src/components/admin.tsx       Structured content editor
src/components/provider.tsx    Published content state and local mode
src/components/ui.tsx          Shared buttons, statuses, reveal, logo composition
src/components/shell.tsx       Header, mobile navigation, footer
src/lib/content.ts             Typed content contract and source-based seed
src/lib/load-content.ts        Server-side public Supabase read
src/lib/supabase.ts            Public-key Supabase client
supabase/migrations/           Runnable initial SQL foundation
public/brand/                  Supplied official logos
```

## Rendering and content

Next.js renders initial HTML from the server. The root loader fetches only the public published document, with a five-second timeout. Client components provide the local editor's immediate feedback and interactive views. This first delivery hydrates larger components than the final server-component architecture needs; split static public modules from the client context as the production CMS matures.

Modes:

- **Preview:** no Supabase env values; seed from supplied briefs. Browser edits use `mingles-draft`, `mingles-published`, `mingles-revisions`, and `mingles-media` localStorage keys.
- **Connected:** valid published document fetched from Supabase; public pages render it. Admin writes are role-checked by the database RPC.
- **Unavailable:** env exists but public content fetch fails; explicit connection notice and source-based fallback. For production, replace this with last-known-good cached content or a dedicated maintenance state rather than silently displaying stale source content.

`NEXT_PUBLIC_*` values are bundled at build time. Configure them before building/redeploying. Never put a secret/service-role key in these variables.

Current connected reads use `cache: 'no-store'` to avoid stale publications. Production follow-on: cache public reads under a website tag, add an authenticated publish endpoint or verified webhook, and invalidate the tag after the SQL transaction succeeds. A browser client must not possess the revalidation secret.

## Adding content versus functionality

Editors can add external experiment cards without deployment. New cards default hidden until their content and URL are ready. A new game with actual embedded gameplay, a wallet transaction, or a new visual module requires a developer. The three art-era tabs are a UI shell until the official token/art registry is integrated.

Use `safeHref` for editable links. Render CMS text through React text nodes; no raw HTML or `dangerouslySetInnerHTML`. The frontend validates the shape of the public content document before rendering.

## Production deployment

The project is a standard Next.js Node application. Deploy using a Next.js-capable Node host; no hosting account was created or modified. Configure environment variables, run the SQL setup in a staging Supabase project, publish approved seed content through the admin, then build and test the connected site.

Before public launch:

1. Complete the production checklist in `06-LAUNCH-AND-QA.md`.
2. Replace preview assets/fonts and confirm statuses.
3. Add production metadata, social share image, canonical URL and sitemap; change the global `noindex` setting only after approval.
4. Remove local prototype access from a production build if Supabase is missing: fail configuration at startup instead of falling back to public `/admin` preview.
5. Configure allowed auth redirect URLs, SMTP, monitoring, backup and restore procedures.
6. Measure real media loading, Core Web Vitals and bundle size before adding optional animation engines.

## Authoritative technical references

- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation)
- [Next.js server and client components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Supabase row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
- [Motion reduced-motion support](https://motion.dev/docs/react-use-reduced-motion)

Local Next.js documentation is also included under `node_modules/next/dist/docs/`. The generated `AGENTS.md` points future coding agents to the installed version's conventions.
