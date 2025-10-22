import { NextResponse } from "next/server";
import { Address, beginCell, toNano } from "@ton/core";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient4 } from "@ton/ton";
import { StickerCollection, storeMintPack, type MintPack } from "@/server/wrappers/StickerCollection";

const URI_KEYS = ["uri0","uri1","uri2","uri3","uri4","uri5","uri6","uri7","uri8","uri9"] as const;
type TenUris = Record<(typeof URI_KEYS)[number], string>;

export async function POST(req: Request) {
  try {
    const { collection, uris } = (await req.json()) as { collection: string; uris: TenUris };

    // Validate basic shape
    if (!collection) return NextResponse.json({ error: "Missing collection" }, { status: 400 });
    for (const k of URI_KEYS) if (!uris?.[k]) return NextResponse.json({ error: `Missing ${k}` }, { status: 400 });

    // Use TESTNET (or mainnet when you move)
    const endpoint = await getHttpEndpoint({ network: "testnet" });
    const client = new TonClient4({ endpoint });
    const col = client.open(StickerCollection.fromAddress(Address.parse(collection)));

    const saleActive = await col.getGetSaleActive();
    if (!saleActive) return NextResponse.json({ error: "SALE_OFF" }, { status: 400 });

    const pricePerItem = await col.getGetPricePerItem(); // 0.02 TON in nano
    const packSize     = await col.getGetPackSize();     // 10n
    const packPrice    = pricePerItem * packSize;        // 0.2 TON in nano

    // Add generous buffer for 10 internal deployments (adjust if you see consistent over/under)
    const buffer       = toNano("1.2");                  // 👈 gas buffer
    const amountNano   = (packPrice + buffer).toString();

    const msg: MintPack = { $$type: "MintPack", ...uris };
    const payloadBase64 = beginCell().store(storeMintPack(msg)).endCell()
      .toBoc({ idx: false }).toString("base64");

    return NextResponse.json({ payloadBase64, amountNano });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 });
  }
}