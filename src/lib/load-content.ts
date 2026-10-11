import "server-only";
import { initialContent, isSiteContent, withContentDefaults } from "./content";
export async function loadContent() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  // Todo lo que sale de aquí pasa por el normalizador: un documento publicado
  // sin los campos nuevos (el de producción hoy) se completa con los valores por
  // defecto en lugar de descartarse y perder el contenido del sitio.
  if (!url || !key)
    return {
      content: withContentDefaults(initialContent),
      mode: "preview" as const,
    };
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
    return {
      content: withContentDefaults(rows[0].published),
      mode: "connected" as const,
    };
  } catch {
    return {
      content: withContentDefaults(initialContent),
      mode: "unavailable" as const,
    };
  }
}
