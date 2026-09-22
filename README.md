# Mingles — the next chapter

A runnable Next.js 16 frontend based on the three September 2026 Mingles briefs and the supplied official logos. Includes the public website, holder portal UI, local content studio, an optional Supabase CMS adapter, and a SQL foundation.

## Entrega para tu hermano

Empieza con [EMPIEZA_AQUI.md](EMPIEZA_AQUI.md). El contrato de Mingles en ApeChain ya está configurado; incluye backend de firma, wallets, ownership y metadata. Consulta [Backend API](docs/07-BACKEND-API.md) para el estado actualizado.

## Open in Visual Studio Code

Open this folder with **File → Open Folder**, then use **Terminal → New Terminal**. Install Node.js 22.18+ or Node.js 24 LTS.

```sh
npm ci
npm run dev
```

Visit <http://localhost:3000>. Content studio: <http://localhost:3000/admin>. Holder portal: <http://localhost:3000/portal>.

No credentials are needed for the local design preview. The admin editor writes only to your browser until Supabase is configured. This is not an authenticated production admin in preview mode; never treat local storage as trusted data.

```sh
npm run typecheck
npm test
npm run build
npm start
```

Stop the development server before starting the production server on the same port.

## What is included

- Responsive Home, Tequila, Art, Story, Experiments, Updates, Build the Distillery, and Holder Portal.
- `/play` retains the earlier blueprint's Play destination; `/experiments` is the main navigation destination.
- Black-first visual design, 3D pointer-responsive official logo, rotating particle field, floating labels, animated ribbon, page/scroll transitions, visual tilt cards, art-era tabs, and reduced-motion support.
- Holder overview, My Mingles, experiments, activation, distributions, and account views. No fabricated holdings, balances, activity, or claims.
- Content studio: editable hero/page copy/navigation labels, section visibility/order, build states, new experiment cards, story/update CRUD, draft saving, local publication, image upload/selection, and revision restore.
- Server-loaded content with an optional Supabase adapter. Role-checked CMS RPC, separate drafts/publications, audit history, storage policies, and reserved holder tables.

## Read the handoff

1. [Requirements review](docs/01-REQUIREMENTS-REVIEW.md): source decisions, conflicts, implementation coverage, and remaining work.
2. [Design and UX](docs/02-DESIGN-AND-UX.md): palette, typography, motion, responsive behavior, and asset requirements.
3. [VS Code and Next.js](docs/03-DEVELOPER-HANDOFF.md): file map, commands, architecture, and deployment.
4. [Supabase guide](docs/04-SUPABASE-SETUP.md): concrete setup, SQL, security, planned tables, and wallet verification design.
5. [Content operations](docs/05-CONTENT-OPERATIONS.md): how Memo can operate the editor.
6. [Launch and QA](docs/06-LAUNCH-AND-QA.md): verification results and remaining launch gates.

## Current delivery boundary

The wallet backend is implemented with ApeChain collection 0x6579cfd742d8982a7cdc4c00102d3087f6c6dd8e. Configure Supabase, apply both migrations, set server secrets and test the complete flow in staging before launch. No remote Supabase project was provisioned and no wallet signature was requested from the user during development. Seven automated tests pass, including local Postgres migrations/RLS/replay protections. See the backend guide for read-only live contract checks.

Activation, NFT migration transactions, and economic distributions remain disabled pending their actual contracts and approved rules. Browser/EIP-6963 wallets are supported; QR WalletConnect is not included. Email login precedes wallet linking. Some advanced CMS workflows still need extension: scheduling, video, full-page draft preview, and remaining secondary copy fields.

The supplied assets contain logos only. Real bottle/cap photography, approved character art, event media, proof records, PVG URLs, and licensed Hogfish/GT Pressura Mono files remain required. The site stays noindex until launch review. No OpenAI API is used.
