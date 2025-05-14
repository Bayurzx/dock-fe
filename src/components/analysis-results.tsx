"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Check, FileCode, FileText, History } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { CodeDisplay } from "@/components/code-display"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Cookies from "js-cookie"
import type { AnalysisResultsProps, BackendError, ErrorResponse } from "@/types"

// API base URL - would typically come from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dockerfile, setDockerfile] = useState<string | null>(null)
  const [configId, setConfigId] = useState<string | null>(null)
  const [improvementFeedback, setImprovementFeedback] = useState("")
  const [isImproving, setIsImproving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const generateDockerfile = async () => {
    setError(null)
    setIsGenerating(true)

    try {
      const token = Cookies.get("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`${API_URL}/docker/generate/dockerfile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          analysis_id: analysis.id,
          name: analysis.repo_url.split("/").pop(),
        }),
      })

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse
        throw new Error(errorData.detail || "Failed to generate Dockerfile")
      }

      const data = await response.json()
      setDockerfile(data.content)
      setConfigId(data.id)
      toast({
        title: "Dockerfile Generated",
        description: "Dockerfile has been successfully generated.",
      })
    } catch (err) {
      setError(
        err instanceof Error
          ? (err as BackendError).detail || err.message
          : "Failed to generate Dockerfile. Please try again.",
      )
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: err instanceof Error ? (err as BackendError).detail || err.message : "Failed to generate Dockerfile",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleMarkAsSuccessful = async () => {
    if (!configId) return

    try {
      const token = Cookies.get("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`${API_URL}/docker/configs/${configId}/mark_successful`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          is_verified_good: true,
        }),
      })

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse
        throw new Error(errorData.detail || "Failed to submit feedback")
      }

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! This helps improve our system.",
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Feedback Failed",
        description: err instanceof Error ? (err as BackendError).detail || err.message : "Failed to submit feedback",
      })
    }
  }

  const handleImproveConfig = async () => {
    if (!configId || !improvementFeedback.trim()) return

    setIsImproving(true)
    try {
      const token = Cookies.get("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`${API_URL}/docker/configs/${configId}/improve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          feedback_type: "instruction",
          feedback_text: improvementFeedback,
        }),
      })

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse
        throw new Error(errorData.detail || "Failed to improve configuration")
      }

      const data = await response.json()
      setDockerfile(data.content)
      setImprovementFeedback("")
      setIsDialogOpen(false)

      toast({
        title: "Configuration Improved",
        description: "Your feedback has been applied to improve the configuration.",
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Improvement Failed",
        description: err instanceof Error ? (err as BackendError).detail || err.message : "Failed to improve configuration",
      })
    } finally {
      setIsImproving(false)
    }
  }

  const viewVersionHistory = () => {
    if (configId) {
      router.push(`/configurations/${configId}/versions`)
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Analysis Results</CardTitle>
          <CardDescription>Details from the repository analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium">Framework</h3>
                  <p className="mt-1">{analysis.framework}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Base Image</h3>
                  <p className="mt-1">{analysis.base_image || analysis.recommended_base_image}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Branch</h3>
                  <p className="mt-1">{analysis.branch}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Git Hash</h3>
                  <p className="mt-1 font-mono text-xs">{analysis.git_hash}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium">Summary</h3>
                <p className="mt-1">{analysis.summary || analysis.analysis?.summary}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium">Exposed Ports</h3>
                <div className="mt-1 flex flex-wrap gap-2">
                  {(analysis.ports?.length ? analysis.ports : analysis.analysis?.exposed_ports || []).map(
                    (port, index) => (
                      <Badge key={index} variant="outline">
                        {port}
                      </Badge>
                    ),
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium">Recommended Base Image</h3>
                  <p className="mt-1">{analysis.recommended_base_image}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Working Directory</h3>
                  <p className="mt-1">{analysis.analysis?.working_directory}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Project Type</h3>
                  <p className="mt-1">{analysis.analysis?.project_type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Analysis ID</h3>
                  <p className="mt-1 font-mono text-xs">{analysis.id || analysis.analysis_id}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium">Environment Variables</h3>
                <div className="mt-1 flex flex-wrap gap-2">
                  {(analysis.environment_variables || analysis.analysis?.environment_variables || []).map(
                    (env, index) => (
                      <Badge key={index} variant="secondary">
                        {env}
                      </Badge>
                    ),
                  )}
                </div>
              </div>

              {analysis.analysis?.build_steps?.length ? (
                <div>
                  <h3 className="text-sm font-medium">Build Steps</h3>
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    {analysis.analysis.build_steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div>
                <h3 className="text-sm font-medium">Run Command</h3>
                <p className="mt-1 font-mono text-sm bg-muted p-2 rounded overflow-x-auto">
                  {analysis.run_command || analysis.analysis?.run_command}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="dependencies" className="space-y-4 pt-4">
              <div>
                <h3 className="text-sm font-medium">Dependencies</h3>
                {Array.isArray(analysis.dependencies) ? (
                  <div className="mt-1 flex flex-wrap gap-2">
                    {analysis.dependencies.map((dep, index) => (
                      <Badge key={index} variant="secondary">
                        {dep}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  Object.entries(analysis.dependencies || {}).map(([tool, deps], index) => (
                    <div key={index} className="mt-2">
                      <p className="text-xs font-semibold text-gray-500">{tool}</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {Array.isArray(deps) &&
                          deps.map((dep, idx) => (
                            <Badge key={idx} variant="secondary">
                              {dep}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2 justify-between">
          <Button onClick={generateDockerfile} disabled={isGenerating}>
            <FileCode className="mr-2 h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate Dockerfile"}
          </Button>
          <Button variant="outline" onClick={() => router.push("/compose-generator")}>
            <FileText className="mr-2 h-4 w-4" />
            Go to Compose Generator
          </Button>
        </CardFooter>
      </Card>

      {isGenerating && (
        <Card>
          <CardHeader>
            <CardTitle>Generating Dockerfile</CardTitle>
            <CardDescription>Please wait while we generate your Dockerfile...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-6 w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {dockerfile && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Dockerfile</CardTitle>
            <CardDescription>
              Review the generated Dockerfile for your repository. You can copy it to your clipboard, mark it as
              successful, or provide feedback to improve it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeDisplay code={dockerfile} language="dockerfile" />
          </CardContent>
          <CardFooter className="flex flex-wrap justify-end gap-2">
            {configId && (
              <Button variant="outline" onClick={viewVersionHistory}>
                <History className="mr-2 h-4 w-4" />
                Version History
              </Button>
            )}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Improve Configuration</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Improve Configuration</DialogTitle>
                  <DialogDescription>
                    Provide feedback or instructions to improve this configuration. Be specific about what you want to
                    change.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Textarea
                    placeholder="e.g., Add curl and wget to the image, or Use a multi-stage build to reduce image size"
                    value={improvementFeedback}
                    onChange={(e) => setImprovementFeedback(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                <DialogFooter>
                  <Button onClick={handleImproveConfig} disabled={isImproving || !improvementFeedback.trim()}>
                    {isImproving ? "Improving..." : "Submit Feedback"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={handleMarkAsSuccessful}>
              <Check className="mr-2 h-4 w-4" />
              Mark as Successful
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
