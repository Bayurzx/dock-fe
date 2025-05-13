"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Check, ChevronsUpDown, Loader2, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import Cookies from "js-cookie"
import type { BackendError } from "@/types"

// API base URL - would typically come from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

interface RepositoryAnalysis {
  id: string
  repo_url: string
  branch: string
  framework: string
  analyzed_at: string
}

interface AnalysisSelectorDropdownProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  triggerClassName?: string
}

// Cache for repository analyses
let analysisCache: RepositoryAnalysis[] = []
let lastFetchTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

export function AnalysisSelectorDropdown({
  value,
  onChange,
  placeholder = "Select an analysis",
  disabled = false,
  className,
  triggerClassName,
}: AnalysisSelectorDropdownProps) {
  const [open, setOpen] = useState(false)
  const [analyses, setAnalyses] = useState<RepositoryAnalysis[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)

  const fetchAnalyses = useCallback(async (force = false) => {
    const now = Date.now()

    // Use cache if it's still valid and not forced refresh
    if (!force && analysisCache.length > 0 && now - lastFetchTime < CACHE_DURATION) {
      setAnalyses(analysisCache)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const token = Cookies.get("token")
      if (!token) {
        throw new Error("Authentication required")
      }

      const response = await fetch(`${API_URL}/repos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch analyses")
      }

      const data = await response.json()

      // Update cache
      analysisCache = data
      lastFetchTime = now

      setAnalyses(data)
    } catch (err) {
      console.error("Error fetching analyses:", err)
      setError(err instanceof Error ? (err as BackendError).detail || err.message : "Failed to fetch analyses")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch and setup refresh timer
  useEffect(() => {
    fetchAnalyses()

    // Set up periodic refresh
    refreshTimerRef.current = setInterval(() => {
      fetchAnalyses(true) // Force refresh
    }, CACHE_DURATION)

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current)
      }
    }
  }, [fetchAnalyses])

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Filter analyses based on search query
  const filteredAnalyses = analyses.filter(
    (analysis) =>
      analysis.repo_url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      analysis.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      analysis.framework.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Find the selected analysis for display
  const selectedAnalysis = analyses.find((analysis) => analysis.id === value)

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between overflow-hidden",
              !value && "text-muted-foreground",
              triggerClassName,
            )}
            disabled={disabled}
          >
            {value && selectedAnalysis ? (
              <span className="truncate">
                {selectedAnalysis.repo_url} ({selectedAnalysis.branch || "default"})
              </span>
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" style={{ width: "var(--radix-popover-trigger-width)" }}>
          <Command>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder="Search analyses..."
                className="h-9 flex-1"
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              {searchQuery && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSearchQuery("")}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                <p className="text-red-500">{error}</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => fetchAnalyses(true)}>
                  Retry
                </Button>
              </div>
            ) : (
              <>
                <CommandList>
                  <CommandEmpty>No analyses found.</CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-auto">
                    {filteredAnalyses.map((analysis) => (
                      <CommandItem
                        key={analysis.id}
                        value={analysis.id}
                        onSelect={() => {
                          onChange(analysis.id)
                          setOpen(false)
                        }}
                        className="flex items-center justify-between"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{analysis.repo_url}</span>
                          <span className="text-xs text-muted-foreground">
                            {analysis.branch || "default"} - {analysis.framework} - {formatDate(analysis.analyzed_at)}
                          </span>
                        </div>
                        {value === analysis.id && <Check className="h-4 w-4 text-primary" />}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
                <div className="border-t p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center text-xs"
                    onClick={() => fetchAnalyses(true)}
                  >
                    Refresh
                  </Button>
                </div>
              </>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
