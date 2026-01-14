"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getCredentialId } from "@/lib/storage"
import { Wallet, Lock, MessageSquare } from "lucide-react"

export default function LandingPage() {
  const router = useRouter()

  useEffect(() => {
    // If wallet exists, redirect to home
    const credentialId = getCredentialId()
    if (credentialId) {
      router.push("/home")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-8 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-xl bg-primary/10 flex items-center justify-center">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">OnRamp Wallet</h1>
          <p className="text-lg text-muted-foreground">
            Secure, biometric-protected crypto wallet. Your keys, your control.
          </p>
        </div>

        <div className="grid gap-4 pt-4">
          <Card className="bg-card/50 border-0">
            <CardContent className="pt-6 flex items-start gap-4">
              <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div className="text-left">
                <p className="font-semibold text-sm">Biometric Security</p>
                <p className="text-sm text-muted-foreground">WebAuthn passkeys protect your wallet</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-0">
            <CardContent className="pt-6 flex items-start gap-4">
              <Wallet className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div className="text-left">
                <p className="font-semibold text-sm">Self-Custody</p>
                <p className="text-sm text-muted-foreground">Private keys never leave your device</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 border-0">
            <CardContent className="pt-6 flex items-start gap-4">
              <MessageSquare className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div className="text-left">
                <p className="font-semibold text-sm">AI Assistant</p>
                <p className="text-sm text-muted-foreground">Get help with payments and transactions</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Button onClick={() => router.push("/register")} size="lg" className="w-full">
          Create Wallet
        </Button>

        <p className="text-xs text-muted-foreground">
          🔒 Your private key never leaves this device. Biometric verification required for every transaction.
        </p>
      </div>
    </div>
  )
}
