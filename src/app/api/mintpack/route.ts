import { NextResponse } from "next/server";
import { beginCell, toNano } from "@ton/core";
import { storeMintPack, type MintPack } from "@/server/wrappers/StickerCollection";
import { validateTelegramInitData } from "@/lib/telegram";

const BOT_TOKEN = process.env.BOT_TOKEN || "";

// Keys for your 10 URIs
const URI_KEYS = [
  "uri0","uri1","uri2","uri3","uri4",
  "uri5","uri6","uri7","uri8","uri9",
] as const;
type TenUris = Record<(typeof URI_KEYS)[number], string>;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { collection, uris, initData } = body as {
      collection: string;
      uris: TenUris;
      initData?: string;
    };

    // ✅ Basic validation
    if (!initData) {
      return NextResponse.json({ error: "Missing Telegram initData" }, { status: 400 });
    }

    if (!BOT_TOKEN) {
      return NextResponse.json({ error: "Missing Telegram BOT_TOKEN" }, { status: 400 });
    }

    const validation = validateTelegramInitData(initData, BOT_TOKEN);
    if (!validation.ok) {
      return NextResponse.json({ error: "Invalid Telegram initData" }, { status: 401 });
    }

    if (!collection) {
      return NextResponse.json({ error: "Missing collection address" }, { status: 400 });
    }

    for (const k of URI_KEYS) {
      if (!uris?.[k] || typeof uris[k] !== "string" || uris[k].length === 0) {
        return NextResponse.json({ error: `Missing ${k}` }, { status: 400 });
      }
    }

    // ✅ Build the MintPack message with explicit type
    const msg: MintPack = {
      $$type: "MintPack",
      uri0: uris.uri0,
      uri1: uris.uri1,
      uri2: uris.uri2,
      uri3: uris.uri3,
      uri4: uris.uri4,
      uri5: uris.uri5,
      uri6: uris.uri6,
      uri7: uris.uri7,
      uri8: uris.uri8,
      uri9: uris.uri9,
    };

    // ✅ Encode MintPack payload
    const payloadCell = beginCell().store(storeMintPack(msg)).endCell();
    const payloadBase64 = payloadCell.toBoc({ idx: false }).toString("base64");

    // ✅ Calculate TON amount (5 TON + ~0.6 TON fees)
    const amountNano = (toNano("5") + toNano("0.6")).toString();

    return NextResponse.json({
      payloadBase64,
      amountNano,
      userId: validation.userId,
    });
  } catch (err: any) {
    console.error("Error in /api/mintpack:", err);
    return NextResponse.json(
      { error: err?.message ?? "Internal error" },
      { status: 500 }
    );
  }
}