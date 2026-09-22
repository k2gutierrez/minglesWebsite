# Requirements review and scope decisions

Reviewed all 27 pages across:

- `Mingles_Website_Product_Brief_2026.pdf` — 16 pages; primary developer implementation contract.
- `Mingles_Website_Content_Blueprint_v2_2026.pdf` — 10 pages; content, economic gates, current phase.
- `Mingles_North_Star_2026.pdf` — 1 page; internal brand architecture.
- Five official logo PNGs. Black and white transparent variants copied to `public/brand/`.

The Brand Identity, migration plans, website concept, PVG doctrine, and protocol studies are referenced by these PDFs but were not supplied. This implementation does not claim to have reviewed those missing source documents.

## User review incorporated

After the first live preview, the user requested a black main background, stronger mouse-responsive effects, more visual cards, and a more creative Web3 personality. The revised frontend follows that instruction while retaining the official coral/ivory identity and source-truth restrictions.

## Product meaning

Mingles is the collectible identity. Tequila creates real-world value. PVG is the independent experiment lab. Activation is a future opt-in eligibility bridge; Protocol organizes participation. Build the Distillery is the shared direction, not evidence that a physical distillery is already operating.

The public site must answer what is being built, what is real today, and what ownership might do next. Keep public discovery wallet-free. The portal must work as an honest account/state surface before activation launches.

## Resolving conflicting specs

| Topic             | Source differences                                                                                                      | Implementation decision                                                                                                                                       |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public navigation | Blueprint: Art / Tequila / Play / Build the Distillery / Updates. Brief: Tequila / Art / Story / Experiments / Updates. | Implementation brief governs primary nav. Home through logo; retain `/play` and `/build-the-distillery`. Mission linked prominently from Protocol and footer. |
| Games             | Blueprint favors in-site game pages; brief says independent PVG owns deep gameplay.                                     | Mingles contains system summaries and readiness; external verified PVG launch URLs can be edited into cards. No embedded game simulation.                     |
| Home order        | Blueprint places Art before Tequila; brief places Tequila before Art and adds Story.                                    | Default to product brief; admin can reorder/hide sections.                                                                                                    |
| Portal navigation | Brief adds Experiments.                                                                                                 | Include it alongside Overview, My Mingles, Activation, Distributions, Account.                                                                                |
| Progress          | Brief allows optional percentages; blueprint disallows fake metrics.                                                    | Status labels only. Add percentages only with a measurable denominator and proof.                                                                             |
| Dates and news    | No actual update records or proof supplied.                                                                             | No invented news or events. Empty archives remain explicit.                                                                                                   |

## Coverage matrix

| Requirement                     | Delivered                                                                    | Remaining for production                                                                 |
| ------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Brand palette and official logo | Exact core colors, supplied logo                                             | Licensed Hogfish and GT Pressura Mono                                                    |
| Public architecture             | All public routes plus Play compatibility                                    | Final editorial approval                                                                 |
| Tequila proof                   | Product narrative and media-ready homepage                                   | Actual media, batch/origin/specs when approved                                           |
| Art                             | Three-era UI, artist credit, transparent missing media                       | Token-level images and provenance source                                                 |
| Story/Updates                   | Categories, search, editable records, proof URLs                             | Real records, rich galleries, scheduling                                                 |
| Build state                     | Editable status records; no fake percentages                                 | Confirm all statuses before launch; Gluttons/Outbreak use provisional Building           |
| Admin CMS                       | Local draft/publish and Supabase RPC adapter                                 | Live project testing, remaining secondary copy, full-page preview, video, concurrency UI |
| Media                           | PNG/JPEG/WebP upload and project selection                                   | Private staging/reveal controls, responsive derivatives, video pipeline                  |
| Holder UI                       | All views, sign-in adapter, unavailable states                               | Verified wallets, contract registry, ownership indexer                                   |
| Protocol                        | Clearly in development                                                       | Approved rules, audited contracts, accounting/legal gates                                |
| Accessibility/motion            | Focus styles, semantic buttons, keyboard art tabs, reduced motion, mobile UI | Formal accessibility audit and assistive technology coverage                             |

## Prohibited V1 content

No points, shop, reward catalog, token sale, token price, APY, projected earnings, fabricated revenue allocations, countdowns without operational dates, or automatic activation. Do not seed random token IDs or balances to fill the portal.

## Inputs still needed

1. Approved bottle, cap, packaging photos/videos and rights/credits.
2. Legacy, ApeChain, and Lombard art with token mappings and reveal permissions.
3. Licensed font files and web usage authorization.
4. Actual dated story/update entries, proof URLs, locations, and credits.
5. Official PVG links, concise game descriptions, and confirmed current statuses.
6. Supabase project URL/public key, authorized admin user ID, production domain and email sender setup.
7. Official chains/contracts, RPC/indexer provider, migration policy, and ownership freshness policy.
8. Approved privacy/account terms and launch-market decisions. No legal conclusions are made by this frontend.
