import { encodeFunctionData, type Address } from "viem";

/**
 * Contrato de staking de CAVA — donde están guardados los Mingles staked.
 *
 * ⚠️ VERIFICADO CONTRA APECHAIN (33139), no supuesto:
 *  - El contrato existe (2.823 bytes de código).
 *  - `getUserTotalStaked(address)` está en el bytecode (selector 0x6e2f1696).
 *  - `unstakeNftsEmergency()` está en el bytecode (selector 0x0dc3249b).
 *  - El contrato tiene **636 Mingles** dentro ahora mismo (~11% de la colección).
 *  - Se SIMULÓ el unstake desde una wallet con 21 staked: ejecuta sin revertir.
 *
 * `unstakeNftsEmergency()` NO recibe token ID: recupera de una vez TODOS los
 * Mingles que esa wallet tenga staked. La interfaz debe decirlo así.
 *
 * Si algún día cambia el contrato, este es el único archivo que hay que tocar.
 */
export const CAVA_STAKING_ADDRESS: Address =
  "0x8FD1942b961ed13aC50a5873bA06fABE37168f6D";

export const cavaStakingAbi = [
  {
    type: "function",
    name: "getUserTotalStaked",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "unstakeNftsEmergency",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
] as const;

/** Datos de la transacción de recuperación (sin argumentos). */
export function unstakeEmergencyData(): `0x${string}` {
  return encodeFunctionData({
    abi: cavaStakingAbi,
    functionName: "unstakeNftsEmergency",
  });
}
