import "server-only";
import { createPublicClient, fallback, http } from "viem";
import { COLLECTION } from "@/lib/web3/collection";
import { apeChainCurtis } from "@/lib/web3/chains";

/**
 * Which chain the game lives on, and the RPC that talks to it.
 *
 * MUDWATER_CHAIN_ID picks it: 33111 for Curtis, anything else means ApeChain
 * mainnet. Kept in one place so the reader, the signer and the health check
 * can never disagree about the network.
 */
export function mudwaterChain() {
  const testnet =
    Number(process.env.MUDWATER_CHAIN_ID ?? 33139) === apeChainCurtis.id;
  const chain = testnet ? apeChainCurtis : COLLECTION.chain;
  const configured =
    (testnet ? process.env.CURTIS_RPC_URL : process.env.APECHAIN_RPC_URL) ?? "";

  const rpc = /^https?:\/\//i.test(configured.trim())
    ? configured.trim()
    : chain.rpcUrls.default.http[0];

  return { chain, rpc };
}

/**
 * A client for `eth_getLogs`.
 *
 * Some providers, Alchemy among them, answer the configured RPC for calls and
 * block numbers but refuse log queries. The draw only reads logs, so it gets
 * its own transport and falls back to the chain's public endpoint.
 */
export function mudwaterLogClient() {
  const { chain } = mudwaterChain();

  // Log queries do not work everywhere. The configured RPC happily serves
  // eth_call and eth_blockNumber and then rejects eth_getLogs with a payload
  // error, which is exactly what happened with the Alchemy endpoint. The chain
  // public endpoints do answer it, and viem tries them in order, so the log
  // read never depends on a provider that may refuse it.
  const urls = chain.rpcUrls.default.http;

  return createPublicClient({
    chain,
    transport: fallback(
      urls.map((url) => http(url, { timeout: 20_000, retryCount: 1 })),
    ),
  });
}

export function mudwaterPublicClient() {
  const { chain, rpc } = mudwaterChain();

  // The configured RPC is tried first, but a dead or rate limited provider must
  // never take the game down: the chain's public endpoints are next in line.
  const urls = [...new Set([rpc, ...chain.rpcUrls.default.http])].filter((url) =>
    /^https?:\/\//i.test(url ?? ""),
  );

  if (urls.length === 1) {
    return createPublicClient({
      chain,
      transport: http(urls[0], { timeout: 10_000, retryCount: 1 }),
    });
  }

  return createPublicClient({
    chain,
    transport: fallback(
      urls.map((url) => http(url, { timeout: 10_000, retryCount: 1 })),
    ),
  });
}
