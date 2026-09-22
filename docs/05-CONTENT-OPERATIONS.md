# Memo's content studio guide

Open `/admin`. The top notice tells you whether you are editing a local browser preview or the connected Supabase website. **Publish in local mode changes only that browser.** It does not deploy the site or change a remote project.

## Everyday workflow

1. Choose an editor area and make changes.
2. Save draft. Local mode also autosaves after a short pause; connected mode currently requires Save draft.
3. Preview the hero and build-card summary. This is a compact preview, not a full-page production draft mode.
4. Publish when ready.
5. Open the affected public page and check the result.
6. Use Revisions to restore a previous version into the draft, then review and publish it.

## Editor areas

| Area                   | Available actions                                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| Copy                   | Hero text, main page headings/descriptions, key CTAs and footer copy                                       |
| Navigation             | Change public labels while keeping routes stable                                                           |
| Sections               | Hide/reveal Home modules and move them up/down                                                             |
| Progress & experiments | Title, label, body, status, destination, visibility, image, alt text; add external experiment cards        |
| Updates                | Add/edit/remove draft records; category, date, title, summary, proof URL; include/exclude from publication |
| Story                  | Same workflow for permanent historical records                                                             |
| Media                  | Upload an approved PNG/JPEG/WebP up to 2 MB; choose it in project cards                                    |
| Revisions              | Restore a previous publication, export a JSON backup, or restore the original brief content into the draft |

An entry's "Include in next publish" checkbox is not an immediate publish button. It only controls whether the next publication includes that entry. Removing a record from a draft does not change the current public website until Publish is selected.

## Editorial rules

Every factual update should have an actual date, a precise status, a short explanation, real proof, and a next action only where useful. Do not use dummy dates or examples as public build records. The empty archive at delivery is intentional.

Use the brief's vocabulary: Revealing, Building, In development, Migration prep, Testing, Live, Complete, Archived. Only mark Live when the official route, rules, and actual service are available. No estimated earnings or arbitrary completion percentages.

Use official PVG URLs when available. Until then, cards lead to their Mingles detail section. Adding a card does not implement a game. Ownership gating and PUBLIC/HOLDER/BOTH visibility are future CMS extensions; current experiment cards appear publicly and in the portal.

## Media

Only upload assets approved for public release. Connected uploads go to a public bucket immediately; saving the page as a draft does not hide the underlying file. Use a future private staging bucket for unrevealed artwork.

The media selector applies images to experiment cards and the Home art/bottle features. The inner-page galleries and three-era token images are still placeholders awaiting their richer content model. Give every selected image an accurate alt description. Local images are stored in browser storage, which has a quota; use small optimized files and export drafts before clearing browser data.

## Limits to know

The connected workflow, email service and storage policies must be verified against your Supabase project. Local revisions keep 12 previous versions; connected history is stored in Postgres and loaded when the editor opens. Refresh the editor to see newly saved connected revisions. Scheduling, video, full-page previews, media replacement auditing, and some secondary text fields are not yet part of this editor.

For multiple editors, coordinate publication until revision conflict detection is added. Never edit private keys or contract credentials here; content administration is separate from protocol operations.
