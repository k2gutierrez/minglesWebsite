/**
 * Single source of truth for the legal pages.
 *
 * Everything here was supplied by the Organiser. While any value still holds a
 * {{TOKEN}}, the pages render a visible DRAFT notice, so a half-filled document
 * cannot ship quietly. Fill them and the notice disappears on its own.
 */

export const LEGAL = {
  version: "1.0",
  updatedAt: "11 November 2026",

  /** Legal entity that runs the promotion. Not the brand name. */
  sponsorLegalName: "Mingles NFT DAO LLC",
  sponsorType: "a decentralized autonomous organisation limited liability company",
  sponsorRegistration: "2024-001427414",
  sponsorIncorporated: "18 March 2024 in Wyoming, United States",
  sponsorAddress: "30 N. Gould St., Ste R, Sheridan, WY 82801, United States",
  sponsorPresident: "Guillermo Gutiérrez",

  /** The person who operates the Promotion day to day. */
  operatorName: "Guillermo Gutiérrez, known as MBAMemo",
  operatorHandle: "@Memo_Chimal",
  operatorXUrl: "https://x.com/Memo_Chimal",

  contactEmail: "mingles@mingles.wtf",
  privacyEmail: "minglesnft@gmail.com",
  disputesEmail: "mingles@mingles.wtf",

  /** Readable UTC, shown as-is next to the word UTC. */
  startAt: "12 November 2026 at 06:00",
  closeAt: "15 November 2026 at 05:59",
  startAtLocal: "12 November 2026 at 00:00",
  closeAtLocal: "14 November 2026 at 23:59",

  /** The NFT the holders arena checks. */
  collection: "0x6579cfd742d8982a7cdc4c00102d3087f6c6dd8e",
  collectionExplorer:
    "https://apechain.blockscout.com/address/0x6579cfd742d8982a7cdc4c00102d3087f6c6dd8e",

  /** Where the prize is sent from. */
  deliveryWallet: "CZNNH8pkWQbrMZBQNSGHtpdRj2VQECAkCobwdnVo2vUh",

  /** Countries/regions where entry is not allowed. */
  excludedJurisdictions:
    "Entry is void where prohibited or restricted by law, and where a promotion of this kind would require a registration, licence or permit the Organiser does not hold. The Organiser may publish a list of excluded territories before entries open.",

  /** What the winner actually receives. */
  prizeDescription:
    "two (2) Mudwater packs, one for each arena, delivered as digital assets on the Solana network",
  prizeArv:
    "no purchase is necessary, there is no cash alternative, and no retail price is stated for the Promotion",

  governingLaw:
    "the laws of the State of Wyoming, United States, excluding its conflict of law rules",
  venue:
    "the state and federal courts located in Sheridan County, Wyoming, United States",

  minAge: 18,

  /** Times the winner has to claim, and the operator to deliver. */
  claimHours: 24,
  deliveryHours: 48,
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
