"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Container } from "@/components/ui/container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle, Wand2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { CodeDisplay } from "@/components/code-display"
import { ConfigurationSelector } from "@/components/configuration-selector"
import { useDockerConfigs } from "@/hooks/use-docker-configs"
import Cookies from "js-cookie"
import { ErrorResponse } from "@/types"

// API base URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

export default function ImproveConfigPage() {
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null)
  const [improvementPrompt, setImprovementPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [improvedConfig, setImprovedConfig] = useState<string | null>(null)
  const { toast } = useToast()

  // Use our custom hook to fetch Docker configurations
  const { configs, isLoading: configsLoading, error: configsError } = useDockerConfigs()

  const handleImprove = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const token = Cookies.get("token")
      if (!token) {
        window.location.href = "/login"
        return
      }

      if (!selectedConfigId) {
        throw new Error("Please select a configuration to improve")
      }

      const response = await fetch(`${API_URL}/docker/configs/${selectedConfigId}/improve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          improvement_prompt: improvementPrompt,
        }),
      })

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse
        throw new Error(errorData.detail || "Failed to improve configuration")
      }

      const data = await response.json()
      setImprovedConfig(data.content)
      toast({
        title: "Configuration Improved",
        description: "Your Docker configuration has been improved based on your prompt.",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to improve configuration. Please try again.")
      toast({
        variant: "destructive",
        title: "Improvement Failed",
        description: err instanceof Error ? err.message : "Failed to improve configuration",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8">
        <Container>
          <h1 className="text-3xl font-bold mb-6">Improve Docker Configuration</h1>
          <p className="text-lg mb-8">
            Select an existing Docker configuration and provide instructions on how you&apos;d like to improve it.
          </p>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Improve Configuration</CardTitle>
                <CardDescription>
                  Select a configuration and describe the improvements you&apos;d like to make.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleImprove} className="space-y-6">
                  {/* Use our ConfigurationSelector component */}
                  <ConfigurationSelector
                    label="Select Configuration to Improve"
                    configs={configs}
                    selectedConfigId={selectedConfigId}
                    onConfigChange={setSelectedConfigId}
                    isLoading={configsLoading}
                    error={configsError}
                    className="space-y-2"
                  />

                  <div className="space-y-2">
                    <Label htmlFor="improvement-prompt">Improvement Instructions</Label>
                    <Textarea
                      id="improvement-prompt"
                      placeholder="Describe how you'd like to improve this configuration. For example: 'Add health checks', 'Optimize for production', etc."
                      value={improvementPrompt}
                      onChange={(e) => setImprovementPrompt(e.target.value)}
                      disabled={isLoading || !selectedConfigId}
                      required
                      className="min-h-[120px]"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !selectedConfigId || !improvementPrompt.trim()}
                    className="w-full md:w-auto"
                  >
                    <Wand2 className="mr-2 h-4 w-4" />
                    {isLoading ? "Improving..." : "Improve Configuration"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {improvedConfig && (
              <Card>
                <CardHeader>
                  <CardTitle>Improved Configuration</CardTitle>
                  <CardDescription>
                    Review the improved Docker configuration. You can copy it to your clipboard.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CodeDisplay
                    code={improvedConfig}
                    language={
                      selectedConfigId && configs.find((c) => c.id === selectedConfigId)?.type === "compose"
                        ? "yaml"
                        : "dockerfile"
                    }
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  )
}
