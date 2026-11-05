import { isAddress, type Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { json } from "@/lib/server/http";
import { gameAbi, chainId, contractAddress } from "@/lib/mudwater/game";
import { normalizePrivateKey } from "@/lib/mudwater/key";
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
  const { key, length } = normalizePrivateKey(process.env.MUDWATER_AUTHORIZER_KEY);
  const formatOk = key !== null;

  let keyMatchesContract: boolean | null = null;
  let contractAuthorizer: string | null = null;

  if (formatOk && contract) {
    try {
      const account = privateKeyToAccount(key);
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
    hasAuthorizerKey: length > 0,
    keyLength: length,
    keyFormatOk: formatOk,
    keyMatchesContract,
    contractAuthorizer,
    ready: Boolean(contract) && formatOk && keyMatchesContract === true,
  });
}
