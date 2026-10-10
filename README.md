# Mingles — the next chapter

A runnable Next.js 16 frontend based on the three September 2026 Mingles briefs and the supplied official logos. Includes the public website, holder portal UI, local content studio, an optional Supabase CMS adapter, and a SQL foundation.

## Entrega para tu hermano

Empieza con [EMPIEZA_AQUI.md](EMPIEZA_AQUI.md). El contrato de Mingles en ApeChain ya está configurado; incluye backend de firma, wallets, ownership y metadata. Consulta [Backend API](docs/07-BACKEND-API.md) para el estado actualizado.

## Added after handoff (September 2026)

Two features and a change to the wallet stack, all verified against ApeChain and in the browser.

**CAVA recovery — `/recover-mingles`** · There are **636 Mingles inside the CAVA staking contract**, and the contract only offers an all-at-once emergency unstake. This page reports how many a wallet has staked and recovers them in one transaction. It deliberately **does not ask for an account or email**: whoever has Mingles locked should not depend on an email link. The count is read server-side (`/api/staking`), and ApeScan is offered as a manual fallback. Contract and selectors were verified in the deployed bytecode, and the unstake was simulated from a real staker before shipping.

**Three views per Mingle** · Opening a card in My Mingles shows the three views the previous site had: Bottled (from `tokenURI`), Unbottled and PFP. The art host was verified across the whole token range. There is **no download proxy**: the old one allowed SSRF, so images open full size in a new tab instead.

**Wallets: wagmi + RainbowKit** · The hand-rolled EIP-6963 connection only reached injected desktop wallets. RainbowKit adds the connect modal and **WalletConnect QR for mobile**, and finally uses `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`. Providers mount **only** on `/portal` and `/recover-mingles`; the public site still loads no wallet code. The signature flow is unchanged — RainbowKit connects, our challenge/verify backend still authorises.

Pinned on purpose: `wagmi@2.19.5` (wagmi 3 breaks RainbowKit), `@rainbow-me/rainbowkit@2.2.11`, and `@x402/*@2.24.0` as direct dependencies — without the latter the build fails with RainbowKit on Next 16.

**Mingle lab — admin → «Mingle lab»** · The old site's NFT generator, ported into the content studio: every Mingle is six stacked layers (BG → Tequila Worm → Fur → Face → Bottle → Cap) served from the public `traits` bucket, browsable 50 at a time, filterable by layer or edition, composable by swapping any layer, and downloadable as a 2× PNG (`html-to-image`, `mingle-{edition}.png`). It never writes to the art bucket.

The layer registry is a compact copy (`public/mingles-traits.json`, 486 KB, 5540 Mingles, 125 layer values, the ten 1-of-1 tokens excluded). Regenerate it from the old site's metadata with `npm run build:traits`; it is fetched only when the tab is opened, so the public site carries nothing.

One known data issue in the bucket, inherited from the old generator and not worked around: `traits/Bottle/Standard Bottle Silver.png` is a **1×1 fully transparent placeholder** (485 Mingles, so those composites show no bottle). Layer art also comes in two resolutions (1296×1312 and 2592×2624) that share the same aspect ratio, so `object-fit: cover` keeps the stack aligned. Replacing or uploading layer art is **not implemented**: it would write to the production art bucket and needs its own Storage policies and art review.

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
