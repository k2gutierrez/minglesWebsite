import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { initialContent } from "../src/lib/content.ts";
const userA = "11111111-1111-4111-8111-111111111111",
  userB = "22222222-2222-4222-8222-222222222222";
const wallet = "0x1111111111111111111111111111111111111111";
test("Postgres migrations: RLS, publication isolation, nonce replay, wallet binding, snapshot consistency", async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
 create schema auth;create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid,bucket_id text);
 alter table storage.objects enable row level security;grant usage on schema public,auth,storage to anon,authenticated,service_role;`);
    for (const file of [
      "202609210001_content_foundation.sql",
      "202609220002_wallet_backend.sql",
    ])
      await db.exec(
        await readFile(
          new URL("../supabase/migrations/" + file, import.meta.url),
          "utf8",
        ),
      );
    await db.query("insert into auth.users(id) values ($1),($2)", [
      userA,
      userB,
    ]);
    await db.query(
      "insert into public.admin_roles(user_id,role) values($1,'super_admin')",
      [userA],
    );
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
      userA,
    ]);
    await db.exec("set role authenticated");
    const draft = structuredClone(initialContent);
    draft.updates = [
      {
        id: "draft-proof",
        title: "Secret draft",
        category: "Art",
        date: "2026-09-22",
        summary: "Not approved",
        proof: "",
        published: false,
      },
    ];
    await db.query("select public.save_website($1::jsonb,true)", [
      JSON.stringify(draft),
    ]);
    assert.equal(
      (await db.query("select published from public.site_content")).rows[0]
        .published.updates.length,
      0,
    );
    assert.equal(
      (await db.query("select document from public.website_drafts")).rows[0]
        .document.updates.length,
      1,
    );
    await assert.rejects(
      db.query("select public.consume_wallet_challenge($1,$2)", [userA, userA]),
      /permission denied/,
    );
    await db.exec("reset role");
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
      userB,
    ]);
    await db.exec("set role authenticated");
    assert.equal(
      (await db.query("select * from public.website_drafts")).rows.length,
      0,
    );
    await assert.rejects(
      db.query("select public.save_website($1::jsonb,true)", [
        JSON.stringify(initialContent),
      ]),
      /Content admin access required/,
    );
    await assert.rejects(
      db.query(
        "insert into public.admin_roles(user_id,role) values($1,'super_admin')",
        [userB],
      ),
      /permission denied|row-level security/,
    );
    await db.exec("reset role");
    const id = "33333333-3333-4333-8333-333333333333";
    await db.query(
      "insert into wallet_challenges(id,user_id,address,chain_id,message,expires_at) values($1,$2,$3,33139,'exact server message',now()+interval '5 minutes')",
      [id, userA, wallet],
    );
    const linked = (
      await db.query("select consume_wallet_challenge($1,$2) as wallet", [
        id,
        userA,
      ])
    ).rows[0].wallet;
    assert.equal(linked.address, wallet);
    await assert.rejects(
      db.query("select consume_wallet_challenge($1,$2)", [id, userA]),
      /Expired or consumed/,
    );
    await db.query(
      "insert into wallet_challenges(id,user_id,address,chain_id,message,expires_at) values($1,$2,$3,33139,'another account',now()+interval '5 minutes')",
      [userB, userB, wallet],
    );
    await assert.rejects(
      db.query("select consume_wallet_challenge($1,$2)", [userB, userB]),
      /another account/,
    );
    assert.equal(
      (
        await db.query("select used_at from wallet_challenges where id=$1", [
          userB,
        ])
      ).rows[0].used_at,
      null,
    );
    await db.query(
      "select save_holder_snapshot($1,$2,$3,$4::jsonb,'2','100',now())",
      [linked.id, userA, wallet, '["1","2"]'],
    );
    await assert.rejects(
      db.query(
        "select save_holder_snapshot($1,$2,$3,$4::jsonb,'2','101',now())",
        [linked.id, userA, wallet, '["1"]'],
      ),
      /Incomplete/,
    );
    await assert.rejects(
      db.query(
        "select save_holder_snapshot($1,$2,$3,$4::jsonb,'2','101',now())",
        [linked.id, userA, wallet, '["1","1"]'],
      ),
      /Duplicate/,
    );
    await assert.rejects(
      db.query(
        "select save_holder_snapshot($1,$2,$3,$4::jsonb,'2','99',now())",
        [linked.id, userA, wallet, '["1","2"]'],
      ),
      /Older block/,
    );
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
      userB,
    ]);
    await db.exec("set role authenticated");
    assert.equal(
      (await db.query("select * from linked_wallets")).rows.length,
      0,
    );
    assert.equal(
      (await db.query("select * from holder_snapshots")).rows.length,
      0,
    );
    await assert.rejects(
      db.query("select * from wallet_challenges"),
      /permission denied/,
    );
    await db.exec("reset role");
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
      userA,
    ]);
    await db.exec("set role authenticated");
    assert.equal(
      (await db.query("select * from holder_snapshots")).rows.length,
      1,
    );
    await db.exec("reset role");
    assert.equal(
      (await db.query("select take_api_slot($1,'refresh',1,60) as ok", [userA]))
        .rows[0].ok,
      true,
    );
    assert.equal(
      (await db.query("select take_api_slot($1,'refresh',1,60) as ok", [userA]))
        .rows[0].ok,
      false,
    );
    await db.query("select unlink_holder_wallet($1,$2)", [linked.id, userA]);
    assert.equal(
      (await db.query("select * from holder_snapshots")).rows.length,
      0,
    );
    await db.exec("set role anon");
    assert.equal(
      (await db.query("select published from site_content")).rows.length,
      1,
    );
    await assert.rejects(
      db.query("select * from wallet_challenges"),
      /permission denied/,
    );
  } finally {
    await db.close();
  }
});
