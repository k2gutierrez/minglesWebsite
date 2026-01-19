
import { SequenceIndexer } from '@0xsequence/indexer'

export interface NFT {
  id: string;
  //amount: string;
  //name: string;
  //image: string;
  //attributes: any[];
}

const PROJECT_ACCESS_KEY = process.env.SEQUENCER;

// Función auxiliar para IPFS (la incluimos aquí para limpiar el dato antes de enviarlo al front)
function resolveIpfsUrl(url?: string): string {
  if (!url) return '/placeholder-image.png'; // Ruta a una imagen local por si no hay foto
  if (url.startsWith('ipfs://')) {
    return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  return url;
}

export async function getWalletNFTs(walletAddress: string, contractAddress: string, chainId: number) {
    let url: string = '';

    if (chainId == 33111) {
        url = 'https://apechain-testnet-indexer.sequence.app'
    } else {
        url = 'https://apechain-indexer.sequence.app'
    }

  const indexer = new SequenceIndexer(url, PROJECT_ACCESS_KEY);

  try {
    const response = await indexer.getTokenBalances({
      accountAddress: walletAddress,
      contractAddress: contractAddress,
      includeMetadata: true
    });

    // Mapeo con tipos estrictos para evitar el error de TS
    console.log(response.balances)
    const nfts: NFT[] = response.balances.map((item) => ({
      id: item.tokenID || "0", // Fallback por si viniera undefined
      //amount: item.balance,
      //name: item.tokenMetadata?.name || `Token #${item.tokenID}`,
      // Aquí aplicamos la corrección de IPFS
      //image: resolveIpfsUrl(item.tokenMetadata?.image), 
      //attributes: item.tokenMetadata?.attributes || []
    }));
    
    return { success: true, nfts };

  } catch (error) {
    console.error("Error fetching NFTs:", error);
    // Retornamos un array vacío en caso de error para mantener consistencia de tipos si quieres,
    // o simplemente undefined en nfts, pero lo manejaremos en el front.
    return { success: false, error: "Error al cargar" };
  }
}