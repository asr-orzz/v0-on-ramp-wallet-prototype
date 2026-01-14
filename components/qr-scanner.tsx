"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera, Upload } from "lucide-react"

interface QRScannerProps {
  onScan: (address: string) => void
}

export function QRScanner({ onScan }: QRScannerProps) {
  const [mode, setMode] = useState<"camera" | "input">("input")
  const [address, setAddress] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAddressSubmit = () => {
    if (address.trim()) {
      onScan(address.trim())
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Simple QR detection - in production, use jsQR or zxing library
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const img = new Image()
        img.onload = async () => {
          const canvas = document.createElement("canvas")
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext("2d")
          if (ctx) {
            ctx.drawImage(img, 0, 0)
            // For prototype, just prompt user to enter address from QR
            const extractedAddress = prompt("Enter the address from the QR code:")
            if (extractedAddress) {
              onScan(extractedAddress)
            }
          }
        }
        img.src = event.target?.result as string
      } catch (error) {
        alert("Failed to read QR code. Please enter address manually.")
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant={mode === "input" ? "default" : "outline"} onClick={() => setMode("input")} className="flex-1">
          <Camera className="w-4 h-4 mr-2" />
          Input Address
        </Button>
        <Button
          variant={mode === "camera" ? "default" : "outline"}
          onClick={() => setMode("camera")}
          className="flex-1"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload QR
        </Button>
      </div>

      {mode === "input" && (
        <div className="space-y-3">
          <Input
            placeholder="Enter recipient address (0x...)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="font-mono"
          />
          <Button onClick={handleAddressSubmit} className="w-full">
            Continue
          </Button>
        </div>
      )}

      {mode === "camera" && (
        <div className="space-y-3">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          <Button variant="outline" className="w-full bg-transparent" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Select QR Code Image
          </Button>
          <p className="text-xs text-muted-foreground text-center">Or scan QR code with your device camera</p>
        </div>
      )}
    </div>
  )
}
