'use client'

import { useState, useEffect } from 'react'

// Module-level counters and listeners — live for the lifetime of the browser session.
// Calling invalidate('projects') increments the counter and notifies every active
// useProjects() hook to re-fetch, regardless of where it sits in the component tree.

const counters: Record<string, number> = {}
const listeners: Record<string, Set<() => void>> = {}

export function invalidate(key: string) {
  counters[key] = (counters[key] ?? 0) + 1
  listeners[key]?.forEach((fn) => fn())
}

export function useInvalidationKey(key: string): number {
  const [count, setCount] = useState(counters[key] ?? 0)

  useEffect(() => {
    if (!listeners[key]) listeners[key] = new Set()
    const handler = () => setCount((c) => c + 1)
    listeners[key].add(handler)
    return () => { listeners[key].delete(handler) }
  }, [key])

  return count
}
