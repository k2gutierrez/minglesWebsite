// lib/atoms.ts
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// Simple atom example
export const Tokens = atom<string[]>([])
export const CavaTokens = atom<string[]>([])

// Derived atom example
//export const doubledCountAtom = atom((get) => get(countAtom)[randomColor(countAtom)])

// Async atom example
export const NftTokens = atom(async () => {
  const response = await fetch('/api/user')
  return await response.json()
})
