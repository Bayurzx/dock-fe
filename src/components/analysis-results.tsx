// src\components\analysis-results.tsx

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Check, FileCode, FileText } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { CodeDisplay } from "@/components/code-display"
import { Skeleton } from "@/components/ui/skeleton"
import Cookies from "js-cookie"
import { AnalysisResultsProps } from "@/types"

// API base URL - would typically come from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"


export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dockerfile, setDockerfile] = useState<string | null>(null)
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

      const response = await fetch(`${API_URL}/configs/dockerfile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          analysis_id: analysis.analysis_id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to generate Dockerfile")
      }

      const data = await response.json()
      setDockerfile(data.content)
      toast({
        title: "Dockerfile Generated",
        description: "Dockerfile has been successfully generated.",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate Dockerfile. Please try again.")
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: err instanceof Error ? err.message : "Failed to generate Dockerfile",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleMarkAsSuccessful = async () => {
    try {
      const token = Cookies.get("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`${API_URL}/configs/${analysis.analysis_id}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          is_successful: true,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to submit feedback")
      }

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! This helps improve our system.",
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Feedback Failed",
        description: err instanceof Error ? err.message : "Failed to submit feedback",
      })
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

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium">Framework</h3>
              <p className="mt-1">{analysis.framework}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Base Image</h3>
              <p className="mt-1">{analysis.base_image}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium">Dependencies</h3>
            <div className="mt-1 flex flex-wrap gap-2">
              {analysis.dependencies.map((dep, index) => (
                <Badge key={index} variant="secondary">
                  {dep}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium">Ports</h3>
            <div className="mt-1 flex flex-wrap gap-2">
              {analysis.ports.map((port, index) => (
                <Badge key={index} variant="outline">
                  {port}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium">Run Command</h3>
            <p className="mt-1 font-mono text-sm bg-muted p-2 rounded overflow-x-auto">{analysis.run_command}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium">Summary</h3>
            <p className="mt-1">{analysis.summary}</p>
          </div>
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
              Review the generated Dockerfile for your repository. You can copy it to your clipboard or mark it as
              successful if it meets your needs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeDisplay code={dockerfile} language="dockerfile" />
          </CardContent>
          <CardFooter className="flex justify-end">
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
