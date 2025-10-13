"use client"

const TRANSITION_ATTRIBUTE = "data-theme-transition"
const TRANSITION_DURATION = 350

let transitionTimeout: ReturnType<typeof setTimeout> | undefined

/**
 * Applies a short-lived attribute on <html> so that elements animate
 * their color/background changes while toggling the theme.
 */
export function triggerThemeTransition(duration = TRANSITION_DURATION) {
  if (typeof document === "undefined" || typeof window === "undefined") return

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
  if (prefersReducedMotion.matches) return

  const root = document.documentElement
  root.setAttribute(TRANSITION_ATTRIBUTE, "")

  if (transitionTimeout) {
    clearTimeout(transitionTimeout)
  }

  transitionTimeout = setTimeout(() => {
    root.removeAttribute(TRANSITION_ATTRIBUTE)
  }, duration)
}
