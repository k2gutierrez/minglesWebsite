import "server-only";
import { initialContent, isSiteContent } from "./content";
export async function loadContent() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key)
    return { content: initialContent, mode: "preview" as const };
  try {
    const response = await fetch(
      `${url}/rest/v1/site_content?id=eq.website&select=published`,
      {
        headers: { apikey: key },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!response.ok) throw new Error("CMS unavailable");
    const rows = await response.json();
    if (!isSiteContent(rows[0]?.published))
      throw new Error("No published website");
    return { content: rows[0].published, mode: "connected" as const };
  } catch {
    return { content: initialContent, mode: "unavailable" as const };
  }
}
