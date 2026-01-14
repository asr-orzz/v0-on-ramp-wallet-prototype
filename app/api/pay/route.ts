import { isVerified } from "@/lib/wallet"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { receiver, amount } = body

    // Check if user was recently verified by biometrics
    if (!isVerified()) {
      return new Response(JSON.stringify({ error: "Biometric verification required" }), { status: 401 })
    }

    if (!receiver || !amount) {
      return new Response(JSON.stringify({ error: "Missing receiver or amount" }), { status: 400 })
    }

    // Generate prototype tx hash
    const txHash =
      "0x" +
      Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")

    return new Response(JSON.stringify({ tx_hash: txHash }), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 })
  }
}
