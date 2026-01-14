// Storage utilities for localStorage and IndexedDB

const CREDENTIAL_ID_KEY = "onramp_credential_id"
const ACTIVITY_KEY = "onramp_activity"
const MOCK_BALANCE_KEY = "onramp_balance"

export function saveCredentialId(credentialId: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(CREDENTIAL_ID_KEY, credentialId)
  }
}

export function getCredentialId(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(CREDENTIAL_ID_KEY)
  }
  return null
}

export function clearCredentialId(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CREDENTIAL_ID_KEY)
  }
}

export interface ActivityEntry {
  to: string
  amount: number
  txHash: string
  time: number
}

export function saveActivity(entry: ActivityEntry): void {
  if (typeof window !== "undefined") {
    const activities = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || "[]")
    activities.unshift(entry)
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities.slice(0, 20)))
  }
}

export function getActivity(): ActivityEntry[] {
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem(ACTIVITY_KEY) || "[]")
  }
  return []
}

export function setMockBalance(balance: number): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(MOCK_BALANCE_KEY, balance.toString())
  }
}

export function getMockBalance(): number {
  if (typeof window !== "undefined") {
    return Number.parseFloat(localStorage.getItem(MOCK_BALANCE_KEY) || "2.5")
  }
  return 2.5
}
