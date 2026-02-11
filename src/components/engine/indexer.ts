// lib/indexer.ts
import { SequenceIndexer } from '@0xsequence/indexer';
import { MinglesAddress } from './CONSTANTS';

// Tu contrato de Mingles (Pon aquí la dirección real cuando la tengas)
const MINGLES_CONTRACT_ADDRESS = MinglesAddress; 

// Cliente del Indexer (ApeChain Mainnet ID: 33139, Curtis Testnet: 33111)
// Asumiremos Curtis por ahora, cambia 'curtis' por 'apechain' para mainnet
const indexer = new SequenceIndexer('https://apechain-indexer.sequence.app', process.env.SEQUENCER);

export const fetchUserMingles2 = async (userAddress: string) => {
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

export const fetchUserMingles = async (address: string) => {
  try {
    let allBalances: any[] = [];
    let keepFetching = true;
    let pageKey: number | undefined = undefined;

    // 2. BUCLE DE PAGINACIÓN
    while (keepFetching) {
      const response: any = await indexer.getTokenBalances({
        accountAddress: address,
        contractAddress: MINGLES_CONTRACT_ADDRESS,
        includeMetadata: true,
        page: {
          page: pageKey,
        }
      });

      // Acumulamos los resultados
      if (response.balances) {
        allBalances = [...allBalances, ...response.balances];
      }

      // Verificamos si hay más páginas
      if (response.page && response.page.more && response.page.pageKey) {
        pageKey = response.page.pageKey; // Guardamos la llave para la siguiente vuelta
      } else {
        keepFetching = false; // Se acabaron los mingles, salimos del bucle
      }
    }

    // 3. FORMATEO DE DATOS
    // Convertimos la data de Sequence al formato que usa tu juego
    const formattedMingles = allBalances.map((balance) => {
      const metadata = balance.tokenMetadata || {};
      
      // Buscamos el trait "Type" dentro de los atributos
      const typeAttribute = metadata.attributes?.find(
        (a: any) => a.trait_type === "Type"
      );

      const typeTrait = metadata.attributes.find((a: any) => a.trait_type == 'Tequila Worm');

      return {
        id: balance.tokenID,
        image: metadata.image || "/images/placeholder.png",
        type: typeTrait.value ? typeTrait.value : "Unknown",
        name: metadata.name || `Mingle #${balance.tokenID}`,
        attributes: metadata.attributes 
      };
    });
    

    return formattedMingles;

  } catch (error) {
    console.error("Error fetching mingles from Sequence:", error);
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