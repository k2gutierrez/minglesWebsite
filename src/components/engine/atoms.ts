// lib/atoms.ts
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

interface Token {
    id: string;
    name: string;
    collection: string;
  }

export interface NFT {
  id: string;
  //amount: string;
  //name: string;
  //image: string;
  //attributes: any[];
}

// Simple atom example - Cava
export let Tokens = atom<string[]>([])
export let CavaTokens = atom<string[]>([])
export let loadingAtom = atom(false)
export let RefreshCava = atom(false)

// game
export let PlayingAddress = atom<string>("0x6579cfD742D8982A7cDc4C00102D3087F6c6dd8E");
export let GameLocation = atom<string>("");
export let GameTokenId = atom<number>(1);
export let TokenStatus = atom<number>(0);

export let Address1 = atom<string>("");
export let Address2 = atom<string>("");
export let Tokens1 = atom<NFT[]>([]);
export let Tokens2 = atom<NFT[]>([]);

// Derived atom example
//export const doubledCountAtom = atom((get) => get(countAtom)[randomColor(countAtom)])

// Async atom example
export const NftTokens = atom(async () => {
  const response = await fetch('/api/user')
  return await response.json()
})
