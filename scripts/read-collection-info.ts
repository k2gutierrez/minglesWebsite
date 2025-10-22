import "dotenv/config";
import { Address } from "@ton/core";
import { TonClient4 } from "@ton/ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { StickerCollection } from "../src/server/wrappers/StickerCollection";

async function main() {
  const COLLECTION = process.env.COLLECTION!;
  const NETWORK = process.env.NETWORK || "testnet";
  const endpoint = await getHttpEndpoint({ network: NETWORK as any });
  const client = new TonClient4({ endpoint });
  const col = client.open(StickerCollection.fromAddress(Address.parse(COLLECTION)));

  const pricePerItem = await col.getGetPricePerItem(); // bigint nano
  const packSize     = await col.getGetPackSize();     // 10n
  const saleActive   = await col.getGetSaleActive();
  const nextIndex    = await col.getGetNextIndex();
  const maxSupply    = await col.getGetMaxSupply();

  const toTon = (n: bigint) => Number(n) / 1e9;

  console.log({
    pricePerItem_nano: pricePerItem.toString(),
    pricePerItem_TON:  toTon(pricePerItem),
    packSize:          packSize.toString(),
    saleActive,
    nextIndex:         nextIndex.toString(),
    maxSupply:         maxSupply.toString(),
  });
}

main();