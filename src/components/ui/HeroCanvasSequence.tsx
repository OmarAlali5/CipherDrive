import { useRef, useEffect, useState, useCallback } from 'react'
import { useScroll, useMotionValueEvent } from 'framer-motion'

// ─── Configuration ───────────────────────────────────────────────
const FRAME_COUNT = 151
const FRAME_PREFIX = '/frames/ezgif-frame-'
const FRAME_SUFFIX = '.jpg'

function getFrameSrc(index: number): string {
  // Frames are 1-indexed: ezgif-frame-001.jpg … ezgif-frame-146.jpg
  const padded = String(index + 1).padStart(3, '0')
  return `${FRAME_PREFIX}${padded}${FRAME_SUFFIX}`
}

// ─── Component ───────────────────────────────────────────────────
export function HeroCanvasSequence() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const [firstFrameLoaded, setFirstFrameLoaded] = useState(false)

  // Scroll progress over the 150vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // ── Preload all frames ──
  useEffect(() => {
    const imgs: HTMLImageElement[] = []

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image()
      img.src = getFrameSrc(i)

      // Signal readiness when the very first frame loads
      if (i === 0) {
        img.onload = () => setFirstFrameLoaded(true)
      }

      imgs.push(img)
    }

    imagesRef.current = imgs
  }, [])

  // ── Draw a single frame to the canvas ──
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = imagesRef.current[frameIndex]
    if (!img || !img.complete || img.naturalWidth === 0) return

    // Match canvas buffer to viewport for crisp 1:1 rendering
    const w = window.innerWidth
    const h = window.innerHeight
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }

    // ── CRITICAL LIGHTING RESET ──
    // Prevent ANY inherited dimming, dark-mode injection, or stale state
    ctx.globalAlpha = 1.0
    ctx.filter = 'none'
    ctx.globalCompositeOperation = 'source-over'
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // "object-fit: cover" math
    const hRatio = w / img.naturalWidth
    const vRatio = h / img.naturalHeight
    const ratio = Math.max(hRatio, vRatio)
    const dx = (w - img.naturalWidth * ratio) / 2
    const dy = (h - img.naturalHeight * ratio) / 2

    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(
      img,
      0, 0, img.naturalWidth, img.naturalHeight,
      dx, dy, img.naturalWidth * ratio, img.naturalHeight * ratio,
    )
  }, [])

  // ── Paint first frame once it loads ──
  useEffect(() => {
    if (firstFrameLoaded) {
      drawFrame(0)
    }
  }, [firstFrameLoaded, drawFrame])

  // ── Resize handler ──
  useEffect(() => {
    const onResize = () => {
      const progress = scrollYProgress.get()
      const idx = Math.min(FRAME_COUNT - 1, Math.floor(progress * (FRAME_COUNT - 1)))
      drawFrame(idx)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [scrollYProgress, drawFrame])

  // ── Scroll → frame mapping ──
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const frameIndex = Math.min(
      FRAME_COUNT - 1,
      Math.floor(latest * (FRAME_COUNT - 1)),
    )
    requestAnimationFrame(() => drawFrame(frameIndex))
  })

  return (
    // Outer scroll track — 150vh gives fast, snappy scrubbing
    <div
      ref={containerRef}
      className="relative isolate h-[150vh] w-full bg-black"
    >
      {/* Sticky viewport — pins the canvas while scrolling through the track */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        {/*
          THE CANVAS — absolutely no overlays, no pseudo-elements, no opacity tricks.
          Tailwind classes force raw brightness; z-10 lifts above any stray page overlays.
        */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-10 block h-full w-full !brightness-100 opacity-100 mix-blend-normal"
          style={{
            filter: 'none',
            opacity: 1,
            mixBlendMode: 'normal',
            imageRendering: 'auto',
          }}
        />
      </div>
    </div>
  )
}
