"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QRCode } from "@/components/qr-code"
import { registerPasskey, authenticatePasskey, deriveWalletSeed } from "@/lib/webauthn"
import { setWalletSeed, getWalletAddress } from "@/lib/wallet"
import { saveCredentialId } from "@/lib/storage"
import { Fingerprint, Lock, RotateCcw, CheckCircle2 } from "lucide-react"

type Step = "wallet" | "type" | "merchant"

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("wallet")
  const [credentialId, setCredentialId] = useState("")
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [walletLocked, setWalletLocked] = useState(false)

  // Account type selection
  const [accountType, setAccountType] = useState<"personal" | "merchant">("personal")

  // Merchant registration
  const [merchantData, setMerchantData] = useState({
    username: "",
    businessType: "",
    description: "",
  })
  const [registering, setRegistering] = useState(false)

  const handleCreateWallet = async () => {
    setLoading(true)
    try {
      const credId = await registerPasskey("onramp-user")
      setCredentialId(credId)
      saveCredentialId(credId)

      // Auto-unlock after creation
      await handleUnlock(credId)
    } catch (error) {
      alert(`Error creating wallet: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleUnlock = async (credId?: string) => {
    setLoading(true)
    try {
      const idToUse = credId || credentialId
      const { prfOutput } = await authenticatePasskey(idToUse)
      const seed = await deriveWalletSeed(prfOutput)
      setWalletSeed(seed)
      const addr = getWalletAddress()
      setAddress(addr)
      setWalletLocked(false)
    } catch (error) {
      alert(`Error unlocking wallet: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleLock = () => {
    setAddress("")
    setWalletLocked(true)
  }

  const handleReset = () => {
    if (confirm("Are you sure? This will erase your wallet.")) {
      setCredentialId("")
      setAddress("")
      setWalletLocked(true)
    }
  }

  const handleRegisterMerchant = async () => {
    setRegistering(true)
    try {
      const response = await fetch("http://localhost:5001/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: merchantData.username,
          wallet_address: address,
          description: merchantData.description,
          business_type: merchantData.businessType,
        }),
      })

      if (response.ok) {
        alert("Merchant registered successfully!")
        router.push("/home")
      } else {
        alert("Failed to register merchant")
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setRegistering(false)
    }
  }

  const handleContinue = () => {
    if (step === "wallet") {
      if (address) setStep("type")
    } else if (step === "type") {
      if (accountType === "merchant") {
        setStep("merchant")
      } else {
        router.push("/home")
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 flex items-center justify-center">
      <div className="w-full max-w-lg space-y-6">
        {/* Step indicator */}
        <div className="flex justify-between mb-8">
          <div className={`flex items-center gap-2 ${step === "wallet" ? "text-primary" : "text-muted-foreground"}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "wallet" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
            >
              1
            </div>
            <span className="text-sm font-medium">Wallet</span>
          </div>
          <div className={`flex items-center gap-2 ${step === "type" ? "text-primary" : "text-muted-foreground"}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${["wallet"].includes(step) ? "bg-muted" : step === "type" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
            >
              2
            </div>
            <span className="text-sm font-medium">Account Type</span>
          </div>
          {accountType === "merchant" && (
            <div
              className={`flex items-center gap-2 ${step === "merchant" ? "text-primary" : "text-muted-foreground"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "merchant" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                3
              </div>
              <span className="text-sm font-medium">Register</span>
            </div>
          )}
        </div>

        {/* Step 1: Create Wallet */}
        {step === "wallet" && (
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Fingerprint className="w-5 h-5 text-primary" />
                Create Your Wallet
              </CardTitle>
              <CardDescription>Secure biometric wallet with passkeys</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
                <strong>🔒 Security:</strong> Your private key never leaves this device. Biometric verification required
                to unlock and pay.
              </div>

              {!credentialId ? (
                <Button onClick={handleCreateWallet} disabled={loading} size="lg" className="w-full gap-2">
                  <Fingerprint className="w-4 h-4" />
                  {loading ? "Creating..." : "Create Wallet with Biometrics"}
                </Button>
              ) : (
                <>
                  {!address ? (
                    <Button onClick={() => handleUnlock()} disabled={loading} size="lg" className="w-full gap-2">
                      {loading ? "Unlocking..." : "Unlock with Biometrics"}
                    </Button>
                  ) : (
                    <>
                      <QRCode address={address} />
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={handleLock} className="flex-1 gap-2 bg-transparent">
                          <Lock className="w-4 h-4" />
                          Lock
                        </Button>
                        <Button variant="outline" onClick={handleReset} className="flex-1 gap-2 bg-transparent">
                          <RotateCcw className="w-4 h-4" />
                          Reset
                        </Button>
                      </div>
                    </>
                  )}
                </>
              )}

              {walletLocked && credentialId && !address && (
                <Button onClick={() => handleUnlock()} disabled={loading} size="lg" className="w-full gap-2">
                  {loading ? "Unlocking..." : "Unlock with Biometrics"}
                </Button>
              )}

              {address && (
                <Button onClick={handleContinue} size="lg" className="w-full gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Continue
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Choose Account Type */}
        {step === "type" && (
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle>Choose Account Type</CardTitle>
              <CardDescription>Select how you want to use OnRamp</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {(["personal", "merchant"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setAccountType(type)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      accountType === type
                        ? "border-primary bg-primary/5"
                        : "border-muted bg-muted/30 hover:border-primary/50"
                    }`}
                  >
                    <div className="text-sm font-semibold capitalize">{type}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {type === "personal" ? "Send payments" : "Receive payments"}
                    </div>
                  </button>
                ))}
              </div>
              <Button onClick={handleContinue} size="lg" className="w-full">
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Merchant Registration */}
        {step === "merchant" && (
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle>Merchant Registration</CardTitle>
              <CardDescription>Set up your merchant account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Username</label>
                <Input
                  placeholder="Your business name"
                  value={merchantData.username}
                  onChange={(e) => setMerchantData({ ...merchantData, username: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Business Type</label>
                <Input
                  placeholder="e.g., Retail, Services"
                  value={merchantData.businessType}
                  onChange={(e) => setMerchantData({ ...merchantData, businessType: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="What do you sell?"
                  value={merchantData.description}
                  onChange={(e) => setMerchantData({ ...merchantData, description: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="bg-muted p-3 rounded text-sm font-mono break-all text-xs">Wallet: {address}</div>
              <Button
                onClick={handleRegisterMerchant}
                disabled={registering || !merchantData.username}
                size="lg"
                className="w-full"
              >
                {registering ? "Registering..." : "Register Merchant"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
