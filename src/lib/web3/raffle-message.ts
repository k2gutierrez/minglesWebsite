import { keccak256, toHex } from "viem";

/**
 * Mensajes canónicos que firma quien participa en la rifa.
 *
 * Los construyen igual el navegador y el servidor. Incluyen la red y la
 * dirección del contrato para que una firma de Curtis no sirva en mainnet (ni
 * al revés) y para que no se pueda reutilizar en otro despliegue.
 *
 * El mensaje de entrada NO incluye nombre, email, teléfono ni nota: incluye un
 * hash de esos datos. Así MetaMask no muestra información personal, pero la
 * firma sigue ligada al contacto exacto que se guarda en Supabase.
 */
export type RaffleContact = {
  number: number;
  address: string;
  name: string;
  email: string;
  phone: string;
  note?: string;
  chainId: number;
  contract: string;
};

export type RaffleWithdrawal = {
  number: number;
  address: string;
  chainId: number;
  contract: string;
};

/**
 * Hash canónico del contacto. Se calcula igual en el navegador y en el
 * servidor. Si alguien cambia el nombre, email, teléfono o nota en el body,
 * el hash cambia y la firma deja de coincidir.
 */
export function raffleContactHash(contact: RaffleContact): `0x${string}` {
  const canonical = JSON.stringify({
    number: contact.number,
    address: contact.address.toLowerCase(),
    chainId: contact.chainId,
    contract: contact.contract.toLowerCase(),
    name: contact.name.trim(),
    email: contact.email.trim().toLowerCase(),
    phone: contact.phone.trim(),
    note: contact.note?.trim() ?? "",
  });
  return keccak256(toHex(canonical));
}

export function raffleEntryMessage(contact: RaffleContact): string {
  return [
    "Mingles ApeFest Raffle",
    "",
    `Chain ID: ${contact.chainId}`,
    `Contract: ${contact.contract.toLowerCase()}`,
    `Number: ${contact.number}`,
    `Wallet: ${contact.address.toLowerCase()}`,
    `Contact hash: ${raffleContactHash(contact)}`,
    "",
    "I confirm these details for this raffle entry. My name, email, phone/Twitter and note are stored offchain, not onchain.",
  ].join("\n");
}

export type RaffleOwnerEntries = {
  address: string;
  chainId: number;
  contract: string;
  timestamp: number;
};

/**
 * Mensaje que firma el owner para leer la lista de compradores de Supabase.
 * Incluye la red, el contrato y un timestamp para limitar la reutilización.
 */
export function raffleOwnerEntriesMessage({
  address,
  chainId,
  contract,
  timestamp,
}: RaffleOwnerEntries): string {
  return [
    "Mingles ApeFest Raffle - owner buyer list",
    "",
    `Chain ID: ${chainId}`,
    `Contract: ${contract.toLowerCase()}`,
    `Wallet: ${address.toLowerCase()}`,
    `Timestamp: ${timestamp}`,
    "",
    "I am the owner and I want to read the raffle entries.",
  ].join("\n");
}

export function raffleWithdrawalMessage(withdrawal: RaffleWithdrawal): string {
  return [
    "Mingles ApeFest Raffle - withdraw entry",
    "",
    `Chain ID: ${withdrawal.chainId}`,
    `Contract: ${withdrawal.contract.toLowerCase()}`,
    `Number: ${withdrawal.number}`,
    `Wallet: ${withdrawal.address.toLowerCase()}`,
    "",
    "I am leaving this raffle and want my entry removed from the contact list.",
  ].join("\n");
}
