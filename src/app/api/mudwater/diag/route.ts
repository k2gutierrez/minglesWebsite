import { isAddress, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { json } from "@/lib/server/http";
import { gameAbi, chainId, contractAddress } from "@/lib/mudwater/game";
import { mudwaterPublicClient } from "@/lib/mudwater/chain";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/mudwater/diag
 *
 * Answers one question: can this deployment grant a pass?
 *
 * Booleans only. No key material, no derived address, nothing that helps
 * somebody who should not be here. Everything it reports is already public:
 * the contract address, the chain and whether the settings are present.
 */
export async function GET() {
  const contract = contractAddress();
  const raw = (process.env.MUDWATER_AUTHORIZER_KEY ?? "")
    .trim()
    .replace(/^export\s+/i, "")
    .replace(/^["'`]|["'`]$/g, "")
    .trim();

  const formatOk = /^0x[0-9a-fA-F]{64}$/.test(raw);

  let keyMatchesContract: boolean | null = null;
  let contractAuthorizer: string | null = null;

  if (formatOk && contract) {
    try {
      const account = privateKeyToAccount(raw as `0x${string}`);
      const onchain = await mudwaterPublicClient().readContract({
        address: contract,
        abi: gameAbi,
        functionName: "s_authorizer",
      });
      contractAuthorizer = onchain;
      keyMatchesContract =
        account.address.toLowerCase() === (onchain as Address).toLowerCase();
    } catch {
      keyMatchesContract = null;
    }
  }

  return json({
    chainId: chainId(),
    contract,
    hasContract: Boolean(contract),
    hasAuthorizerAddress: Boolean(process.env.MUDWATER_AUTHORIZER_ADDRESS),
    hasAuthorizerKey: raw.length > 0,
    keyFormatOk: formatOk,
    keyMatchesContract,
    contractAuthorizer,
    ready: Boolean(contract) && formatOk && keyMatchesContract === true,
  });
}
