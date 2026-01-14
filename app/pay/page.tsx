"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QRScanner } from "@/components/qr-scanner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { authenticatePasskey, deriveWalletSeed } from "@/lib/webauthn"
import { setWalletSeed, setVerified } from "@/lib/wallet"
import { getCredentialId, saveActivity } from "@/lib/storage"
import { AlertCircle, CheckCircle2, Fingerprint } from "lucide-react"

function PayContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [receiver, setReceiver] = useState(searchParams.get("receiver") || "")
  const [amount, setAmount] = useState(searchParams.get("amount") || "")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [txHash, setTxHash] = useState("")

  const handlePay = async () => {
    if (!receiver || !amount) {
      alert("Please enter receiver address and amount")
      return
    }

    setLoading(true)
    try {
      // Authenticate with biometrics
      const credentialId = getCredentialId()
      if (!credentialId) {
        alert("Wallet not found. Please register first.")
        return
      }

      const { prfOutput } = await authenticatePasskey(credentialId)
      const seed = await deriveWalletSeed(prfOutput)
      setWalletSeed(seed)
      setVerified() // Mark as verified for the payment route

      // Call payment endpoint
      const response = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiver,
          amount: Number.parseFloat(amount),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setTxHash(data.tx_hash)
        setSuccess(true)

        // Save activity
        saveActivity({
          to: receiver,
          amount: Number.parseFloat(amount),
          txHash: data.tx_hash,
          time: Date.now(),
        })

        // Reset form
        setTimeout(() => {
          setReceiver("")
          setAmount("")
        }, 2000)
      } else {
        alert("Payment failed")
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardContent className="pt-12 pb-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
              <p className="text-muted-foreground">Your transaction has been submitted</p>
            </div>
            <div className="bg-muted p-4 rounded-lg text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="text-sm font-semibold">{amount} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">To</span>
                <span className="text-xs font-mono">{receiver.slice(0, 10)}...</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="text-sm text-muted-foreground">Tx Hash</span>
                <span className="text-xs font-mono text-primary">{txHash.slice(0, 12)}...</span>
              </div>
            </div>
            <div className="pt-4 space-y-2">
              <Button onClick={() => router.push("/home")} className="w-full">
                Back to Home
              </Button>
              <Button onClick={() => setSuccess(false)} variant="outline" className="w-full">
                Send Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24 md:pb-8">
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            ←
          </Button>
          <h1 className="text-2xl font-bold">Send Payment</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>Review and confirm your payment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="address" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="address">Enter Address</TabsTrigger>
                <TabsTrigger value="scan">Scan QR</TabsTrigger>
              </TabsList>
              <TabsContent value="address" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Recipient Address</label>
                  <Input
                    placeholder="0x..."
                    value={receiver}
                    onChange={(e) => setReceiver(e.target.value)}
                    className="mt-1 font-mono"
                  />
                </div>
              </TabsContent>
              <TabsContent value="scan" className="space-y-4">
                <QRScanner
                  onScan={(scannedAddress) => {
                    setReceiver(scannedAddress)
                  }}
                />
              </TabsContent>
            </Tabs>

            <div>
              <label className="text-sm font-medium">Amount (ETH)</label>
              <Input
                type="number"
                step="0.001"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <strong>Biometric verification required</strong> to complete this payment. Your transaction will not be
                processed without successful authentication.
              </div>
            </div>

            <Button onClick={handlePay} disabled={loading || !receiver || !amount} size="lg" className="w-full gap-2">
              <Fingerprint className="w-4 h-4" />
              {loading ? "Verifying..." : "Confirm with Biometrics"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function PayPage() {
  return (
    <Suspense fallback={null}>
      <PayContent />
    </Suspense>
  )
}
