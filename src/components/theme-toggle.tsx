"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full opacity-70">
        <Sun className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 rounded-full transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-[1.2rem] w-[1.2rem] transition-transform duration-200 rotate-0" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] transition-transform duration-200 rotate-0" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
