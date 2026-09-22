import test from "node:test";
import assert from "node:assert/strict";
import {
  COLLECTION,
  validTokenId,
  ipfsPath,
  ipfsImage,
} from "../src/lib/web3/collection.ts";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { verifyMessage } from "viem";
import { createSiweMessage } from "viem/siwe";
test("ApeChain collection and token limits are explicit", () => {
  assert.equal(COLLECTION.chain.id, 33139);
  assert.equal(
    COLLECTION.address.toLowerCase(),
    "0x6579cfd742d8982a7cdc4c00102d3087f6c6dd8e",
  );
  assert.ok(validTokenId("1"));
  assert.ok(validTokenId("5555"));
  for (const id of ["0", "5556", "-1", "1.5", "1e3"])
    assert.equal(validTokenId(id), false);
});
test("metadata cannot redirect server reads to arbitrary or private URLs", () => {
  const cid = "QmcoeRsFYeHzPD9Gx84aKD3tjLUKjvPEMSmoPs2GQmHR1t";
  assert.equal(ipfsPath(`ipfs://${cid}/1`), `${cid}/1`);
  assert.ok(
    ipfsImage(`ipfs://${cid}/1.png`).startsWith("https://ipfs.io/ipfs/"),
  );
  for (const url of [
    "http://127.0.0.1/admin",
    "https://example.com/file",
    `ipfs://${cid}/../secrets`,
    `ipfs://${cid}/%2e%2e`,
    `ipfs://${cid}?url=localhost`,
    "data:text/html,hello",
  ])
    assert.equal(ipfsPath(url), null);
});
test("signature is bound to exact domain, nonce and account", async () => {
  const account = privateKeyToAccount(generatePrivateKey());
  const other = privateKeyToAccount(generatePrivateKey());
  const message = createSiweMessage({
    address: account.address,
    chainId: 33139,
    domain: "localhost:3000",
    uri: "http://localhost:3000/portal",
    nonce: "0123456789abcdef",
    version: "1",
    expirationTime: new Date(Date.now() + 60000),
  });
  const signature = await account.signMessage({ message });
  assert.ok(
    await verifyMessage({ address: account.address, message, signature }),
  );
  assert.equal(
    await verifyMessage({ address: other.address, message, signature }),
    false,
  );
  assert.equal(
    await verifyMessage({
      address: account.address,
      message: message.replace("0123456789abcdef", "differentnonce123"),
      signature,
    }),
    false,
  );
});
