"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Clock3, Sparkles, Users } from "lucide-react"

const OFFER_DURATION = 3 * 60 * 60 + 47 * 60 + 12
const VIEWER_COUNT_MIN = 12
const VIEWER_COUNT_MAX = 28

export function FomoBanner() {
  const [secondsLeft, setSecondsLeft] = useState(OFFER_DURATION)
  const [viewerCount, setViewerCount] = useState(18)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : OFFER_DURATION))
    }, 1000)

    const viewerTimer = window.setInterval(() => {
      setViewerCount(
        Math.floor(Math.random() * (VIEWER_COUNT_MAX - VIEWER_COUNT_MIN + 1)) + VIEWER_COUNT_MIN,
      )
    }, 18_000)

    return () => {
      window.clearInterval(timer)
      window.clearInterval(viewerTimer)
    }
  }, [])

  const hours = Math.floor(secondsLeft / 3600)
  const minutes = Math.floor((secondsLeft % 3600) / 60)
  const seconds = secondsLeft % 60
  const pad = (value: number) => String(value).padStart(2, "0")

  return (
    <>
      <section className="bg-[#241c17] px-4 py-3 text-[#f7efe7]" aria-label="Limited time offer">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-center text-sm sm:flex-row sm:text-left">
          <p className="flex items-center gap-2 font-medium">
            <Sparkles className="h-4 w-4 text-[#d7a26f]" aria-hidden="true" />
            Extra 15% off on all collections
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.16em] text-[#cdb9a7]">Ends in</span>
            <span className="font-mono font-semibold tabular-nums" aria-label={`${hours} hours ${minutes} minutes ${seconds} seconds remaining`}>
              {pad(hours)}:{pad(minutes)}:{pad(seconds)}
            </span>
            <Link href="/sale" suppressHydrationWarning className="inline-flex items-center gap-1 font-semibold underline underline-offset-4 hover:text-[#d7a26f]">
              Shop now <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-[#eadfd5] bg-[#fbf8f4] px-4 py-3 text-[#5b4535]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center text-xs sm:justify-between sm:text-left">
          <span className="flex items-center gap-2" aria-live="polite"><Users className="h-4 w-4" aria-hidden="true" /> <span><strong className="font-bold">{viewerCount} people</strong> are browsing Sisies right now</span></span>
          <span className="basis-full text-center text-[11px] leading-relaxed sm:basis-auto sm:text-left"><strong className="font-bold text-[#9a4f36]">Find us at LA Market</strong>, Hydeout Events Arena, <strong className="font-bold">2–3 November</strong>, Booth <strong className="font-bold">174</strong> for extra discounts and exclusive items</span>
          <span className="flex items-center gap-2"><Clock3 className="h-4 w-4" aria-hidden="true" /> Free delivery on orders over EGP 2,500</span>
        </div>
      </section>
    </>
  )
}

export function StickyShopCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 shadow-[0_-8px_24px_rgba(46,37,31,0.08)] backdrop-blur md:hidden">
      <Link href="/sale" className="flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
        Shop limited-time offers <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  )
}

export function ScarcityNote({ soldOut = false }: { soldOut?: boolean }) {
  if (soldOut) return <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Currently sold out</span>
  return <span className="text-xs font-semibold uppercase tracking-wide text-[#9a4f36]">Popular now · limited stock</span>
}
