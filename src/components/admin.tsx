"use client";
import { useEffect, useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  Eye,
  Save,
  Upload,
  Plus,
  RotateCcw,
} from "lucide-react";
import { useSite } from "./provider";
import {
  initialContent,
  isSiteContent,
  statuses,
  type SiteContent,
  type Entry,
  type Status as BuildStatus,
} from "@/lib/content";
import { getSupabase } from "@/lib/supabase";
import { Status } from "./ui";
type Revision = { at: string; content: SiteContent };
function Field({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}
export function Admin() {
  const { content, mode, publish } = useSite();
  const [draft, setDraft] = useState<SiteContent>(content);
  const [tab, setTab] = useState("Copy");
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [media, setMedia] = useState<{ url: string; alt: string }[]>([]);
  useEffect(() => {
    if (mode === "preview" && process.env.NODE_ENV === "production") {
      setChecked(true);
      return;
    }
    if (mode === "preview") {
      try {
        const data = JSON.parse(
          localStorage.getItem("mingles-draft") || "null",
        );
        if (isSiteContent(data)) setDraft(data);
        setRevisions(
          JSON.parse(localStorage.getItem("mingles-revisions") || "[]"),
        );
        setMedia(JSON.parse(localStorage.getItem("mingles-media") || "[]"));
      } catch {}
      setAuthorized(true);
      setChecked(true);
      setReady(true);
      return;
    }
    const db = getSupabase();
    if (!db) {
      setChecked(true);
      return;
    }
    const check = async () => {
      const { data: ok } = await db.rpc("is_content_admin");
      setAuthorized(!!ok);
      setChecked(true);
      if (ok) {
        const { data } = await db
          .from("website_drafts")
          .select("document")
          .eq("id", "website")
          .maybeSingle();
        if (isSiteContent(data?.document)) setDraft(data.document);
        const { data: assets } = await db
          .from("media_assets")
          .select("url,alt")
          .order("created_at", { ascending: false });
        if (assets) setMedia(assets);
        const { data: history } = await db
          .from("admin_audit_log")
          .select("created_at,before_document")
          .order("created_at", { ascending: false })
          .limit(12);
        if (history)
          setRevisions(
            history
              .filter((r) => isSiteContent(r.before_document))
              .map((r) => ({ at: r.created_at, content: r.before_document })),
          );
        setReady(true);
      }
    };
    void check();
    const { data } = db.auth.onAuthStateChange(() => {
      setTimeout(() => void check(), 0);
    });
    return () => data.subscription.unsubscribe();
  }, [mode]);
  useEffect(() => {
    if (!ready || !authorized || mode !== "preview") return;
    const id = setTimeout(() => {
      try {
        localStorage.setItem("mingles-draft", JSON.stringify(draft));
      } catch {
        setMessage(
          "Local storage is full. Export your draft before continuing.",
        );
      }
    }, 500);
    return () => clearTimeout(id);
  }, [draft, ready, authorized, mode]);
  const updateCopy = (key: string, value: string) =>
    setDraft((d) => ({ ...d, copy: { ...d.copy, [key]: value } }));
  async function save(doPublish: boolean) {
    setBusy(true);
    setMessage("");
    if (
      !draft.hero.title.trim() ||
      draft.projects.some((p) => !p.title.trim()) ||
      [...draft.updates, ...draft.stories].some(
        (e) => !e.title.trim() || !e.summary.trim() || !e.date,
      )
    ) {
      setMessage("Add titles, dates, and summaries before saving.");
      setBusy(false);
      return;
    }
    try {
      if (mode === "preview") {
        localStorage.setItem("mingles-draft", JSON.stringify(draft));
        if (doPublish) {
          const next = [
            { at: new Date().toISOString(), content },
            ...revisions,
          ].slice(0, 12);
          localStorage.setItem("mingles-revisions", JSON.stringify(next));
          setRevisions(next);
          publish(draft);
        }
        setMessage(
          doPublish
            ? "Published to this browser preview. No production website was changed."
            : "Draft saved in this browser.",
        );
      } else {
        const db = getSupabase();
        if (!db) throw new Error("CMS connection unavailable.");
        const { error } = await db.rpc("save_website", {
          document: draft,
          should_publish: doPublish,
        });
        if (error) throw error;
        if (doPublish) publish(draft);
        setMessage(
          doPublish
            ? "Published to the connected website."
            : "Draft saved to Supabase.",
        );
      }
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Save failed. Your edits are still here.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function login(e: React.FormEvent) {
    e.preventDefault();
    const db = getSupabase();
    if (!db) return;
    setBusy(true);
    const { error } = await db.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${location.origin}/admin`,
      },
    });
    setMessage(
      error ? error.message : "Check your email for the admin sign-in link.",
    );
    setBusy(false);
  }
  function move(index: number, delta: number) {
    setDraft((d) => {
      const modules = [...d.modules];
      [modules[index], modules[index + delta]] = [
        modules[index + delta],
        modules[index],
      ];
      return { ...d, modules };
    });
  }
  function newEntry(kind: "updates" | "stories") {
    const entry: Entry = {
      id: crypto.randomUUID(),
      title: "",
      category: kind === "updates" ? "Art" : "Event",
      date: new Date().toISOString().slice(0, 10),
      summary: "",
      proof: "",
      published: false,
    };
    setDraft((d) => ({ ...d, [kind]: [entry, ...d[kind]] }));
  }
  async function upload(file?: File) {
    if (!file) return;
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      setMessage(
        "Choose a PNG, JPEG, or WebP under 2 MB. Video workflows are documented for the next integration.",
      );
      return;
    }
    setBusy(true);
    try {
      let url = "";
      if (mode === "preview") {
        url = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(String(r.result));
          r.onerror = reject;
          r.readAsDataURL(file);
        });
      } else {
        const db = getSupabase();
        if (!db) throw Error("Storage unavailable");
        const path = `${crypto.randomUUID()}.${file.type.split("/")[1]}`;
        const { error } = await db.storage
          .from("public-media")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (error) throw error;
        url = db.storage.from("public-media").getPublicUrl(path).data.publicUrl;
        const { error: metaError } = await db.from("media_assets").insert({
          url,
          alt: file.name,
          path,
          mime_type: file.type,
          size_bytes: file.size,
        });
        if (metaError) throw metaError;
      }
      const next = [...media, { url, alt: file.name }];
      if (mode === "preview")
        localStorage.setItem("mingles-media", JSON.stringify(next));
      setMedia(next);
      setMessage("Image added. Set an approved description before using it.");
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Upload failed. Local storage may be full.",
      );
    } finally {
      setBusy(false);
    }
  }
  function exportDraft() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "mingles-content-draft.json";
    link.click();
    URL.revokeObjectURL(url);
  }
  if (!checked)
    return (
      <main id="main" className="admin">
        <h1>CONTENT STUDIO</h1>
        <p>Checking access…</p>
      </main>
    );
  if (!authorized)
    return (
      <main id="main" className="admin">
        <span className="eyebrow">MINGLES / ADMIN ACCESS</span>
        <h1>CONTENT STUDIO</h1>
        <p>Sign in with your approved content admin account.</p>
        <form className="admin-login" onSubmit={login}>
          <Field label="Admin email" value={email} onChange={setEmail} />
          <button className="button button-dark" disabled={busy}>
            Send secure sign-in link
          </button>
        </form>
        <p role="status" className="message">
          {message}
        </p>
        <p className="editor-help">
          Signing in does not grant an admin role. An existing project
          administrator must assign it in Supabase.
        </p>
      </main>
    );
  return (
    <main id="main" className="admin">
      <span className="eyebrow">MINGLES / CONTENT OPERATIONS</span>
      <h1>KEEP THE BUILD ALIVE.</h1>
      <p>Copy, state, and stories. One place to shape the next chapter.</p>
      <div className="admin-notice">
        {mode === "preview"
          ? "LOCAL DESIGN STUDIO — edits stay in this browser. Drafts autosave locally; Publish updates this preview. No shared backend is connected."
          : "CONNECTED CONTENT STUDIO — publishing changes the connected public website. Save draft before reviewing."}
      </div>
      <div className="admin-toolbar">
        <Status>{mode === "preview" ? "Local draft" : "Supabase CMS"}</Status>
        <button className="button" onClick={() => setPreview(!preview)}>
          <Eye size={15} />
          {preview ? "Close preview" : "Preview"}
        </button>
        <button className="button" onClick={() => save(false)} disabled={busy}>
          <Save size={15} />
          Save draft
        </button>
        <button
          className="button button-dark"
          onClick={() => save(true)}
          disabled={busy}
        >
          <Upload size={15} />
          {busy ? "Saving…" : "Publish"}
        </button>
      </div>
      <p role="status" className="message">
        {message}
      </p>
      {preview && (
        <div className="preview-panel">
          <span className="eyebrow">
            DRAFT HERO PREVIEW / {draft.modules.filter((m) => m.enabled).length}{" "}
            ACTIVE MODULES
          </span>
          <h2>{draft.hero.title}</h2>
          <p>{draft.hero.description}</p>
          <div className="project-grid">
            {draft.projects
              .filter((p) => p.enabled)
              .slice(0, 4)
              .map((p) => (
                <div className="project-card" key={p.id}>
                  <h3>{p.title}</h3>
                  <Status>{p.status}</Status>
                </div>
              ))}
          </div>
        </div>
      )}
      <div className="admin-tabs" aria-label="Editor areas">
        {[
          "Copy",
          "Navigation",
          "Sections",
          "Progress & experiments",
          "Updates",
          "Story",
          "Media",
          "Revisions",
        ].map((t) => (
          <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      {tab === "Copy" && (
        <>
          <div className="editor-card">
            <h3>Home / hero</h3>
            <div className="editor-grid">
              {Object.entries(draft.hero).map(([key, value]) => (
                <Field
                  key={key}
                  label={key}
                  value={value}
                  multiline={["title", "description"].includes(key)}
                  onChange={(v) =>
                    setDraft((d) => ({ ...d, hero: { ...d.hero, [key]: v } }))
                  }
                />
              ))}
            </div>
          </div>
          <div className="editor-card">
            <h3>Page copy</h3>
            <div className="editor-grid">
              {Object.entries(draft.copy).map(([key, value]) => (
                <Field
                  key={key}
                  label={key}
                  value={value}
                  multiline
                  onChange={(v) => updateCopy(key, v)}
                />
              ))}
            </div>
          </div>
        </>
      )}
      {tab === "Navigation" && (
        <div className="editor-card">
          <h3>Public navigation</h3>
          <div className="editor-grid">
            {draft.nav.map((n, i) => (
              <Field
                key={i}
                label={n.href}
                value={n.label}
                onChange={(v) =>
                  setDraft((d) => ({
                    ...d,
                    nav: d.nav.map((x, j) =>
                      i === j ? { ...x, label: v } : x,
                    ),
                  }))
                }
              />
            ))}
          </div>
          <p className="editor-help">
            Routes stay fixed so copy changes cannot break page destinations.
          </p>
        </div>
      )}
      {tab === "Sections" && (
        <div className="editor-card">
          <h3>Home modules</h3>
          <p className="editor-help">
            Hide a section or change its position. Hidden modules collapse
            without leaving a gap.
          </p>
          {draft.modules.map((m, i) => (
            <div className="module-row" key={m.id}>
              <input
                aria-label={`Show ${m.label}`}
                type="checkbox"
                checked={m.enabled}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    modules: d.modules.map((x) =>
                      x.id === m.id ? { ...x, enabled: e.target.checked } : x,
                    ),
                  }))
                }
              />
              <span>{m.label}</span>
              <button
                className="icon-button"
                aria-label={`Move ${m.label} up`}
                disabled={i === 0}
                onClick={() => move(i, -1)}
              >
                <ArrowUp size={16} />
              </button>
              <button
                className="icon-button"
                aria-label={`Move ${m.label} down`}
                disabled={i === draft.modules.length - 1}
                onClick={() => move(i, 1)}
              >
                <ArrowDown size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
      {tab === "Progress & experiments" && (
        <>
          {draft.projects.map((p, i) => (
            <div className="editor-card" key={p.id}>
              <h3>{p.title}</h3>
              <div className="editor-grid">
                {(["title", "eyebrow", "description", "href"] as const).map(
                  (key) => (
                    <Field
                      key={key}
                      label={key}
                      value={p[key]}
                      multiline={key === "description"}
                      onChange={(v) =>
                        setDraft((d) => ({
                          ...d,
                          projects: d.projects.map((x, j) =>
                            j === i ? { ...x, [key]: v } : x,
                          ),
                        }))
                      }
                    />
                  ),
                )}
                <label className="field">
                  <span>Status</span>
                  <select
                    value={p.status}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        projects: d.projects.map((x, j) =>
                          j === i
                            ? { ...x, status: e.target.value as BuildStatus }
                            : x,
                        ),
                      }))
                    }
                  >
                    {statuses.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Card media</span>
                  <select
                    value={p.media || ""}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        projects: d.projects.map((x, j) =>
                          j === i
                            ? {
                                ...x,
                                media: e.target.value,
                                alt: media.find((m) => m.url === e.target.value)
                                  ?.alt,
                              }
                            : x,
                        ),
                      }))
                    }
                  >
                    <option value="">No official media selected</option>
                    {media.map((m, i) => (
                      <option key={i} value={m.url}>
                        {m.alt}
                      </option>
                    ))}
                  </select>
                </label>
                <Field
                  label="Image description / alt text"
                  value={p.alt || ""}
                  onChange={(v) =>
                    setDraft((d) => ({
                      ...d,
                      projects: d.projects.map((x, j) =>
                        j === i ? { ...x, alt: v } : x,
                      ),
                    }))
                  }
                />
              </div>
              <label className="module-row">
                <input
                  type="checkbox"
                  checked={p.enabled}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      projects: d.projects.map((x, j) =>
                        j === i ? { ...x, enabled: e.target.checked } : x,
                      ),
                    }))
                  }
                />
                Visible
              </label>
            </div>
          ))}
          <button
            className="button"
            onClick={() =>
              setDraft((d) => ({
                ...d,
                projects: [
                  ...d.projects,
                  {
                    id: `experiment-${crypto.randomUUID()}`,
                    title: "New experiment",
                    eyebrow: "PVG / EXPERIMENT",
                    status: "Building",
                    description: "",
                    href: "/experiments",
                    enabled: false,
                  },
                ],
              }))
            }
          >
            <Plus size={16} />
            Add experiment
          </button>
        </>
      )}
      {(tab === "Updates" || tab === "Story") && (
        <>
          {(() => {
            const kind = tab === "Updates" ? "updates" : "stories";
            return (
              <>
                <button className="button" onClick={() => newEntry(kind)}>
                  <Plus size={16} />
                  Create {tab === "Updates" ? "update" : "story"}
                </button>
                {draft[kind].map((entry, i) => (
                  <div className="editor-card" key={entry.id}>
                    <h3>{entry.title || "Untitled draft"}</h3>
                    <div className="editor-grid">
                      {(["title", "date", "summary", "proof"] as const).map(
                        (key) => (
                          <Field
                            key={key}
                            label={key === "proof" ? "Proof URL (HTTPS)" : key}
                            value={entry[key]}
                            multiline={key === "summary"}
                            onChange={(v) =>
                              setDraft((d) => ({
                                ...d,
                                [kind]: d[kind].map((x, j) =>
                                  j === i ? { ...x, [key]: v } : x,
                                ),
                              }))
                            }
                          />
                        ),
                      )}
                      <label className="field">
                        <span>Category</span>
                        <select
                          value={entry.category}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              [kind]: d[kind].map((x, j) =>
                                j === i
                                  ? { ...x, category: e.target.value }
                                  : x,
                              ),
                            }))
                          }
                        >
                          {(kind === "updates"
                            ? [
                                "Art",
                                "Tequila",
                                "PVG",
                                "Protocol",
                                "Migration",
                                "Company",
                              ]
                            : [
                                "Event",
                                "Party",
                                "Sponsorship",
                                "Achievement",
                                "Collaboration",
                                "Community",
                                "Product",
                              ]
                          ).map((x) => (
                            <option key={x}>{x}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label className="module-row">
                      <input
                        type="checkbox"
                        checked={entry.published}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            [kind]: d[kind].map((x, j) =>
                              j === i
                                ? { ...x, published: e.target.checked }
                                : x,
                            ),
                          }))
                        }
                      />
                      Include in next publish
                    </label>
                    <button
                      className="icon-button delete-button"
                      onClick={() =>
                        setDraft((d) => ({
                          ...d,
                          [kind]: d[kind].filter((x) => x.id !== entry.id),
                        }))
                      }
                    >
                      Remove from draft
                    </button>
                  </div>
                ))}
                {!draft[kind].length && (
                  <p className="editor-help">
                    No invented content is seeded. Add the first verified entry,
                    then preview and publish.
                  </p>
                )}
              </>
            );
          })()}
        </>
      )}
      {tab === "Media" && (
        <>
          <p className="editor-help">
            Use approved Mingles media only. PNG, JPEG, WebP · up to 2 MB.
            Select uploaded media on a progress or experiment card. Uploads to
            the public bucket are immediately public; never upload unrevealed or
            confidential material.
          </p>
          <label className="field">
            <span>Add an approved image</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={busy}
              onChange={(e) => upload(e.target.files?.[0])}
            />
          </label>
          <div className="media-grid">
            {media.map((m, i) => (
              <figure key={i}>
                <img src={m.url} alt={m.alt} />
                <figcaption>{m.alt}</figcaption>
              </figure>
            ))}
          </div>
        </>
      )}
      {tab === "Revisions" && (
        <>
          <p className="editor-help">
            Restore a previous publication to the draft, review it, then
            publish. Local history keeps the last 12 versions.
          </p>
          {revisions.map((r, i) => (
            <div className="revision-row" key={i}>
              <span>{new Date(r.at).toLocaleString()}</span>
              <button
                className="button"
                onClick={() => {
                  setDraft(r.content);
                  setMessage(
                    "Revision restored to draft. Review before publishing.",
                  );
                }}
              >
                <RotateCcw size={15} />
                Restore draft
              </button>
            </div>
          ))}
          {!revisions.length && <p>No revisions yet.</p>}
          <button className="button" onClick={exportDraft}>
            Export draft backup
          </button>
          <button
            className="button"
            onClick={() => {
              setDraft(initialContent);
              setMessage(
                "Original brief content restored to draft. Publish to apply.",
              );
            }}
          >
            Restore brief to draft
          </button>
        </>
      )}
    </main>
  );
}
