"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"

interface QRCodeProps {
  address: string
}

export function QRCode({ address }: QRCodeProps) {
  const [qr, setQr] = useState<string>("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Generate QR code using QR server API (no dependencies)
    const encodedAddress = encodeURIComponent(address)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedAddress}`
    setQr(qrUrl)
  }, [address])

  const handleCopy = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="flex flex-col items-center gap-4 p-6 bg-card">
      {qr && (
        <img
          src={qr || "/placeholder.svg"}
          alt="Wallet QR Code"
          className="w-32 h-32 border-2 border-primary rounded-lg"
        />
      )}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">Wallet Address</p>
        <p className="font-mono text-sm break-all">{address}</p>
      </div>
      <Button variant="outline" size="sm" onClick={handleCopy} className="w-full bg-transparent">
        <Copy className="w-4 h-4 mr-2" />
        {copied ? "Copied!" : "Copy Address"}
      </Button>
    </Card>
  )
}
