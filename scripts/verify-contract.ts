import {COLLECTION,collectionAbi} from '../src/lib/web3/collection';
import {checkedClient,readHoldings} from '../src/lib/server/chain';
import {isAddress,getAddress} from 'viem';
const client=await checkedClient();
const [name,supply,erc721,enumerable]=await Promise.all([
 client.readContract({address:COLLECTION.address,abi:collectionAbi,functionName:'name'}),
 client.readContract({address:COLLECTION.address,abi:collectionAbi,functionName:'totalSupply'}),
 client.readContract({address:COLLECTION.address,abi:collectionAbi,functionName:'supportsInterface',args:['0x80ac58cd']}),
 client.readContract({address:COLLECTION.address,abi:collectionAbi,functionName:'supportsInterface',args:['0x780e9d63']}),
]);
console.log(JSON.stringify({chainId:COLLECTION.chain.id,address:COLLECTION.address,name,totalSupply:supply.toString(),erc721,enumerable,tokenRange:[COLLECTION.firstTokenId,COLLECTION.lastTokenId]},null,2));
const wallet=process.argv.find(a=>a.startsWith('--wallet='))?.slice(9);
if(wallet){if(!isAddress(wallet))throw Error('Invalid wallet address');const started=Date.now();const result=await readHoldings(getAddress(wallet));console.log(JSON.stringify({verified:result.complete,balance:result.balance,tokenIdsFound:result.tokenIds.length,firstTokenIds:result.tokenIds.slice(0,5),block:result.blockNumber,seconds:(Date.now()-started)/1000},null,2));}
