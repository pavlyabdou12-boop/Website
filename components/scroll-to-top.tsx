"use client"

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" })
}

export function useScrollToTop() {
  return scrollToTop
}
