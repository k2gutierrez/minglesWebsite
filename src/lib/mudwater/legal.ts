/**
 * Single source of truth for the legal pages.
 *
 * Everything the Organiser still has to decide lives here as a {{TOKEN}}.
 * While any token remains, the pages render a visible DRAFT notice listing
 * exactly what is missing, so a half-filled document can never ship quietly.
 * Fill these and the notice disappears on its own.
 */

export const LEGAL = {
  version: "1.0",
  updatedAt: "2 November 2026",

  /** Legal entity that runs the promotion. Not the brand name. */
  sponsorLegalName: "{{SPONSOR_LEGAL_NAME}}",
  sponsorAddress: "{{SPONSOR_ADDRESS}}",
  contactEmail: "{{CONTACT_EMAIL}}",

  /** UTC, ISO 8601. Example: 2026-11-20T18:00:00Z */
  startAt: "{{START_AT}}",
  closeAt: "{{CLOSE_AT}}",

  /** Countries/regions where entry is not allowed. */
  excludedJurisdictions: "{{EXCLUDED_JURISDICTIONS}}",

  /** What the winner actually receives. */
  prizeDescription: "{{PRIZE_DESCRIPTION}}",
  prizeArv: "{{PRIZE_ARV}}",

  governingLaw: "{{GOVERNING_LAW}}",
  venue: "{{VENUE}}",

  minAge: 18,
} as const;

export const PENDING_FIELDS: ReadonlyArray<{ key: string; label: string }> = (
  Object.entries(LEGAL) as Array<[string, unknown]>
)
  .filter(([, value]) => typeof value === "string" && value.includes("{{"))
  .map(([key]) => ({ key, label: key }));

export const IS_DRAFT = PENDING_FIELDS.length > 0;

/** Absolute URLs, used both on the page and to paste into the X form. */
export const SITE_URL = "https://www.mingles.wtf";
export const TERMS_PATH = "/mudwater/terms";
export const PRIVACY_PATH = "/mudwater/privacy";
