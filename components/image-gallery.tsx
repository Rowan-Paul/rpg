"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"

interface ImageGalleryProps {
  imagePrompts: String[]
}

export function ImageGallery({ imagePrompts }: ImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  const handlePrevious = useCallback(() => {
    setSelectedImageIndex((current) =>
      current !== null ? (current - 1 + imagePrompts.length) % imagePrompts.length : null
    )
  }, [imagePrompts.length])

  const handleNext = useCallback(() => {
    setSelectedImageIndex((current) =>
      current !== null ? (current + 1) % imagePrompts.length : null
    )
  }, [imagePrompts.length])

  const handleKeyDown = useCallback((event: any) => {
    if (event.key === 'ArrowLeft') handlePrevious()
    if (event.key === 'ArrowRight') handleNext()
  }, [handlePrevious, handleNext])

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Generated Images</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 gap-4">
            {imagePrompts.map((base64String, index) => (
              <img
                key={index}
                src={`data:image/png;base64,${base64String}`}
                alt={`Generated image ${index + 1}`}
                className="rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setSelectedImageIndex(index)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={selectedImageIndex !== null}
        onOpenChange={() => setSelectedImageIndex(null)}
      >
        <VisuallyHidden asChild><DialogTitle>Enlarged Image</DialogTitle></VisuallyHidden>
        <DialogContent className="max-w-4xl" onKeyDown={handleKeyDown}>
          <div className="relative">
            {selectedImageIndex !== null && (
              <>
                <img
                  src={`data:image/png;base64,${imagePrompts[selectedImageIndex]}`}
                  alt={`Enlarged image ${selectedImageIndex + 1}`}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-black/20 hover:bg-black/40"
                    onClick={handlePrevious}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-black/20 hover:bg-black/40"
                    onClick={handleNext}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

