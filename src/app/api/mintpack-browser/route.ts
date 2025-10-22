import { NextResponse } from "next/server";
import { beginCell, toNano } from "@ton/core";
import { storeMintPack, type MintPack } from "@/server/wrappers/StickerCollection";

// Keep strict validation on the Telegram route.
// This route is for browser use: no initData required.
// You can still add simple protections (origin check, rate limit) below.

const URI_KEYS = [
  "uri0","uri1","uri2","uri3","uri4",
  "uri5","uri6","uri7","uri8","uri9",
] as const;
type TenUris = Record<(typeof URI_KEYS)[number], string>;

export async function POST(req: Request) {
  try {
    // (Optional) Basic origin check to mitigate abuse
    const origin = req.headers.get("origin") || "";
    if (process.env.NODE_ENV === "production" && !origin.includes("mingles.wtf")) {
      return NextResponse.json({ error: "Forbidden origin" }, { status: 403 });
    }

    const body = await req.json();
    const { collection, uris } = body as { collection: string; uris: TenUris };

    if (!collection) {
      return NextResponse.json({ error: "Missing collection address" }, { status: 400 });
    }
    for (const k of URI_KEYS) {
      if (!uris?.[k] || typeof uris[k] !== "string" || uris[k].length === 0) {
        return NextResponse.json({ error: `Missing ${k}` }, { status: 400 });
      }
    }

    const msg: MintPack = {
      $$type: "MintPack",
      uri0: uris.uri0, uri1: uris.uri1, uri2: uris.uri2, uri3: uris.uri3, uri4: uris.uri4,
      uri5: uris.uri5, uri6: uris.uri6, uri7: uris.uri7, uri8: uris.uri8, uri9: uris.uri9,
    };

    const payloadCell = beginCell().store(storeMintPack(msg)).endCell();
    const payloadBase64 = payloadCell.toBoc({ idx: false }).toString("base64");

    // 5 TON + buffer (~0.6 TON for 10 internal deploys)
    const amountNano = (toNano("5") + toNano("0.8")).toString();

    return NextResponse.json({ payloadBase64, amountNano });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err?.message ?? "Internal error" }, { status: 500 });
  }
}