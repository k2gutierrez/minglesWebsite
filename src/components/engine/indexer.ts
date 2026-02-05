// lib/indexer.ts
import { SequenceIndexer } from '@0xsequence/indexer';
import { MinglesAddress } from './CONSTANTS';

// Tu contrato de Mingles (Pon aquí la dirección real cuando la tengas)
const MINGLES_CONTRACT_ADDRESS = MinglesAddress; 

// Cliente del Indexer (ApeChain Mainnet ID: 33139, Curtis Testnet: 33111)
// Asumiremos Curtis por ahora, cambia 'curtis' por 'apechain' para mainnet
const indexer = new SequenceIndexer('https://apechain-indexer.sequence.app', process.env.SEQUENCER);

export const fetchUserMingles = async (userAddress: string) => {
  try {
    // Filtramos solo por el contrato de Mingles
    const tokenBalances = await indexer.getTokenBalances({
      accountAddress: userAddress,
      contractAddress: MINGLES_CONTRACT_ADDRESS,
      includeMetadata: true,
    });

    // Mapeamos la respuesta al formato que usa tu UI
    return tokenBalances.balances.map((token) => ({
      id: token.tokenID,
      name: token.tokenMetadata?.name || `Mingle #${token.tokenID}`,
      image: token.tokenMetadata?.image || '/images/placeholder_bottle.png', // Fallback si falla
      type: token.tokenMetadata?.attributes?.find((a: any) => a.trait_type === 'Type')?.value || 'Unknown',
    }));
  } catch (error) {
    console.error("Error fetching Mingles:", error);
    return [];
  }
};