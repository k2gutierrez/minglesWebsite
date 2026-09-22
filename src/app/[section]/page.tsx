import { notFound } from "next/navigation";
import { SectionPage } from "@/components/section-page";
export const dynamicParams = false;
const pages = [
  "tequila",
  "art",
  "story",
  "experiments",
  "play",
  "updates",
  "build-the-distillery",
];
export function generateStaticParams() {
  return pages.map((section) => ({ section }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  return {
    title: section
      .replaceAll("-", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!pages.includes(section)) notFound();
  return <SectionPage section={section} />;
}
