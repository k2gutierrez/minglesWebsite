import "dotenv/config";
import { TonClient, internal, WalletContractV5R1 } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";
import { beginCell, toNano, Address, SendMode } from "@ton/core"; // 👈 add SendMode
import { getHttpEndpoint } from "@orbs-network/ton-access";

import { storeMintPack } from "../src/server/wrappers/StickerCollection";

async function main() {
  const MNEMONIC = process.env.MNEMONIC!;
  const COLLECTION = process.env.COLLECTION!;
  const NETWORK = process.env.NETWORK || "mainnet";

  if (!MNEMONIC || !COLLECTION) {
    throw new Error("Missing MNEMONIC or COLLECTION in .env");
  }

  const endpoint = await getHttpEndpoint({ network: NETWORK as any });
  const client = new TonClient({ endpoint });

  const keyPair = await mnemonicToPrivateKey(MNEMONIC.split(" "));
  const wallet = WalletContractV5R1.create({ workchain: 0, publicKey: keyPair.publicKey });
  const walletContract = client.open(wallet);

  const seqno = await walletContract.getSeqno();
  const collectionAddr = Address.parse(COLLECTION);

  const BASE_CID = "bafybeiejti2pggxqo5r2guonr5fz2gddkavhxxlmmkhyqzllnzk62meury";
  const uris = Array.from({ length: 10 }, (_, i) => `ipfs://${BASE_CID}/metadata/${i}.json`);

  const msg = {
    $$type: "MintPack",
    uri0: uris[0], uri1: uris[1], uri2: uris[2], uri3: uris[3], uri4: uris[4],
    uri5: uris[5], uri6: uris[6], uri7: uris[7], uri8: uris[8], uri9: uris[9],
  } as const;

  const payloadCell = beginCell().store(storeMintPack(msg)).endCell();

  // 5 TON + buffer
  const totalAmount = toNano("1.2");

  console.log("Minting pack...");
  await walletContract.sendTransfer({
    secretKey: keyPair.secretKey,
    seqno,
    sendMode: SendMode.PAY_GAS_SEPARATELY, // 👈 required by v5
    messages: [
      internal({
        to: collectionAddr,
        value: totalAmount,
        bounce: true,
        body: payloadCell,
      }),
    ],
  });

  console.log("✅ MintPack transaction sent!");
  console.log("Collection:", COLLECTION);
  console.log("Check on TON explorer shortly.");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});