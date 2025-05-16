"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { AnalysisResults } from "@/components/analysis-results"
import { Skeleton } from "@/components/ui/skeleton"
import { AnalysisSelectorDropdown } from "@/components/analysis-selector-dropdown"
import Cookies from "js-cookie"
import type { AnalysisResult, BackendError, ErrorResponse } from "@/types"

// API base URL - would typically come from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

export function RepositoryForm() {
  const [repoUrl, setRepoUrl] = useState("")
  const [branch, setBranch] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string>("")
  const { toast } = useToast()
  const router = useRouter()

  const validateRepoUrl = (url: string) => {
    // Basic validation for Git repository URLs (GitHub and GitLab)
    const githubUrlPattern = /^(https?:\/\/)?(www\.)?github\.com\/[\w-]+\/[\w.-]+(\/?|\.git)?$/
    const gitlabUrlPattern = /^(https?:\/\/)?(www\.)?gitlab\.com\/[\w-]+\/[\w.-]+(\/?|\.git)?$/

    return githubUrlPattern.test(url) || gitlabUrlPattern.test(url)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate repository URL
    if (!validateRepoUrl(repoUrl)) {
      setError("Please enter a valid GitHub or GitLab repository URL")
      return
    }

    setIsLoading(true)

    try {
      const token = Cookies.get("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`${API_URL}/repos/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          repo_url: repoUrl,
          branch: branch || undefined, // Only include if provided
        }),
      })

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse
        throw new Error(errorData.detail || "Failed to analyze repository")
      }

      const data = await response.json()
      setAnalysisResult(data)
      toast({
        title: "Analysis Complete",
        description: "Repository has been successfully analyzed.",
        className: "animate-in slide-in-bottom",
      })
    } catch (err) {
      setError(
        err instanceof Error
          ? (err as BackendError).detail || err.message
          : "Failed to analyze repository. Please try again.",
      )

      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: err instanceof Error ? (err as BackendError).detail || err.message : "Failed to analyze repository",
        className: "animate-in slide-in-bottom",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadPreviousAnalysis = async () => {
    if (!selectedAnalysisId) return

    setIsLoading(true)
    setError(null)

    try {
      const token = Cookies.get("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`${API_URL}/repos/${selectedAnalysisId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse
        throw new Error(errorData.detail || "Failed to load analysis")
      }

      const data = await response.json()
      setAnalysisResult(data)
      toast({
        title: "Analysis Loaded",
        description: "Previous analysis has been loaded successfully.",
      })
    } catch (err) {
      setError(
        err instanceof Error
          ? (err as BackendError).detail || err.message
          : "Failed to load analysis. Please try again.",
      )
      toast({
        variant: "destructive",
        title: "Loading Failed",
        description: err instanceof Error ? (err as BackendError).detail || err.message : "Failed to load analysis",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setRepoUrl("")
    setBranch("")
    setAnalysisResult(null)
    setError(null)
    setSelectedAnalysisId("")
  }

  return (
    <div className="space-y-8">
      <Card className="card-hover animate-in">
        <CardContent className="pt-6">
          {error && (
            <Alert variant="destructive" className="mb-4 animate-in">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Analyze a New Repository</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="repoUrl">Git Repository URL</Label>
                  <Input
                    id="repoUrl"
                    placeholder="https://github.com/username/repository or https://gitlab.com/username/repository"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    disabled={isLoading}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a valid GitHub or GitLab repository URL (e.g., https://github.com/username/repository or
                    https://gitlab.com/username/repository)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch (Optional)</Label>
                  <Input
                    id="branch"
                    placeholder="main"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    disabled={isLoading}
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={isLoading || !repoUrl} className="hover-scale">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                      </>
                    ) : (
                      "Analyze Repository"
                    )}
                  </Button>
                  {analysisResult && (
                    <Button type="button" variant="outline" onClick={handleReset} className="hover-scale">
                      Reset
                    </Button>
                  )}
                </div>
              </form>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Load Previous Analysis</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="previousAnalysis">Select Previous Analysis</Label>
                  <AnalysisSelectorDropdown
                    value={selectedAnalysisId}
                    onChange={setSelectedAnalysisId}
                    placeholder="Select a previous analysis"
                    disabled={isLoading}
                  />
                </div>
                <Button type="button" onClick={handleLoadPreviousAnalysis} disabled={isLoading || !selectedAnalysisId}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
                    </>
                  ) : (
                    "Load Analysis"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <Card className="animate-pulse">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {analysisResult && <AnalysisResults analysis={analysisResult} />}
    </div>
  )
}
