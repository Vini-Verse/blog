"use client"

import { useEffect } from "react"
import { getLanguage } from "../lib/language"

export default function ArticlesAutoScroll() {
  useEffect(() => {
    function scrollToLocalized() {
      const lang = getLanguage()
      const targetId = lang === 'pt-BR' ? 'observabilidade-ptbr' : 'observability'
      const el = document.getElementById(`article-${targetId}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.animate([
          { boxShadow: '0 0 0px rgba(59,130,246,0.0)' },
          { boxShadow: '0 0 12px rgba(59,130,246,0.25)' },
          { boxShadow: '0 0 0px rgba(59,130,246,0.0)' }
        ], { duration: 1200 })
      }
    }

    // scroll on mount
    scrollToLocalized()

    function onLang(e: Event) {
      scrollToLocalized()
    }

    window.addEventListener('app:language-changed', onLang as EventListener)
    return () => window.removeEventListener('app:language-changed', onLang as EventListener)
  }, [])

  return null
}
