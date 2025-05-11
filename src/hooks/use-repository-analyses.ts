"use client"

import { useState, useEffect } from "react"
import Cookies from "js-cookie"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import type { AnalysisOption } from "@/components/analysis-selector"

// API base URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

// Cache key for localStorage
const CACHE_KEY = "dockerhelper_analyses_cache"
const CACHE_EXPIRY_KEY = "dockerhelper_analyses_cache_expiry"
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

export function useRepositoryAnalyses() {
  const [analyses, setAnalyses] = useState<AnalysisOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const fetchAnalyses = async (forceRefresh = false) => {
    setIsLoading(true)
    setError(null)

    try {
      // Check if we have cached data and it's not expired
      if (!forceRefresh) {
        const cachedData = localStorage.getItem(CACHE_KEY)
        const cacheExpiry = localStorage.getItem(CACHE_EXPIRY_KEY)

        if (cachedData && cacheExpiry && Number(cacheExpiry) > Date.now()) {
          setAnalyses(JSON.parse(cachedData))
          setIsLoading(false)
          return
        }
      }

      const token = Cookies.get("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`${API_URL}/repos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch repository analyses")
      }

      const data = await response.json()

      // Transform the data for the dropdown
      const transformedData = data.map((repo: any) => ({
        id: repo.id,
        display_name: `${repo.repo_url} @ ${repo.branch || "default"}`,
        repo_url: repo.repo_url,
        branch: repo.branch || "default",
      }))

      setAnalyses(transformedData)

      // Cache the data
      localStorage.setItem(CACHE_KEY, JSON.stringify(transformedData))
      localStorage.setItem(CACHE_EXPIRY_KEY, String(Date.now() + CACHE_DURATION))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch repository analyses"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyses()
  }, [])

  return { analyses, isLoading, error, refreshAnalyses: () => fetchAnalyses(true) }
}
