import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { verifyMessage } from "viem";
import {
  raffleEntryMessage,
  raffleOwnerEntriesMessage,
  raffleWithdrawalMessage,
} from "../src/lib/web3/raffle-message.ts";

const walletA = "0x1111111111111111111111111111111111111111";
const walletB = "0x2222222222222222222222222222222222222222";
const contract = "0xf72288994ab6602E96f09d872eBC7d46d1849901";

test("raffle messages bind the chain and the contract", () => {
  const entry = raffleEntryMessage({
    number: 7,
    address: walletA,
    name: "Ada",
    email: "ADA@example.com",
    phone: "+52 55 1234 5678",
    chainId: 33111,
    contract: "0xf72288994ab6602E96f09d872eBC7d46d1849901",
  });
  assert.match(entry, /Chain ID: 33111/);
  assert.match(entry, /Contract: 0xf72288994ab6602e96f09d872ebc7d46d1849901/);
  assert.match(entry, /Number: 7/);
  assert.match(entry, /Contact hash: 0x[0-9a-f]{64}/);
  // La info personal NO debe aparecer en MetaMask.
  assert.doesNotMatch(entry, /ada@example\.com/i);
  assert.doesNotMatch(entry, /Ada/);
  assert.doesNotMatch(entry, /\+52/);
  assert.doesNotMatch(entry, /Phone or Twitter:/);

  const otherEmail = raffleEntryMessage({
    number: 7,
    address: walletA,
    name: "Ada",
    email: "other@example.com",
    phone: "+52 55 1234 5678",
    chainId: 33111,
    contract: "0xf72288994ab6602E96f09d872eBC7d46d1849901",
  });
  // Cambiar el contacto cambia el hash y la firma.
  assert.notEqual(entry, otherEmail);

  const mainnet = raffleEntryMessage({
    number: 7,
    address: walletA,
    name: "Ada",
    email: "ada@example.com",
    phone: "+52 55 1234 5678",
    chainId: 1,
    contract: "0x0000000000000000000000000000000000000001",
  });
  assert.notEqual(entry, mainnet);

  const withdrawal = raffleWithdrawalMessage({
    number: 7,
    address: walletA,
    chainId: 33111,
    contract: "0xf72288994ab6602E96f09d872eBC7d46d1849901",
  });
  assert.match(withdrawal, /withdraw entry/);
  assert.match(withdrawal, /Number: 7/);
  assert.notEqual(entry, withdrawal);
});

test("owner buyer-list message is bound to chain, contract and timestamp", () => {
  const message = raffleOwnerEntriesMessage({
    address: walletA,
    chainId: 33111,
    contract,
    timestamp: 1_760_000_000_000,
  });
  assert.match(message, /owner buyer list/);
  assert.match(message, /Chain ID: 33111/);
  assert.match(message, /Contract: 0xf72288994ab6602e96f09d872ebc7d46d1849901/);
  assert.match(message, /Wallet: 0x1111111111111111111111111111111111111111/);
  assert.match(message, /Timestamp: 1760000000000/);
});

test("browser and server construct exactly the same message", () => {
  const fromBrowser = raffleEntryMessage({
    number: 3,
    address: walletA,
    name: "  Ada  ",
    email: "ADA@Example.com ",
    phone: " +52 55 1234 5678 ",
    note: "  hello  ",
    chainId: 33111,
    contract,
  });
  const fromServer = raffleEntryMessage({
    number: 3,
    address: walletA,
    name: "Ada",
    email: "ada@example.com",
    phone: "+52 55 1234 5678",
    note: "hello",
    chainId: 33111,
    contract,
  });
  assert.equal(fromBrowser, fromServer);
});

test("the signed entry message verifies with the wallet that signed it", async () => {
  const account = privateKeyToAccount(generatePrivateKey());
  const message = raffleEntryMessage({
    number: 5,
    address: account.address,
    name: "Ada",
    email: "ada@example.com",
    phone: "+52 55 1234 5678",
    chainId: 33111,
    contract,
  });
  const signature = await account.signMessage({ message });
  assert.ok(await verifyMessage({ address: account.address, message, signature }));

  const other = privateKeyToAccount(generatePrivateKey());
  const tampered = message.replace("Number: 5", "Number: 6");
  assert.equal(
    await verifyMessage({ address: other.address, message, signature }),
    false,
  );
  assert.equal(
    await verifyMessage({ address: account.address, message: tampered, signature }),
    false,
  );
});

