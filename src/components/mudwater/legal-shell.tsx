import Link from "next/link";
import {
  IS_DRAFT,
  LEGAL,
  PENDING_FIELDS,
  PRIVACY_PATH,
  TERMS_PATH,
} from "@/lib/mudwater/legal";

/**
 * Renders a value that is still a {{TOKEN}} as a visible highlight, so a
 * placeholder can never pass for finished copy.
 */
export function Fill({ value }: { value: string }) {
  if (!value.includes("{{")) return <>{value}</>;
  return <mark className="mw-fill">{value.replace(/[{}]/g, "")}</mark>;
}

function DraftNotice() {
  return (
    <aside className="mw-draft" role="note">
      <strong>Draft — not final.</strong> This document is missing{" "}
      {PENDING_FIELDS.length} field{PENDING_FIELDS.length === 1 ? "" : "s"} that only
      the Organiser can supply. They are highlighted in coral throughout, and this
      notice disappears once every one is filled in{" "}
      <code>src/lib/mudwater/legal.ts</code>.
      <ul>
        {PENDING_FIELDS.map((field) => (
          <li key={field.key}>
            <code>{field.key}</code>
          </li>
        ))}
      </ul>
      <span className="mw-draft-foot">
        Not reviewed by counsel. Do not enable entries until it is.
      </span>
    </aside>
  );
}

export function LegalShell({
  current,
  kicker,
  title,
  intro,
  children,
}: {
  current: "terms" | "privacy";
  kicker: string;
  title: string;
  intro: React.ReactNode;
  children: React.ReactNode;
}) {
  const other = current === "terms" ? PRIVACY_PATH : TERMS_PATH;
  const otherLabel = current === "terms" ? "Privacy policy" : "Official rules";

  return (
    <main id="main" className="mw-page">
      <div className="mw-shell">
        <article className="mw-doc">
          <p className="mw-eyebrow">{kicker}</p>
          <h1 className="mw-doc-title">{title}</h1>
          <div className="mw-doc-meta">
            <span>Version {LEGAL.version}</span>
            <span>Last updated {LEGAL.updatedAt}</span>
            <span>English version controls</span>
          </div>
          <p className="mw-doc-intro">{intro}</p>

          {IS_DRAFT && <DraftNotice />}

          <div className="mw-doc-body">{children}</div>

          <footer className="mw-doc-foot">
            <Link href="/mudwater">← Back to The Last Barrel</Link>
            <Link href={other}>{otherLabel}</Link>
          </footer>
        </article>
      </div>
    </main>
  );
}
