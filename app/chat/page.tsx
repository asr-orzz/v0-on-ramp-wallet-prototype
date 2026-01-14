"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
  autoFill?: {
    receiver: string
    amount: number
  }
}

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI payment assistant. I can help you send crypto payments or answer questions about your wallet.",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = input
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setLoading(true)

    try {
      const response = await fetch("http://localhost:5001/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.text,
            autoFill: data.auto_fill,
          },
        ])
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col pb-24 md:pb-8">
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            ←
          </Button>
          <h1 className="text-2xl font-bold">AI Assistant</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full px-4 py-8 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <Card
              className={`max-w-xs ${msg.role === "user" ? "bg-primary text-primary-foreground border-0" : "bg-muted"}`}
            >
              <CardContent className="pt-3">
                <p className="text-sm">{msg.content}</p>
                {msg.autoFill && (
                  <Button
                    onClick={() =>
                      router.push(
                        `/pay?receiver=${encodeURIComponent(msg.autoFill!.receiver)}&amount=${msg.autoFill!.amount}`,
                      )
                    }
                    className="mt-3 w-full"
                    size="sm"
                    variant={msg.role === "user" ? "secondary" : "default"}
                  >
                    Pay {msg.autoFill.amount} ETH
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <Card className="bg-muted border-0">
              <CardContent className="pt-3 flex gap-2">
                <Loader className="w-4 h-4 animate-spin" />
                <p className="text-sm">Thinking...</p>
              </CardContent>
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="max-w-2xl mx-auto px-4 py-4 flex gap-2">
          <Input
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
