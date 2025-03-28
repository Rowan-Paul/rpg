"use client"

import { ContentResultsProps } from "./content-generator"
import { Button } from "./ui/button"
import { useState } from "react"

const VideoGenerator = ({ script, imagePrompts }: ContentResultsProps) => {
  const [isGenerating, setIsGenerating] = useState(false)

  const cropToAspectRatio = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    targetWidth: number,
    targetHeight: number
  ) => {
    const aspectRatio = targetWidth / targetHeight
    let sourceWidth = img.width
    let sourceHeight = img.height
    let sourceX = 0
    let sourceY = 0

    // Calculate dimensions to crop to 9:16
    if (sourceWidth / sourceHeight > aspectRatio) {
      // Image is too wide
      sourceWidth = sourceHeight * aspectRatio
      sourceX = (img.width - sourceWidth) / 2
    } else {
      // Image is too tall
      sourceHeight = sourceWidth / aspectRatio
      sourceY = (img.height - sourceHeight) / 2
    }

    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      targetWidth,
      targetHeight
    )
  }

  const loadImage = async (imageData: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"  // Add cross-origin handling

      img.onload = () => resolve(img)
      img.onerror = (e) => reject(new Error('Failed to load image'))

      // Handle different image data formats
      if (imageData.startsWith('data:')) {
        // If it's already a data URL, use it directly
        img.src = imageData
      } else if (imageData.startsWith('http')) {
        // If it's a URL, use it directly
        img.src = imageData
      } else {
        // Assume it's base64 data and convert to data URL
        img.src = `data:image/png;base64,${imageData}`
      }
    })
  }

  const generateVideo = async () => {
    setIsGenerating(true)
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Failed to get canvas context')
      }

      const width = 270
      const height = 480
      canvas.width = width
      canvas.height = height

      // Add error handling for MediaRecorder support
      if (!MediaRecorder.isTypeSupported('video/webm')) {
        throw new Error('video/webm is not supported in this browser')
      }

      const stream = canvas.captureStream(30)
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm'
      })

      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'vertical-video.webm'
        a.click()
        URL.revokeObjectURL(url)
      }

      mediaRecorder.start()

      // Process images sequentially
      for (const imagePrompt of imagePrompts) {
        try {
          const img = await loadImage(imagePrompt)
          if (ctx) {
            ctx.fillStyle = '#000000'
            ctx.fillRect(0, 0, width, height)
            cropToAspectRatio(ctx, img, width, height)
          }
          URL.revokeObjectURL(img.src) // Clean up blob URL
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (error) {
          console.error('Error processing image:', error)
        }
      }

      mediaRecorder.stop()
    } catch (error) {
      console.error('Error generating video:', error)
    }
    setIsGenerating(false)
  }

  return (
    <Button
      onClick={generateVideo}
      disabled={isGenerating}
    >
      {isGenerating ? 'Generating...' : 'Generate video'}
    </Button>
  )
}

export default VideoGenerator
