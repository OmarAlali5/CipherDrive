import { useRef, useEffect } from 'react'
import { useScroll, useMotionValueEvent, useTransform, motion } from 'framer-motion'

const FRAME_COUNT = 146
const FRAME_PREFIX = '/frames/ezgif-frame-'
const FRAME_SUFFIX = '.jpg'

export function HeroVideoScroll() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Track the scroll progress of the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // Apple-style polish: Fade out and slightly scale down during the last 25% of the scroll
  const opacity = useTransform(scrollYProgress, [0, 0.75, 1], [1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.75, 1], [1, 1, 0.95])

  // Preload images into memory
  const images = useRef<HTMLImageElement[]>([])
  
  useEffect(() => {
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image()
      const paddedIndex = i.toString().padStart(3, '0')
      img.src = `${FRAME_PREFIX}${paddedIndex}${FRAME_SUFFIX}`
      images.current.push(img)
    }

    // Draw the first frame once the first image loads
    if (images.current[0]) {
      images.current[0].onload = () => {
        renderFrame(0)
      }
    }
  }, [])

  const renderFrame = (index: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    const img = images.current[index]
    if (!img) return

    // Ensure canvas dimensions match window dimensions for full cover
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    // Math for "object-fit: cover" on canvas
    const hRatio = canvas.width / img.width
    const vRatio = canvas.height / img.height
    const ratio = Math.max(hRatio, vRatio)
    const centerShift_x = (canvas.width - img.width * ratio) / 2
    const centerShift_y = (canvas.height - img.height * ratio) / 2

    // Reset all context state to prevent any inherited dimming or dark-mode overrides
    context.globalAlpha = 1.0
    context.filter = 'none'
    context.globalCompositeOperation = 'source-over'
    context.imageSmoothingEnabled = true

    context.clearRect(0, 0, canvas.width, canvas.height)
    context.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      centerShift_x,
      centerShift_y,
      img.width * ratio,
      img.height * ratio
    )
  }

  // Handle window resize to redraw current frame correctly
  useEffect(() => {
    const handleResize = () => {
      // Find what frame we're currently on
      const latest = scrollYProgress.get()
      const acceleratedProgress = Math.min(1, latest / 0.75)
      const frameIndex = Math.floor(acceleratedProgress * (FRAME_COUNT - 1))
      renderFrame(frameIndex)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [scrollYProgress])

  // Update canvas frame based on scroll
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    // Accelerated scrubbing: The sequence finishes completely by 75% of the scroll track
    const acceleratedProgress = Math.min(1, latest / 0.75)
    
    // Map progress (0 to 1) to frame index (0 to 150)
    const frameIndex = Math.floor(acceleratedProgress * (FRAME_COUNT - 1))
    
    requestAnimationFrame(() => {
      renderFrame(frameIndex)
    })
  })

  return (
    <div ref={containerRef} className="relative isolate h-[130vh] w-full bg-black">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-black">
        {/* The Canvas Element replacing Video */}
        <motion.canvas
          ref={canvasRef}
          style={{ opacity, scale }}
          className="absolute inset-0 w-full h-full block z-10"
        />
      </div>
    </div>
  )
}
