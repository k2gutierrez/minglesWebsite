import { NextResponse } from "next/server";
import { ApiError } from "@/lib/server/http";
import { readTreasury, sendAlert } from "@/lib/mudwater/treasury";

export const dynamic = "force-dynamic";

/**
 * GET /api/mudwater/health
 *
 * Reads the authorizer balance and alerts when it falls under
 * MUDWATER_MIN_APE. Meant to be hit by a cron, or by hand from a terminal.
 *
 * Auth: `Authorization: Bearer $CRON_SECRET`, or `?key=` for pingers that
 * cannot set headers. Vercel Cron sends the header on its own once CRON_SECRET
 * exists. Without the secret this only answers `{ ok: true }`, so an open URL
 * cannot be used to spam the alert channel.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const header = (request.headers.get("authorization") ?? "").replace(
    /^Bearer\s+/i,
    "",
  );
  const query = new URL(request.url).searchParams.get("key") ?? "";
  const provided = header || query;

  const allowed = secret
    ? provided === secret
    : process.env.NODE_ENV !== "production";

  if (!allowed) {
    return NextResponse.json(
      { ok: true },
      { headers: { "cache-control": "no-store" } },
    );
  }

  try {
    const { balance, threshold, ...rest } = await readTreasury();

    let alerted = false;
    if (rest.level === "low") {
      alerted = await sendAlert(
        [
          "**The Last Barrel**: authorizer wallet is low.",
          `Address: ${rest.address}`,
          `Balance: ${rest.balanceApe} APE`,
          `Threshold: ${rest.thresholdApe} APE`,
          `Chain: ${rest.chainId}`,
          "Top it up or passes will start failing.",
        ].join("\n"),
      );
    }

    return NextResponse.json(
      {
        ...rest,
        balance: balance.toString(),
        threshold: threshold.toString(),
        alerted,
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("[mudwater] treasury check failed:", error);
    return NextResponse.json(
      { error: "Could not read the authorizer balance." },
      { status: 503 },
    );
  }
}
