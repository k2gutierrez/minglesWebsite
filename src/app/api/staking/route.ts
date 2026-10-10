import { NextResponse } from "next/server";
import { isAddress, type Address } from "viem";
import { readStakedCount } from "@/lib/server/staking";
import { ApiError } from "@/lib/server/http";

export const dynamic = "force-dynamic";

/**
 * Cuántos Mingles tiene una wallet staked en el contrato de CAVA.
 *
 * Solo LECTURA: la recuperación la firma el usuario con su propia wallet, así
 * que aquí no se toca ninguna llave.
 */
export async function GET(request: Request) {
  const address = new URL(request.url).searchParams.get("address");

  if (!address)
    return NextResponse.json({ error: "Missing address." }, { status: 400 });

  if (!isAddress(address))
    return NextResponse.json(
      { error: "That is not a valid EVM address." },
      { status: 400 },
    );

  try {
    const result = await readStakedCount(address as Address);
    return NextResponse.json(result, {
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    if (error instanceof ApiError)
      return NextResponse.json({ error: error.message }, { status: error.status });

    console.error("[mingles] staking read failed:", error);
    return NextResponse.json(
      { error: "The chain could not be read right now." },
      { status: 502 },
    );
  }
}
