import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadContent } from "@/lib/load-content";
import { entrySlug } from "@/lib/content";
import { EntryDetail } from "@/components/entry-detail";

/**
 * Ruta de DOS segmentos a propósito: la ruta dinámica `[section]` captura
 * cualquier ruta de un solo segmento y se tragaría el detalle.
 */
export const dynamic = "force-dynamic";

async function findEntry(slug: string) {
  const { content } = await loadContent();
  return content.updates.find((e) => e.published && entrySlug(e) === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = await findEntry(slug);
  if (!entry) return { title: "Update not found" };
  return {
    title: entry.title,
    description: entry.summary || undefined,
  };
}

export default async function UpdateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = await findEntry(slug);
  if (!entry) notFound();
  return <EntryDetail entry={entry} kind="updates" />;
}
