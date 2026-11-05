import "server-only";
import {
  formatEther,
  getAddress,
  isAddress,
  parseEther,
  type Address,
} from "viem";
import { ApiError } from "@/lib/server/http";
import { mudwaterPublicClient } from "./chain";

/**
 * Watches the authorizer wallet.
 *
 * That wallet pays the gas for every grantPass. If it runs dry the game stops
 * quietly: players declare their post, the transaction reverts, and nobody gets
 * a pass. So we read the balance and shout when it gets thin.
 */

export type TreasuryLevel = "ok" | "low";

export interface Treasury {
  address: Address;
  chainId: number;
  balance: bigint;
  balanceApe: string;
  threshold: bigint;
  thresholdApe: string;
  level: TreasuryLevel;
}

export function classifyBalance(
  balance: bigint,
  threshold: bigint,
): TreasuryLevel {
  return balance < threshold ? "low" : "ok";
}

export async function readTreasury(): Promise<Treasury> {
  const raw = process.env.MUDWATER_AUTHORIZER_ADDRESS;
  if (!raw || !isAddress(raw)) {
    throw new ApiError(
      503,
      "MUDWATER_AUTHORIZER_ADDRESS is missing or not a valid address.",
    );
  }

  const client = mudwaterPublicClient();
  const address = getAddress(raw);

  const balance = await client.getBalance({ address });
  const threshold = parseEther(process.env.MUDWATER_MIN_APE ?? "5");

  return {
    address,
    chainId: client.chain.id,
    balance,
    balanceApe: formatEther(balance),
    threshold,
    thresholdApe: formatEther(threshold),
    level: classifyBalance(balance, threshold),
  };
}

/**
 * Posts to a chat webhook. Discord by default, Slack if you say so.
 * Returns false when nothing is configured, so callers can stay quiet.
 */
export async function sendAlert(text: string): Promise<boolean> {
  const url = process.env.ALERT_WEBHOOK_URL;
  if (!url) return false;

  const kind = (process.env.ALERT_WEBHOOK_KIND ?? "discord").toLowerCase();
  const body = kind === "slack" ? { text } : { content: text };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5_000),
    });

    if (!response.ok) {
      console.error("[mudwater] alert webhook returned", response.status);
    }
    return response.ok;
  } catch (error) {
    console.error("[mudwater] alert webhook failed:", error);
    return false;
  }
}
