"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import type { CarouselApi } from "@/components/ui/carousel"

function CarouselDots({
  api,
  className,
}: {
  api: CarouselApi | undefined
  className?: string
}) {
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([])

  React.useEffect(() => {
    if (!api) return

    setScrollSnaps(api.scrollSnapList())
    const onSelect = () => setSelectedIndex(api.selectedScrollSnap())
    onSelect()
    api.on("select", onSelect)
    api.on("reInit", onSelect)

    return () => {
      api.off("select", onSelect)
      api.off("reInit", onSelect)
    }
  }, [api])

  if (scrollSnaps.length <= 1) return null

  return (
    <div
      role="tablist"
      aria-label="Slides"
      data-slot="carousel-dots"
      className={cn("flex items-center justify-center gap-2", className)}
    >
      {scrollSnaps.map((_, index) => (
        <button
          key={index}
          type="button"
          role="tab"
          aria-selected={index === selectedIndex}
          aria-label={`Go to slide ${index + 1}`}
          onClick={() => api?.scrollTo(index)}
          className={cn(
            "h-2 w-2 shadow-sm transition-colors",
            index === selectedIndex ? "bg-primary" : "bg-white"
          )}
        />
      ))}
    </div>
  )
}

export { CarouselDots }
