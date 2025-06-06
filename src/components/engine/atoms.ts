// lib/atoms.ts
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// Simple atom example
export let Tokens = atom<string[]>([])
export let CavaTokens = atom<string[]>([])
export let loadingAtom = atom(false)
export let RefreshCava = atom(false)

// Derived atom example
//export const doubledCountAtom = atom((get) => get(countAtom)[randomColor(countAtom)])

// Async atom example
export const NftTokens = atom(async () => {
  const response = await fetch('/api/user')
  return await response.json()
})
