"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react"

interface AudioPlayerProps {
  text: string
}

export function AudioPlayer({ text }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [error, setError] = useState("")

  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Initialize speech synthesis
    if (typeof window !== "undefined" && window.speechSynthesis) {
      speechSynthRef.current = new SpeechSynthesisUtterance(text)

      // Set default voice (preferably a female voice)
      const voices = window.speechSynthesis.getVoices()
      const femaleVoice = voices.find((voice) => voice.name.includes("female") || voice.name.includes("Female"))
      if (femaleVoice) {
        speechSynthRef.current.voice = femaleVoice
      }

      speechSynthRef.current.rate = 1.0
      speechSynthRef.current.pitch = 1.0
      speechSynthRef.current.volume = volume

      speechSynthRef.current.onend = () => {
        setIsPlaying(false)
        setIsPaused(false)
        setProgress(100)
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }

      setIsReady(true)
    } else {
      setError("Speech synthesis is not supported in your browser.")
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [text])

  useEffect(() => {
    // Handle voices loading (they load asynchronously)
    const handleVoicesChanged = () => {
      if (speechSynthRef.current && window.speechSynthesis) {
        const voices = window.speechSynthesis.getVoices()
        const femaleVoice = voices.find((voice) => voice.name.includes("female") || voice.name.includes("Female"))
        if (femaleVoice) {
          speechSynthRef.current.voice = femaleVoice
        }
      }
    }

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = handleVoicesChanged
    }

    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [])

  const togglePlayPause = () => {
    if (!isReady || !speechSynthRef.current) return

    if (isPlaying && !isPaused) {
      // Pause
      window.speechSynthesis.pause()
      setIsPaused(true)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    } else if (isPaused) {
      // Resume
      window.speechSynthesis.resume()
      setIsPaused(false)
      startProgressInterval()
    } else {
      // Start playing
      if (progress === 100) setProgress(0)
      speechSynthRef.current.volume = isMuted ? 0 : volume
      window.speechSynthesis.speak(speechSynthRef.current)
      setIsPlaying(true)
      startProgressInterval()
    }
  }

  const startProgressInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Estimate the duration based on text length and speech rate
    const estimatedDuration = text.length * 50 // Rough estimate

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          return 100
        }
        return prev + 100 / (estimatedDuration / 100)
      })
    }, 100)
  }

  const resetAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    setIsPlaying(false)
    setIsPaused(false)
    setProgress(0)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (speechSynthRef.current) {
      speechSynthRef.current.volume = !isMuted ? 0 : volume
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
    if (speechSynthRef.current) {
      speechSynthRef.current.volume = newVolume
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Text-to-Speech</CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-destructive">{error}</div>
        ) : (
          <div className="space-y-4">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={togglePlayPause}
                  disabled={!isReady}
                  aria-label={isPlaying && !isPaused ? "Pause" : "Play"}
                >
                  {isPlaying && !isPaused ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={resetAudio}
                  disabled={!isReady || (!isPlaying && progress === 0)}
                  aria-label="Reset"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={toggleMute} aria-label={isMuted ? "Unmute" : "Mute"}>
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>

                <div className="w-24">
                  <Slider
                    value={[volume]}
                    min={0}
                    max={1}
                    step={0.1}
                    onValueChange={handleVolumeChange}
                    aria-label="Volume"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

