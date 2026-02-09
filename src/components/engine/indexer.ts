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
    const tokenBalances = await indexer.getTokenBalances({
      accountAddress: userAddress,
      contractAddress: MINGLES_CONTRACT_ADDRESS,
      includeMetadata: true,
    });

    return tokenBalances.balances.map((token) => {
      const metadata: any = token.tokenMetadata || {};
      const attributes = metadata.attributes || [];

      // Buscamos el trait específico que define la clase del Worm
      // Ajusta 'Type', 'Body' o 'Character' según cómo se llame exactamente en tu contrato
      const typeTrait = attributes.find((a: any) => a.trait_type == 'Tequila Worm');

      return {
        id: token.tokenID,
        name: metadata.name || `Mingle #${token.tokenID}`,
        image: metadata.image || '/images/placeholder_bottle.png',
        // Guardamos el tipo limpio para uso fácil en el UI
        type: typeTrait.value ? typeTrait.value : 'Classic White', // ? typeTrait.value : 'Classic White', 
        // Guardamos todos los atributos por si acaso se necesitan en el modal de detalle
        attributes: attributes 
      };
    });
  } catch (error) {
    console.error("Error fetching Mingles:", error);
    return [];
  }
};

// export const fetchUserMingles = async (userAddress: string) => {
//   try {
//     // Filtramos solo por el contrato de Mingles
//     const tokenBalances = await indexer.getTokenBalances({
//       accountAddress: userAddress,
//       contractAddress: MINGLES_CONTRACT_ADDRESS,
//       includeMetadata: true,
//     });
//     console.log("Tokens: ", tokenBalances);
//     // Mapeamos la respuesta al formato que usa tu UI
//     return tokenBalances.balances.map((token) => ({
//       id: token.tokenID,
//       name: token.tokenMetadata?.name || `Mingle #${token.tokenID}`,
//       image: token.tokenMetadata?.image || '/images/placeholder_bottle.png', // Fallback si falla
//       type: token.tokenMetadata?.attributes //?.attributes?.find((a: any) => a.trait_type === 'Type')?.value || 'Unknown',
//     }));
//   } catch (error) {
//     console.error("Error fetching Mingles:", error);
//     return [];
//   }
// };