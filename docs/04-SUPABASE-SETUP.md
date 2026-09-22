# Supabase setup and backend implementation plan

> Update September 22: wallet backend and verification are now implemented. See `EMPIEZA_AQUI.md` and `docs/07-BACKEND-API.md`; their backend instructions supersede the earlier frontend-only scope below.

The frontend runs without Supabase. This guide and migration specify a real connection path. No remote project has been created, no SQL executed remotely, and no authentication email sent during delivery.

## 1. Create the staging project

Create a Supabase project in the team's account and appropriate region. Record its project URL and publishable key. Create `.env.local` from `.env.example`, fill `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and set the site URL. Keep `.env.local` out of source control.

The publishable key is public by design; RLS is the security boundary. Do not use `service_role` or a secret key in browser code. The current frontend does not need a service-role key.

## 2. Apply the foundation migration

Run `supabase/migrations/202609210001_content_foundation.sql` in the Supabase SQL editor on a new staging project. Alternatively use the Supabase CLI's migration workflow after linking the project. Treat the migration as one-time: it creates policies/tables, rather than silently replacing an existing production schema.

| Table/function                           | Purpose                                               | Browser access                                        |
| ---------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------- |
| `site_content`                           | Published website JSON document, single row `website` | Public read only                                      |
| `website_drafts`                         | Private editable source document                      | Approved admins read; RPC writes                      |
| `admin_roles`                            | Canonical content roles                               | Users read their own role; no browser role assignment |
| `admin_audit_log`                        | Immutable publication/draft history                   | Admin read; RPC append                                |
| `media_assets`                           | Approved image metadata                               | Admin CRUD                                            |
| `linked_wallets`                         | Reserved verified wallet links                        | Owner read; trusted verifier writes later             |
| `ownership_snapshots`                    | Reserved chain ownership evidence                     | Owner read; trusted verifier writes later             |
| `is_content_admin()`                     | Session-bound role check                              | Authenticated callers                                 |
| `save_website(document, should_publish)` | Atomic draft/publish + audit                          | Role-checked authenticated call                       |

Drafts and publications are physically separate tables. Publication removes unpublished story/update records and disabled projects/modules before public storage. A transaction advisory lock serializes concurrent publications. The current editor still uses last-writer-wins semantics; add an expected revision/version check and conflict dialog before multiple editors work simultaneously.

The JSON document is a deliberate starter adapter matching the delivered TypeScript model, not a claim that the brief's normalized CMS has been fully implemented.

## 3. Bootstrap Memo's admin role

Invite/create Memo's approved account in Supabase Auth. Identify its actual UUID. In the SQL editor, replace the placeholder with that UUID:

```sql
insert into public.admin_roles (user_id, role)
values ('REPLACE_WITH_AUTH_USER_UUID', 'super_admin');
```

Do not expose this operation through the website. Do not derive roles from editable user metadata. Current `super_admin` and `editor` can both edit/publish content; neither role grants any contract-admin authority or access to wallet private keys.

## 4. Configure authentication

Enable email magic-link sign-in, configure a production SMTP sender, Site URL, and exact redirect allowlist entries for:

- `http://localhost:3000/admin`
- `http://localhost:3000/portal`
- Production `/admin` and `/portal` URLs once the domain is chosen.

The browser Supabase client handles the email session. The portal can request a holder account link; admin sign-in uses `shouldCreateUser: false`. Existing accounts still require `admin_roles` membership for writes. Test email delivery, expiration, errors, sign-out, and a signed-in user without an admin role.

This starter uses browser session persistence. Before server-side protected holder routes are implemented, use Supabase's SSR cookie integration and verify the user server-side; never trust client state for private data access.

## 5. First publication

Restart the dev server after adding env variables. Until a publication exists, the site explicitly shows content-unavailable fallback. Open `/admin`, sign in with the approved admin account, review the source-based content, and publish. Reload `/` to verify the connected mode and public content.

To bring a locally edited draft over, export a backup before enabling Supabase, then have the developer import the validated document through the authenticated `save_website` RPC. Normal admin work does not require raw JSON editing. The editor currently has export but no import UI.

## 6. Storage

The migration creates **public-media**, a PUBLIC bucket with admin-only mutations, image MIME restrictions and a 2 MB limit. Upload only approved, already-public media. Draft records do not make objects in a public bucket private. File paths use generated UUIDs and no overwriting by default.

Production extensions:

- A PRIVATE `media-drafts` bucket for unrevealed character/bottle assets. Only admins can read; use short-lived signed preview URLs.
- Approval/promotion to the public bucket on publish, with recorded rights and timestamps.
- File signature validation, pixel dimension limits, malware checks where applicable, optimized derivatives and explicit image dimensions.
- Video upload with independent size limits, poster image, captions/transcript, duration metadata, and transcoding. Lazy-load the player; never block first paint.
- Audited replace/delete operations. Before deleting media, check references and preserve prior revisions' access needs.

