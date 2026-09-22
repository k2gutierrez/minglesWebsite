import test from "node:test";
import assert from "node:assert/strict";
import { initialContent, isSiteContent, safeHref } from "../src/lib/content.ts";
test("links allow internal routes, anchors, and HTTPS only", () => {
  for (const url of [
    "/art",
    "/experiments#gluttons",
    "#building",
    "https://example.com/proof",
  ])
    assert.equal(safeHref(url), url);
  for (const url of [
    "javascript:alert(1)",
    "//example.com",
    "data:text/html,test",
    "http://example.com",
    "/\\example.com",
  ])
    assert.equal(safeHref(url), "/updates");
});
test("content rejects missing and malformed nested records", () => {
  assert.ok(isSiteContent(initialContent));
  for (const value of [
    null,
    {},
    { ...initialContent, projects: [null] },
    { ...initialContent, hero: { title: "Only title" } },
    { ...initialContent, updates: [{ title: "Missing fields" }] },
  ])
    assert.equal(isSiteContent(value), false);
});
test("seed does not invent published proof or distribution data", () => {
  assert.equal(initialContent.updates.length, 0);
  assert.equal(initialContent.stories.length, 0);
  assert.ok(!initialContent.projects.some((p) => p.status === "Live"));
  assert.equal(
    initialContent.modules.length,
    new Set(initialContent.modules.map((m) => m.id)).size,
  );
});
