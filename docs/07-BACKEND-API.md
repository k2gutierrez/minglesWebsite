# Backend Web3 — September 22, 2026

This document and `EMPIEZA_AQUI.md` supersede the earlier statements that wallet verification is unimplemented. The API and frontend are now implemented. Remote project provisioning and an end-to-end staging test with real Supabase credentials remain outstanding.

## APIs

All responses are private/no-store. Protected calls carry `Authorization: Bearer <Supabase access token>`. Mutations also require JSON and an Origin exactly matching server-side `APP_ORIGIN`. The server validates the access token with Supabase `getUser`; it never trusts the browser's user ID. No route accepts an arbitrary contract or RPC destination.

| Endpoint                     | Method / input         | Result                                                                        |
| ---------------------------- | ---------------------- | ----------------------------------------------------------------------------- |
| `/api/web3/config`           | GET; public            | Public collection/chain and configuration flags only                          |
| `/api/holder`                | GET; authenticated     | Own linked wallets and dated ownership snapshots                              |
| `/api/wallet/challenge`      | POST `{address}`       | Stored SIWE challenge ID, exact message, expiry                               |
| `/api/wallet/verify`         | POST `{id, signature}` | Verified linked wallet; one-time nonce consumed atomically                    |
| `/api/wallet/unlink`         | POST `{walletId}`      | Remove own wallet and snapshots; invalidate outstanding challenges            |
| `/api/holder/refresh`        | POST `{walletId}`      | Onchain snapshot at a fixed block; only verified linked wallets               |
| `/api/holder/token/:tokenId` | GET                    | Revalidated ownership + actual token URI, bounded metadata and IPFS image URL |

Errors use `{error: string}` and 400/401/403/409/413/415/429/503. Missing infrastructure returns 503, never a fabricated successful wallet connection.

## Security model

The server-only service-role key bypasses RLS, so the route handlers explicitly scope every wallet, challenge and snapshot lookup by the authenticated user. Database RPCs are callable only by `service_role`, except the preexisting CMS function which independently checks content-admin membership. The browser never receives this key.

Challenges contain 24 cryptographically random bytes, a five-minute expiry, the configured host/URI, chain, address, and unique request ID. The server verifies the exact stored SIWE message using viem's public-client message verification, which supports EOAs and supported smart-contract signature standards. Expiry and one-time consumption are enforced in Postgres after signature verification under a row lock. A used/expired challenge cannot link a wallet, and two accounts cannot own the same linked-wallet record.

The request body is streamed with a 16 KB bound. Nonces and rate-limit state are private; no ordinary client, including a content admin, can mutate them. Nonce cleanup is available as `cleanup_wallet_security()` to service_role; schedule it daily using your trusted server job or Supabase scheduler. No scheduler was provisioned.

Wallet-limit and API throttles are per authenticated user. Configure platform-level IP/WAF protections and Supabase Auth rate limits for internet deployment; per-account limits alone do not prevent account-creation abuse. A snapshot cannot overwrite a newer block and cannot contain duplicate or incomplete token IDs.

## Contract discovery

`collection.ts` fixes ApeChain 33139 and the supplied collection. The collection does not implement `tokenOfOwnerByIndex`/ERC721Enumerable or `tokensOfOwner`. `readHoldings` scans the configured 1..5555 range with four bounded Multicall workers, 200 IDs per batch. All results are read at one observed head-minus-12 block. This is confirmation depth, not a promise of finality. A zero `balanceOf` avoids the scan. Any mismatch between IDs found and balance rejects the new snapshot.

A full scan is acceptable as a deployable baseline for this fixed collection but has real RPC cost. Use a dedicated endpoint and a host supporting the configured 120-second refresh request duration. At larger scale, add an indexed discovery provider/global ownership cache. An indexer's candidates must still be checked onchain and compared with the same-block balance. Changing the contract may also require changing token bounds/ABI; never assume all ERC-721 collections share this enumeration strategy.

## Metadata safety

The server checks current `ownerOf` before metadata delivery. It only fetches content-addressed IPFS paths through a fixed `https://ipfs.io/ipfs/` origin. Arbitrary HTTP/private-network addresses, credentials, traversal, redirects and query strings are not followed. JSON is limited to 512 KB and a six-second fetch. Only bounded strings and an IPFS image URL are returned. A missing gateway response does not change ownership. The gallery displays a missing-media message instead.

IPFS content may be unavailable even when ownership is verified. Add a vetted redundant gateway if required. The browser loads images as images with no referrer; no HTML from NFT metadata is injected.

## Production setup

1. Apply the CMS migration, then the wallet migration to staging.
2. Configure environment values from `.env.example`; keep secrets server-only.
3. Configure email sign-in, SMTP and exact Auth redirect URLs.
4. Run `npm run check:backend` and `npm run verify:contract`.
5. Run `npm test`, `npm run typecheck`, `npm run build`.
6. Test actual login, wallet cancellation, account/network change, signature, replay rejection, refresh, metadata, unlink and user isolation.
7. Publish real CMS content. Environment-free local editing is blocked in production admin; it remains available in development.
8. Deploy to a Next.js Node-capable host with the required timeout and appropriate RPC quota. No infrastructure account/deployment has been created by this task.

## References

- [Viem SIWE message format](https://viem.sh/docs/siwe/utilities/createSiweMessage)
- [Viem public-client signature verification](https://viem.sh/docs/actions/public/verifyMessage)
- [Supabase server user verification](https://supabase.com/docs/reference/javascript/auth-getuser)
- [ApeChain documentation](https://docs.apechain.com/)

ApeChain settings were also checked against the installed viem chain definition and a live `eth_chainId` response. Contract facts were verified with read-only calls on September 22, 2026.

## Execution evidence

The actual backend reader was exercised against a public holder derived from `ownerOf(1)`. At block 49,942,597 it found 522 IDs, exactly matching the same-block balance. Measured scan time on the public RPC in that run was 1.902 seconds; this is evidence of one successful read, not a latency guarantee. Seven automated tests pass, including local PostgreSQL/RLS/challenge protections. Supabase cloud deployment and a real user wallet-signature flow are still staging checks.
