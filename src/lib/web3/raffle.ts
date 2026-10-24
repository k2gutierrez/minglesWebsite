import type { Address } from "viem";
import { raffleChain } from "./chains";

/**
 * Contrato de la rifa de ApeFest con sorteo offchain.
 *
 * No usa Chainlink ni vRNG. El owner elige el número ganador fuera de la cadena
 * y lo registra con `setWinner`; después retira el pozo. Los compradores pueden
 * salir y recuperar su dinero mientras el ganador no esté registrado.
 *
 * La red activa se elige con `NEXT_PUBLIC_RAFFLE_CHAIN_ID` y la dirección con
 * la variable específica de esa red. La dirección antigua
 * `NEXT_PUBLIC_RAFFLE_ADDRESS` solo se acepta en ApeChain (33139) o Curtis
 * (33111) para no apuntar mainnet al contrato equivocado.
 */

const legacyAddress = process.env.NEXT_PUBLIC_RAFFLE_ADDRESS ?? "";
const addressByChain: Record<number, string | undefined> = {
  1: process.env.NEXT_PUBLIC_RAFFLE_ADDRESS_MAINNET,
  11155111: process.env.NEXT_PUBLIC_RAFFLE_ADDRESS_SEPOLIA,
  33111: process.env.NEXT_PUBLIC_RAFFLE_ADDRESS_CURTIS,
  33139: process.env.NEXT_PUBLIC_RAFFLE_ADDRESS_APECHAIN,
};

export const RAFFLE_ADDRESS = (addressByChain[raffleChain.id] ||
  (raffleChain.id === 33111 || raffleChain.id === 33139
    ? legacyAddress
    : "")) as Address;

export const raffleConfigured = /^0x[0-9a-fA-F]{40}$/.test(RAFFLE_ADDRESS);

export const RAFFLE_MAX = 25;
export const RAFFLE_ID = "apefest-2026";

/**
 * ABI del contrato MingleRaffleOwnerDraw. Incluye las funciones que usan tanto
 * la página como la API: lecturas de estado, compra, salida, cancelación,
 * reembolso, registro del ganador y retirada del pozo.
 */
export const RAFFLE_ABI_COMMON = [
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
    name: "getContractBalance",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
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
  {
    type: "function",
    name: "setWinner",
    stateMutability: "nonpayable",
    inputs: [{ name: "number", type: "uint8" }],
    outputs: [],
  },
  {
    type: "function",
    name: "cancelRaffle",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "withdrawFunds",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "sendMoneyBackToUser",
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
