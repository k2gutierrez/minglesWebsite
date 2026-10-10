import "server-only";
import type { Address } from "viem";
import { checkedClient } from "./chain";
import { ApiError } from "./http";
import { CAVA_STAKING_ADDRESS, cavaStakingAbi } from "../web3/staking";

/**
 * Cuántos Mingles tiene una wallet dentro del contrato de staking.
 *
 * Se lee en el SERVIDOR para que el RPC no tenga que estar expuesto y para
 * poder cachear. Comprueba que el contrato existe antes de leer, igual que
 * `readHoldings` con la colección.
 */
export async function readStakedCount(address: Address) {
  const client = await checkedClient();

  const code = await client.getCode({ address: CAVA_STAKING_ADDRESS });
  if (!code || code === "0x")
    throw new ApiError(
      503,
      "The staking contract is not available on this network.",
    );

  const staked = await client.readContract({
    address: CAVA_STAKING_ADDRESS,
    abi: cavaStakingAbi,
    functionName: "getUserTotalStaked",
    args: [address],
  });

  return {
    staked: staked.toString(),
    contract: CAVA_STAKING_ADDRESS,
    checkedAt: new Date().toISOString(),
  };
}
