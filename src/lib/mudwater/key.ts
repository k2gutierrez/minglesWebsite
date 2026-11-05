import "server-only";

/**
 * Cleans a private key pasted into a dashboard.
 *
 * Three mistakes account for almost all of these: the value arrives with
 * quotes or an `export ` prefix, the `0x` is missing because the export tool
 * dropped it, or the hex was capitalised. All three are repaired here instead
 * of being rejected, because the person pasting it has the right key.
 */
export function normalizePrivateKey(raw: string | undefined): {
  key: `0x${string}` | null;
  length: number;
} {
  const original = (raw ?? "").trim();
  let value = original
    .replace(/^export\s+/i, "")
    .replace(/^["'`]|["'`]$/g, "")
    .trim();

  if (value.startsWith("0X")) value = "0x" + value.slice(2);
  if (/^[0-9a-fA-F]{64}$/.test(value)) value = "0x" + value;

  const ok = /^0x[0-9a-fA-F]{64}$/.test(value);

  return { key: ok ? (value as `0x${string}`) : null, length: original.length };
}
