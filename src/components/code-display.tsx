"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

interface CodeDisplayProps {
  code: string
  language: string
}

export function CodeDisplay({ code, language }: CodeDisplayProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className="relative">
      <div className="rounded-md overflow-hidden">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            borderRadius: "0.375rem",
            fontSize: "0.875rem",
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
      <Button size="sm" variant="ghost" className="absolute top-2 right-2 h-8 w-8 p-0" onClick={copyToClipboard}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        <span className="sr-only">Copy code</span>
      </Button>
    </div>
  )
}
