// Works in both a Webapp (browser) or Node.js:
import { SequenceIndexer } from '@0xsequence/indexer'

export async function GetBAYCTokens() {
    let url = "https://mainnet-indexer.sequence.app"
    let contract = "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d"

    const indexerGateway = new SequenceIndexer(url, process.env.SEQUENCER)

    const res = await indexerGateway. getTokenBalancesByContract({
        filter: {
            contractAddresses: [
                contract
            ]
        }
    });

    console.log(res);
    
}