The image workflow in this delivery does not implement video, private reveal staging, transcoding, or media audit triggers.

## 7. Normalize the full CMS

When moving beyond this starter, migrate these records out of the document while preserving IDs and content keys:

| Planned table         | Key fields and constraints                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `site_copy`           | Unique `(key, locale)`; page, section, field, value, updated_at, updated_by                                                                 |
| `page_sections`       | UUID; page, module_type allowlist, enabled, sort_order, layout_variant, copy/media references, publish_at, unpublish_at                     |
| `story_entries`       | UUID/slug, type enum, title, event_date, location, short/long copy, hero_media_id, gallery, tags, external_url, featured, publication state |
| `updates`             | UUID/slug, category enum, headline, date, status, summary, media, proof_url, next_action, related_progress_id, publish state/schedule       |
| `progress_items`      | ID, label, status, nullable percent constrained 0–100, evidence/methodology, description, next_milestone, checked_at, enabled               |
| `experiments`         | ID/slug, title, status, description, media, CTA label/type, HTTPS target, visibility PUBLIC/HOLDER/BOTH, featured, order                    |
| `mingle_art_versions` | Chain, contract, token_id TEXT, era LEGACY/APECHAIN/LOMBARD, asset_id, reveal state, active/display flags; unique identity+era              |
| `media_asset_links`   | Junction records for reuse, gallery ordering and safe reference checks                                                                      |

Require authenticated admin policy for every mutation, public SELECT only on approved/published rows, owner-specific RLS for personal data, indexed foreign keys and deterministic ordering. RLS does not automatically protect derived views: use security-invoker views or carefully audited server endpoints.

All normal visible copy needs stable keys; the current editor covers the main headings/descriptions/CTAs/footer and navigation, but some secondary interface copy is still in React components. Extract these before the brief's "every normal text block editable" acceptance gate.

Scheduling requires actual server enforcement, e.g. query filters plus a scheduled publish/revalidation job. Do not add a date picker that implies publication happens without a worker. Add draft autosave to the connected editor, full-route authenticated draft preview, and optimistic locking. Local autosave already works.

## 8. Verified ownership implementation

1. Keep `auth.users.id` as canonical account ID, independent of wallet address.
2. Create server-issued cryptographic nonces tied to user, domain, chain, issue time, expiration, and intended action. Store hash/used_at in a private, non-exposed table.
3. Verify a signed wallet challenge (including domain, nonce, time, chain, and account), support intended contract-wallet verification, consume the nonce atomically, and rate-limit attempts. Never accept a typed address as evidence.
4. Maintain an approved contract registry. Read owner balances/tokens from approved RPC/indexer sources; store exact chain/contract/token identity and observed block/time. Token IDs are text to avoid JavaScript precision loss.
5. A trusted server worker writes snapshots; ordinary users and content admins have no write policies. The reserved tables intentionally expose only SELECT to their owner.
6. On transfer, invalidate stale ownership/eligibility and re-check before any protected action. Handle RPC outage, stale data, chain reorg, and wallet disconnect explicitly.
7. Add owner-only portal queries; distinguish unknown, verified zero holdings, stale, error and verified holdings. The delivered UI currently says unverified, never zero by assumption.

## 9. Activation and distributions — future only

Do not activate these tables/actions just to fill the dashboard. After approved rules/contracts, introduce versioned `protocol_rules`, `sources`, `epochs`, `activations`, `eligibility_snapshots`, `allocations`, `distributions` and `claims`. Store integer base-unit amounts as numeric strings, asset decimals/address, transaction hashes, chain IDs, source, period, rule version and audit provenance. Enforce idempotency and finalized-chain status; do not trust browser-computed payouts.

Close duration/epoch, fee/asset, allocation, accounting basis, claim/cadence, transfer reset and jurisdiction/tax decisions first. Tequila allocations require actual sales and approved accounting. No token is assumed. Content admin is never protocol administrator.

## 10. Mandatory staging verification

- Anonymous SELECT sees published data but cannot read drafts, roles, audit logs or wallets.
- Non-admin authenticated users cannot write content/upload files or assign roles.
- An admin can save a draft without changing public content, then publish atomically.
- Disabled projects and unpublished entries do not appear in public API JSON.
- Audit records are append-only and include the authenticated actor.
- User A cannot read user B's linked wallets/snapshots, or insert their own verification rows.
- MIME/size restrictions reject disallowed uploads.
- Revoked admin membership blocks subsequent mutations even if the UI still appears open.

These SQL policies were authored and reviewed but not executed against a database during this delivery. Run the checks before using production data.
