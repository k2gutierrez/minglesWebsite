# Verification and launch checklist

> Update September 22: wallet backend and verification are now implemented. See `EMPIEZA_AQUI.md` and `docs/07-BACKEND-API.md`; their backend instructions supersede the earlier frontend-only scope below.

## Verified in this delivery

- Next.js production compilation and TypeScript checks pass.
- Three automated tests pass: safe URL handling, nested content shape validation, and source seed integrity/no fabricated published data.
- All ten application routes respond and render a main landmark: Home, Tequila, Art, Story, Experiments, Play, Updates, Build the Distillery, Portal and Admin.
- Desktop and mobile layouts visually inspected. A portal grid minimum-width issue was found and corrected. Revised mobile Home measured viewport and document width both at 390px.
- Browser checks: local draft save, local publish, public hero text update, hidden Home section removal, restoration of test edits, art-era switching, correct hero `#building` link.
- Dark revision visually inspected: black page foundation, large visual build cards, coral identity card, rotating network, floating labels, orbit rings, cursor crosshair.
- Mouse response verified on the hero: the rendered transform changes in perspective, translation, rotateX and rotateY after pointer movement.
- Reduced-motion handling implemented in both CSS and Motion; not a substitute for a full accessibility audit.
- No browser console errors observed in the inspected test tab.
- Unknown public section paths restricted to the declared route list.

No Supabase credentials/project were provided. SQL was authored but not applied. Connected CMS, auth, storage and RLS require staging verification; no claim of production backend validation is made. No real wallet ownership or protocol transaction was tested because those services are not implemented.

## Before public launch

### Content and identity

- Supply/approve real bottle, collectible cap, packaging and artist media.
- Install licensed Hogfish and GT Pressura Mono; review wrapping after replacement.
- Verify each current status, especially provisional experiment Building states.
- Publish actual dated proof entries and story records; add official PVG launch destinations only when ready.
- Choose one next verifiable milestone once a real milestone record is available.
- Remove preview labels only after the corresponding data/asset is real.

### CMS and infrastructure

- Apply and test the SQL migration in staging; test each role/access boundary in the Supabase guide.
- Configure authorized content admin, email delivery and exact redirect URLs.
- Add connected autosave, complete text-key coverage, full-page draft preview, schedules and optimistic concurrency handling to meet the full product brief.
- Complete private media staging and video workflows if required for launch.
- Fail closed for production admin when environment configuration is absent.
- Add content caching with authenticated invalidation and a last-known-good outage strategy.
- Confirm backup, audit retention and recovery procedures.

### Holder services

- Implement signed nonce/replay-protected wallet linking.
- Configure approved contract/chain registry and trusted ownership verifier.
- Test verified zero holdings, RPC outage, stale data and transfers without confusing these states.
- Integrate official art versions and migration provenance.
- Keep activation/distributions unavailable until protocol, legal/accounting and contract gates are closed.

### Experience and deployment

- Measure keyboard navigation, screen reader output, focus, contrast and 200% zoom.
- Test Safari, Chrome and Firefox; touch devices and reduced-motion mode.
- Optimize production images and video posters; inspect LCP, CLS and INP with real content.
- Add social metadata, sitemap, canonical URL, approved privacy/account pages and any launch-market requirements.
- Switch `noindex` off only after final editorial and operational review.
- Run `npm ci`, `npm run typecheck`, `npm test`, `npm run build` in clean CI.

## Intentional UI states

The portal shows unknown ownership, not an assumed zero balance. Activation and distributions are unavailable. Archives start empty. Art eras show pending official media. The decorative network and card symbols represent interface design, not onchain activity or approved character art.