test("raffle_entries migration separates Curtis from Ethereum mainnet", async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon;
      create role authenticated;
      create role service_role bypassrls;
      create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$
        select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
      $$;
      create schema storage;
      create table storage.buckets(
        id text primary key,
        name text,
        public boolean,
        file_size_limit bigint,
        allowed_mime_types text[]
      );
      create table storage.objects(id uuid, bucket_id text);
      alter table storage.objects enable row level security;
      grant usage on schema public, auth, storage to anon, authenticated, service_role;
    `);

    for (const file of [
      "202609210001_content_foundation.sql",
      "202609220002_wallet_backend.sql",
      "202610210003_raffle_entries.sql",
    ]) {
      await db.exec(
        await readFile(
          new URL("../supabase/migrations/" + file, import.meta.url),
          "utf8",
        ),
      );
    }

    // Fila creada antes de separar por red: debe quedar marcada como Curtis.
    await db.query(
      `insert into public.raffle_entries
        (raffle, number, wallet, name, email, phone)
       values ('apefest-2026', 7, $1, 'Legacy', 'legacy@example.com', '+521234567890')`,
      [walletA],
    );

    await db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/202610230004_raffle_entries_chain.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );

    const legacy = await db.query(
      "select chain_id, network from public.raffle_entries where wallet = $1",
      [walletA],
    );
    assert.equal(legacy.rows.length, 1);
    assert.equal(legacy.rows[0].chain_id, 33111);
    assert.equal(legacy.rows[0].network, "curtis");

    // El mismo número en Ethereum mainnet no choca con Curtis.
    await db.query(
      `insert into public.raffle_entries
        (raffle, chain_id, number, wallet, name, email, phone)
       values ('apefest-2026', 1, 7, $1, 'Mainnet', 'mainnet@example.com', '+521234567891')`,
      [walletB],
    );

    const both = await db.query(
      "select chain_id from public.raffle_entries order by chain_id",
    );
    assert.deepEqual(
      both.rows.map((row) => row.chain_id),
      [1, 33111],
    );

    // El mismo número repetido en la misma red sí se rechaza.
    await assert.rejects(
      db.query(
        `insert into public.raffle_entries
          (raffle, chain_id, number, wallet, name, email, phone)
         values ('apefest-2026', 33111, 7, $1, 'Dup', 'dup@example.com', '+521234567892')`,
        [walletB],
      ),
      /raffle_entries_raffle_chain_number_key|duplicate key/i,
    );

    // chain_id 0 no es una red válida.
    await assert.rejects(
      db.query(
        `insert into public.raffle_entries
          (raffle, chain_id, number, wallet, name, email, phone)
         values ('apefest-2026', 0, 8, $1, 'Zero', 'zero@example.com', '+521234567893')`,
        [walletB],
      ),
      /raffle_entries_chain_id_check|check constraint/i,
    );

    // La migración debe poder correrse dos veces sin romper nada.
    await db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/202610230004_raffle_entries_chain.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );

    const constraint = await db.query(
      `select conname from pg_constraint
       where conname = 'raffle_entries_raffle_chain_number_key'`,
    );
    assert.equal(constraint.rows.length, 1);

    // El campo phone ahora acepta un handle corto de Twitter/X.
    const phoneMigration = await readFile(
      new URL(
        "../supabase/migrations/202610230005_raffle_phone_or_twitter.sql",
        import.meta.url,
      ),
      "utf8",
    );
    await db.exec(phoneMigration);
    await db.exec(phoneMigration); // idempotente

    await db.query(
      `insert into public.raffle_entries
        (raffle, chain_id, number, wallet, name, email, phone)
       values ('apefest-2026', 1, 8, $1, 'Twitter', 'x@example.com', '@k2')`,
      [walletB],
    );

    const twitter = await db.query(
      "select phone from public.raffle_entries where wallet = $1 and number = 8",
      [walletB],
    );
    assert.equal(twitter.rows.length, 1);
    assert.equal(twitter.rows[0].phone, "@k2");

    const phoneCheck = await db.query(
      `select conname from pg_constraint
       where conname = 'raffle_entries_phone_check'`,
    );
    assert.equal(phoneCheck.rows.length, 1);
  } finally {
    await db.close();
  }
});
