"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { useState } from "react"

interface ScriptDisplayProps {
  script: string
}

export function ScriptDisplay({ script }: ScriptDisplayProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(script)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Generated Script</CardTitle>
        <Button variant="outline" size="sm" onClick={copyToClipboard} className="h-8 gap-1">
          <Copy className="h-4 w-4" />
          {copied ? "Copied!" : "Copy"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-line bg-muted p-4 rounded-md text-sm">{script}</div>
      </CardContent>
    </Card>
  )
}

