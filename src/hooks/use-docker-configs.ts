"use client"

import { useState, useEffect, useCallback } from "react"
import Cookies from "js-cookie"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import type { ConfigOption } from "@/components/configuration-selector"
import { ErrorResponse } from "@/types"

// API base URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

// Cache key for localStorage
const CACHE_KEY = "dockerhelper_configs_cache"
const CACHE_EXPIRY_KEY = "dockerhelper_configs_cache_expiry"
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

export function useDockerConfigs() {
  const [configs, setConfigs] = useState<ConfigOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const fetchConfigs = useCallback(async (forceRefresh = false) => {
    setIsLoading(true)
    setError(null)

    try {
      // Check if we have cached data and it's not expired
      if (!forceRefresh) {
        const cachedData = localStorage.getItem(CACHE_KEY)
        const cacheExpiry = localStorage.getItem(CACHE_EXPIRY_KEY)

        if (cachedData && cacheExpiry && Number(cacheExpiry) > Date.now()) {
          setConfigs(JSON.parse(cachedData))
          setIsLoading(false)
          return
        }
      }

      const token = Cookies.get("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`${API_URL}/docker/configs/list-simple`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse
        throw new Error(errorData.detail || "Failed to fetch Docker configurations")
      }

      const data = await response.json()
      setConfigs(data)

      // Cache the data
      localStorage.setItem(CACHE_KEY, JSON.stringify(data))
      localStorage.setItem(CACHE_EXPIRY_KEY, String(Date.now() + CACHE_DURATION))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch Docker configurations"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }, [router, toast]) // Add dependencies

  useEffect(() => {
    fetchConfigs()
  }, [fetchConfigs]) // Add fetchConfigs to dependencies

  return { configs, isLoading, error, refreshConfigs: () => fetchConfigs(true) }
}
