"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { ScriptDisplay } from "@/components/script-display"
import { ImageGallery } from "@/components/image-gallery"
import { AudioPlayer } from "@/components/audio-player"
import { generateContent } from "@/app/actions"

export function ContentGenerator() {
  const [topic, setTopic] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<{
    script: string
    imagePrompts: String[]
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return

    setLoading(true)
    setError("")

    try {
      const content = await generateContent(topic)
      if (!content) return setError("Failed to generate content");

      console.log(content.rawData)

      setResult(content)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate content")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Enter a Topic for Your YouTube Short</Label>
              <Input
                id="topic"
                placeholder="e.g., Space exploration, Cooking tips, Fashion trends"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Content...
                </>
              ) : (
                "Generate Content"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && <div className="bg-destructive/10 text-destructive p-4 rounded-md">{error}</div>}

      {result && (
        <div className="space-y-8">
          <ScriptDisplay script={result.script} />
          <ImageGallery imagePrompts={result.imagePrompts} />
          <AudioPlayer text={result.script} />
        </div>
      )}
    </div>
  )
}

