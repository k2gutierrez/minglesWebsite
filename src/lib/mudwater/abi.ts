import { parseAbi } from "viem";

/**
 * The parts of the contract this app touches.
 *
 * Client safe on purpose: the browser needs `act` to send the player's move and
 * the same shapes to read state. The server imports these too, so there is only
 * one definition to keep in sync with the deployed contract.
 */
export const gameAbi = parseAbi([
  "function act(uint8 arena, uint8 barrel)",
  "function counts(uint8 arena) view returns (uint256[3])",
  "function s_position(uint8 arena, address wallet) view returns (uint8)",
  "function s_entered(uint8 arena, address wallet) view returns (bool)",
  "function s_lastAction(uint8 arena, address wallet) view returns (uint64)",
  "function s_passExpiry(address wallet) view returns (uint64)",
  "function i_deadline() view returns (uint64)",
]);

export const ARENA = { holders: 0, open: 1 } as const;
export type ArenaName = keyof typeof ARENA;
