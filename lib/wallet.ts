// Wallet utilities for address derivation and seed management

import { Wallet } from "ethers"

let walletSeed: Uint8Array | null = null
let verifiedUntil = 0

export function setWalletSeed(seed: Uint8Array): void {
  walletSeed = seed
}

export function getWalletAddress(): string {
  if (!walletSeed) {
    throw new Error("Wallet seed not initialized")
  }

  const wallet = new Wallet(
    "0x" +
      Array.from(walletSeed)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""),
  )
  return wallet.address
}

export function getShortAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function setVerified(): void {
  verifiedUntil = Date.now() + 30 * 1000 // 30 seconds
}

export function isVerified(): boolean {
  return Date.now() < verifiedUntil
}

export function clearWallet(): void {
  walletSeed = null
  verifiedUntil = 0
}
