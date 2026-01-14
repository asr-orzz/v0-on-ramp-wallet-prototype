"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QRCode } from "@/components/qr-code"
import { getWalletAddress, getShortAddress } from "@/lib/wallet"
import { getMockBalance, getActivity, setMockBalance, type ActivityEntry } from "@/lib/storage"
import { MessageCircle, Send, Store, ChevronDown, ChevronUp } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const [address, setAddress] = useState("")
  const [balance, setBalance] = useState(2.5)
  const [activity, setActivity] = useState<ActivityEntry[]>([])
  const [showQR, setShowQR] = useState(false)
  const [balanceEditing, setBalanceEditing] = useState(false)

  useEffect(() => {
    const addr = getWalletAddress()
    setAddress(addr)
    setBalance(getMockBalance())
    setActivity(getActivity())
  }, [])

  const handleUpdateBalance = (delta: number) => {
    const newBalance = Math.max(0, balance + delta)
    setBalance(newBalance)
    setMockBalance(newBalance)
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)

    if (minutes < 1) return "just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24 md:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">OnRamp Wallet</h1>
          <p className="text-sm text-muted-foreground">Secure, biometric-protected</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Wallet Card */}
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0 shadow-xl">
          <CardContent className="pt-6 space-y-4">
            <div>
              <p className="text-sm opacity-90">Wallet Balance</p>
              <p className="text-4xl font-bold">{balance.toFixed(3)} ETH</p>
            </div>
            <div className="border-t border-primary-foreground/20 pt-4">
              <p className="text-sm opacity-90 mb-1">Address</p>
              <p className="font-mono text-sm break-all">{address}</p>
            </div>
          </CardContent>
        </Card>

        {/* Balance Adjustment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mock Balance</CardTitle>
            <CardDescription>Adjust for testing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Button variant="outline" onClick={() => handleUpdateBalance(-0.5)}>
                <ChevronDown className="w-4 h-4" />
              </Button>
              <span className="text-lg font-semibold">{balance.toFixed(3)} ETH</span>
              <Button variant="outline" onClick={() => handleUpdateBalance(0.5)}>
                <ChevronUp className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <Button onClick={() => router.push("/pay")} variant="outline" className="h-20 flex-col gap-2">
            <Send className="w-5 h-5 text-primary" />
            <span className="text-xs">Send</span>
          </Button>
          <Button onClick={() => router.push("/chat")} variant="outline" className="h-20 flex-col gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <span className="text-xs">AI Chat</span>
          </Button>
          <Button onClick={() => router.push("/register")} variant="outline" className="h-20 flex-col gap-2">
            <Store className="w-5 h-5 text-primary" />
            <span className="text-xs">Register</span>
          </Button>
        </div>

        {/* QR Code */}
        <div>
          <Button variant="outline" onClick={() => setShowQR(!showQR)} className="w-full">
            {showQR ? "Hide QR Code" : "Show QR Code"}
          </Button>
          {showQR && (
            <div className="mt-4">
              <QRCode address={address} />
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {activity.map((entry, idx) => (
                  <div key={idx} className="flex justify-between items-start pb-3 border-b last:pb-0 last:border-0">
                    <div>
                      <p className="text-sm font-medium">Sent {entry.amount} ETH</p>
                      <p className="text-xs text-muted-foreground font-mono">{getShortAddress(entry.to)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{formatTime(entry.time)}</p>
                      <p className="text-xs font-mono text-primary">{entry.txHash.slice(0, 10)}...</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
