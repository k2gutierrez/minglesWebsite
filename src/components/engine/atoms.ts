// lib/atoms.ts
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export interface Trait {
  trait_type: string;
  value: string | number;
}

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

// Tipo de dato para un Mingle (adaptado a tu diseño)
export interface MingleNFT {
  id?: string; // Token ID
  name: string;
  image: string; // URL de la imagen
  type?: string;
  attributes?: Trait[]; // Metadata extra si la hay
}

// Átomos
export const minglesAtom = atom<MingleNFT[]>([]); // Lista de NFTs del usuario
export const isLoadingMinglesAtom = atom<boolean>(false); // Estado de carga
export const userPointsAtom = atom<number>(0); // $Tequila Points (Mock por ahora o fetch real)

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
