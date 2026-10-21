/**
 * Mensaje canónico que firma quien se apunta a la rifa.
 *
 * Lo construyen igual el navegador y el servidor: así la firma prueba que la
 * wallet es dueña de esos datos y el servidor nunca confía en un texto que
 * llegue del cliente.
 */
export type RaffleContact = {
  number: number;
  address: string;
  name: string;
  email: string;
  phone: string;
  note?: string;
};

export function raffleEntryMessage(contact: RaffleContact): string {
  const lines = [
    "Mingles ApeFest Raffle",
    "",
    `Number: ${contact.number}`,
    `Wallet: ${contact.address}`,
    `Name: ${contact.name.trim()}`,
    `Email: ${contact.email.trim().toLowerCase()}`,
    `Phone: ${contact.phone.trim()}`,
  ];
  const note = contact.note?.trim();
  if (note) lines.push(`Note: ${note}`);
  lines.push("", "I confirm these details for this raffle entry.");
  return lines.join("\n");
}
