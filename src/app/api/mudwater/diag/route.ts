import { json } from "@/lib/server/http";
import { chainId, contractAddress } from "@/lib/mudwater/game";
import { mudwaterPublicClient } from "@/lib/mudwater/chain";
import { gameAbi } from "@/lib/mudwater/abi";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/mudwater/diag
 *
 * Answers one question: can this deployment read the game?
 *
 * Nothing secret: the contract address, the chain, and whether the contract
 * answers. There is no authorizer any more, so there is no key to inspect.
 */
export async function GET() {
  const contract = contractAddress();

  if (!contract) {
    return json({ chainId: chainId(), contract: null, reachable: false });
  }

  try {
    const deadline = await mudwaterPublicClient().readContract({
      address: contract,
      abi: gameAbi,
      functionName: "i_deadline",
    });

    return json({
      chainId: chainId(),
      contract,
      reachable: true,
      deadline: Number(deadline),
      closed: Date.now() / 1000 >= Number(deadline),
    });
  } catch {
    return json({ chainId: chainId(), contract, reachable: false });
  }
}
