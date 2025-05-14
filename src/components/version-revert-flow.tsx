"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Cookies from "js-cookie"
// Add import for BackendError
import type { BackendError, ErrorResponse } from "@/types"

// API base URL - would typically come from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

interface ConfigVersion {
  version_number: number
  content_type: "dockerfile" | "compose"
  feedback_used?: string
  created_at: string
}

interface VersionRevertFlowProps {
  configId: string
  configName: string
  configType: "dockerfile" | "compose"
  onRevertSuccess?: () => void
  className?: string
}

export function VersionRevertFlow({
  configId,
  configName,
  configType,
  onRevertSuccess,
  className,
}: VersionRevertFlowProps) {
  const [versions, setVersions] = useState<ConfigVersion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVersionNumber, setSelectedVersionNumber] = useState<string>("")
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isReverting, setIsReverting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchVersions()
  }, [configId])

  const fetchVersions = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const token = Cookies.get("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`${API_URL}/docker/configs/${configId}/versions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse
        throw new Error(errorData.detail || "Failed to fetch versions")
      }

      const data = await response.json()
      setVersions(data)

      // If there are versions, select the latest one by default (excluding the current version)
      if (data.length > 1) {
        setSelectedVersionNumber(data[1].version_number.toString())
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch versions. Please try again.")
      toast({
        variant: "destructive",
        title: "Error",
        // description: err instanceof Error ? err.message : "Failed to fetch versions",
        description: err instanceof Error ? (err as BackendError).detail || err.message : "Failed to fetch versions",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevertToVersion = async () => {
    if (!selectedVersionNumber) return

    setIsReverting(true)
    try {
      const token = Cookies.get("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`${API_URL}/docker/configs/${configId}/versions/${selectedVersionNumber}/revert`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse
        throw new Error(errorData.detail || "Failed to revert to version")
      }

      toast({
        title: "Version Reverted",
        description: `Successfully reverted to version ${selectedVersionNumber}`,
      })

      // Call the onRevertSuccess callback if provided
      if (onRevertSuccess) {
        onRevertSuccess()
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Revert Failed",
        // description: err instanceof Error ? err.message : "Failed to revert to version",
        description: err instanceof Error ? (err as BackendError).detail || err.message : "Failed to revert to version",
      })
    } finally {
      setIsReverting(false)
      setIsConfirmDialogOpen(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatVersionOption = (version: ConfigVersion) => {
    return `Version ${version.version_number} (${formatDate(version.created_at)})${
      version.feedback_used ? ` - Feedback: ${version.feedback_used}` : ""
    }`
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Revert Configuration</CardTitle>
        <CardDescription>
          Revert {configName} ({configType === "dockerfile" ? "Dockerfile" : "docker-compose.yaml"}) to a previous
          version.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="version-select" className="text-sm font-medium">
              Select Version
            </label>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : versions.length <= 1 ? (
              <Alert>
                <AlertDescription>No previous versions available for this configuration.</AlertDescription>
              </Alert>
            ) : (
              <Select
                value={selectedVersionNumber}
                onValueChange={setSelectedVersionNumber}
                disabled={versions.length <= 1}
              >
                <SelectTrigger id="version-select">
                  <SelectValue placeholder="Select a version" />
                </SelectTrigger>
                <SelectContent>
                  {versions
                    .filter((v, i) => i > 0) // Skip the current version (index 0)
                    .map((version) => (
                      <SelectItem key={version.version_number} value={version.version_number.toString()}>
                        {formatVersionOption(version)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={() => setIsConfirmDialogOpen(true)}
          disabled={isLoading || isReverting || versions.length <= 1 || !selectedVersionNumber}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          {isReverting ? "Reverting..." : "Revert to Selected Version"}
        </Button>
      </CardFooter>

      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Revert</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revert to version {selectedVersionNumber}? The current content will be archived
              as a new version.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isReverting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevertToVersion} disabled={isReverting}>
              {isReverting ? "Reverting..." : "Revert"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
