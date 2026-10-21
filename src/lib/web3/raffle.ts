import { parseEther, type Address } from "viem";

/**
 * Contrato de la rifa de ApeFest.
 *
 * La dirección se configura con `NEXT_PUBLIC_RAFFLE_ADDRESS`; mientras no exista,
 * la página se muestra en modo "próximamente" y no intenta leer la cadena.
 */
export const RAFFLE_ADDRESS = (process.env.NEXT_PUBLIC_RAFFLE_ADDRESS ??
  "") as Address;

export const raffleConfigured = /^0x[0-9a-fA-F]{40}$/.test(RAFFLE_ADDRESS);

export const RAFFLE_PRICE = parseEther("690");
export const RAFFLE_MAX = 25;
export const RAFFLE_ID = "apefest-2026";

export const RAFFLE_ABI = [
  {
    type: "function",
    name: "getPrice",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "getMaxNumber",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    type: "function",
    name: "getCounter",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    type: "function",
    name: "getIsSellOut",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "getRaffleEnd",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "getIsCancelled",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "getWinnerInfo",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "winnerAddress", type: "address" },
          { name: "winnerNumber", type: "uint8" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getUserAddressByNumber",
    stateMutability: "view",
    inputs: [{ name: "number", type: "uint8" }],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "pickNumber",
    stateMutability: "payable",
    inputs: [{ name: "number", type: "uint8" }],
    outputs: [],
  },
  {
    type: "function",
    name: "removeNumber",
    stateMutability: "nonpayable",
    inputs: [{ name: "number", type: "uint8" }],
    outputs: [],
  },
] as const;

export type RaffleWinner = {
  winnerAddress: Address;
  winnerNumber: number;
};

export function shortAddress(address?: string) {
  return address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "";
}
