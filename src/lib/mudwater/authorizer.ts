import "server-only";
import {
  createWalletClient,
  http,
  isAddress,
  parseAbi,
  type Address,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { ApiError } from "@/lib/server/http";
import { mudwaterChain, mudwaterPublicClient } from "./chain";

/**
 * Signs grantPass on behalf of the authorizer.
 *
 * The key lives ONLY here, read from a server environment variable that is
 * never prefixed with NEXT_PUBLIC_. `import "server-only"` at the top makes the
 * build fail if this module ever ends up imported from a client component, so
 * the browser bundle can never contain it.
 *
 * The player's own wallet signs their act() transactions. Two different keys:
 * theirs stays in their extension, this one stays on the server.
 */

const abi = parseAbi(["function grantPass(address wallet, uint64 expiry)"]);

function authorizerKey(): `0x${string}` {
  // A pasted value often arrives with quotes, a stray export prefix or trailing
  // whitespace. Repair it instead of rejecting it: the same lesson we learned on
  // the other project, where a quoted key cost an afternoon.
  const raw = (process.env.MUDWATER_AUTHORIZER_KEY ?? "")
    .trim()
    .replace(/^export\s+/i, "")
    .replace(/^["'`]|["'`]$/g, "")
    .trim();

  if (!/^0x[0-9a-fA-F]{64}$/.test(raw)) {
    throw new ApiError(
      503,
      "MUDWATER_AUTHORIZER_KEY is missing or not a 32 byte hex key. Set it in the deployment environment (Production) and redeploy.",
    );
  }

  return raw as `0x${string}`;
}

function contractAddress(): Address {
  const raw = process.env.MUDWATER_CONTRACT_ADDRESS;

  if (!raw || !isAddress(raw)) {
    throw new ApiError(
      503,
      "MUDWATER_CONTRACT_ADDRESS is missing or invalid.",
    );
  }

  return raw;
}

/**
 * Sends grantPass and waits for the receipt.
 *
 * Returns the transaction hash. Throws ApiError with a 502 when the
 * transaction reverts, so the route can tell the player to retry instead of
 * pretending the pass exists.
 */
export async function grantPass(wallet: Address, expiry: number) {
  const { chain, rpc } = mudwaterChain();
  const account = privateKeyToAccount(authorizerKey());

  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(rpc, { timeout: 15_000, retryCount: 1 }),
  });

  const hash = await walletClient.writeContract({
    address: contractAddress(),
    abi,
    functionName: "grantPass",
    args: [wallet, BigInt(expiry)],
  });

  const receipt = await mudwaterPublicClient().waitForTransactionReceipt({
    hash,
    timeout: 15_000,
  });

  if (receipt.status !== "success") {
    throw new ApiError(502, "grantPass reverted onchain.");
  }

  return hash;
}
