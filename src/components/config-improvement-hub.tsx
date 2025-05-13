"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Loader2, Sparkles } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { CodeDisplay } from "@/components/code-display"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import Cookies from "js-cookie"

// API base URL - would typically come from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

interface SimpleConfig {
  id: string
  name: string
  type: "dockerfile" | "compose"
}

interface ConfigDetail {
  id: string
  name: string
  type: "dockerfile" | "compose"
  content: string
  dockerfile_content?: string
  docker_compose_content?: string
  created_at: string
  is_verified_good?: boolean
}

export default function ConfigImprovementHub() {
  const [configurations, setConfigurations] = useState<SimpleConfig[]>([])
  const [selectedConfigId, setSelectedConfigId] = useState<string>("")
  const [selectedConfig, setSelectedConfig] = useState<ConfigDetail | null>(null)
  const [feedbackType, setFeedbackType] = useState<"instruction" | "error">("instruction")
  const [feedbackText, setFeedbackText] = useState("")
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(true)
  const [isLoadingConfig, setIsLoadingConfig] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [improvedContent, setImprovedContent] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Fetch the list of configurations
  const fetchConfigurations = useCallback(async () => {
    setIsLoadingConfigs(true)
    setError(null)

    try {
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
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch configurations")
      }

      const data = await response.json()
      setConfigurations(data)

      // Check for config parameter in URL
      const configId = searchParams?.get("config")
      if (configId) {
        setSelectedConfigId(configId)
        fetchConfigDetail(configId)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch configurations. Please try again.")
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch configurations",
      })
    } finally {
      setIsLoadingConfigs(false)
    }
  }, [router, searchParams, toast])

  // Fetch the details of a selected configuration
  const fetchConfigDetail = async (configId: string) => {
    if (!configId) return

    setIsLoadingConfig(true)
    setError(null)
    setImprovedContent(null)

    try {
      const token = Cookies.get("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`${API_URL}/docker/configs/${configId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch configuration details")
      }

      const data = await response.json()
      setSelectedConfig(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch configuration details. Please try again.")
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch configuration details",
      })
    } finally {
      setIsLoadingConfig(false)
    }
  }

  // Submit improvement feedback
  const submitImprovement = async () => {
    if (!selectedConfigId || !feedbackText.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select a configuration and provide feedback.",
      })
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const token = Cookies.get("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`${API_URL}/docker/configs/${selectedConfigId}/improve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          feedback_type: feedbackType,
          feedback_text: feedbackText,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to improve configuration")
      }

      const data = await response.json()
      setImprovedContent(data.content || data.dockerfile_content || data.docker_compose_content)

      toast({
        title: "Configuration Improved",
        description: "Your feedback has been applied to improve the configuration.",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to improve configuration. Please try again.")
      toast({
        variant: "destructive",
        title: "Improvement Failed",
        description: err instanceof Error ? err.message : "Failed to improve configuration",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Load configurations on component mount
  useEffect(() => {
    fetchConfigurations()
  }, [fetchConfigurations])

  // Handle configuration selection
  const handleConfigSelect = (configId: string) => {
    setSelectedConfigId(configId)
    fetchConfigDetail(configId)
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Configuration Selection</CardTitle>
          <CardDescription>
            Select a Docker configuration that you want to improve. You can provide feedback or report errors to enhance
            the configuration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="config-select">Select Configuration</Label>
              {isLoadingConfigs ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={selectedConfigId} onValueChange={handleConfigSelect}>
                  <SelectTrigger id="config-select">
                    <SelectValue placeholder="Select a configuration" />
                  </SelectTrigger>
                  <SelectContent>
                    {configurations.map((config) => (
                      <SelectItem key={config.id} value={config.id}>
                        {config.name} ({config.type === "dockerfile" ? "Dockerfile" : "docker-compose.yaml"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedConfigId && (
        <Card>
          <CardHeader>
            <CardTitle>Current Configuration</CardTitle>
            <CardDescription>
              This is the current content of the selected configuration. Review it before providing improvement
              feedback.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingConfig ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
              </div>
            ) : selectedConfig ? (
              <CodeDisplay
                code={
                  selectedConfig.content ||
                  selectedConfig.dockerfile_content ||
                  selectedConfig.docker_compose_content ||
                  ""
                }
                language={selectedConfig.type === "dockerfile" ? "dockerfile" : "yaml"}
              />
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No configuration content available.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedConfig && (
        <Card>
          <CardHeader>
            <CardTitle>Improvement Feedback</CardTitle>
            <CardDescription>
              Provide feedback or report errors to improve the configuration. Be specific about what you want to change.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Feedback Type</Label>
                <RadioGroup
                  value={feedbackType}
                  onValueChange={(value) => setFeedbackType(value as "instruction" | "error")}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="instruction" id="instruction" />
                    <Label htmlFor="instruction">Instruction</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="error" id="error" />
                    <Label htmlFor="error">Error Message</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback Content</Label>
                <Textarea
                  id="feedback"
                  placeholder={
                    feedbackType === "instruction"
                      ? "e.g., Add curl and wget to the image, or Use a multi-stage build to reduce image size"
                      : "e.g., Error: could not resolve host: archive.ubuntu.com"
                  }
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="min-h-[150px]"
                />
                <p className="text-xs text-muted-foreground">
                  {feedbackType === "instruction"
                    ? "Provide clear instructions on how to improve the configuration."
                    : "Paste the error message you encountered when using this configuration."}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={submitImprovement} disabled={isSubmitting || !feedbackText.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Submit Improvement
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {improvedContent && (
        <Card>
          <CardHeader>
            <CardTitle>Improved Configuration</CardTitle>
            <CardDescription>
              This is the improved configuration based on your feedback. You can copy it to your clipboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeDisplay
              code={improvedContent}
              language={selectedConfig?.type === "dockerfile" ? "dockerfile" : "yaml"}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                router.push(`/configurations/${selectedConfigId}`)
              }}
            >
              View in Configuration Details
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
