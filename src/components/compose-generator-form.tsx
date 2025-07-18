"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Plus, Trash, Check } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { CodeDisplay } from "@/components/code-display"
import { AnalysisSelectorDropdown } from "@/components/analysis-selector-dropdown"
import Cookies from "js-cookie"
import type { BackendError, ErrorResponse } from "@/types"

// API base URL - would typically come from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

interface Service {
  name: string
  analysisId: string
  port?: string
}

export function ComposeGeneratorForm() {
  const [services, setServices] = useState<Service[]>([{ name: "", analysisId: "", port: "" }])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [composeYaml, setComposeYaml] = useState<string | null>(null)
  const [configId, setConfigId] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const [configName, setConfigName] = useState(`Docker Compose ${new Date().toLocaleDateString()}`)

  const addService = () => {
    setServices([...services, { name: "", analysisId: "", port: "" }])
  }

  const removeService = (index: number) => {
    const updatedServices = [...services]
    updatedServices.splice(index, 1)
    setServices(updatedServices)
  }

  const updateService = (index: number, field: keyof Service, value: string) => {
    const updatedServices = [...services]
    updatedServices[index] = { ...updatedServices[index], [field]: value }
    setServices(updatedServices)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const token = Cookies.get("token")
      if (!token) {
        router.push("/login")
        return
      }

      // Filter out any services with empty fields
      const validServices = services.filter((service) => service.name && service.analysisId)

      if (validServices.length === 0) {
        throw new Error("At least one service with name and analysis ID is required")
      }

      // Format services as an object with service names as keys
      const servicesObject: Record<string, { analysis_id: string; port?: number }> = {}

      validServices.forEach((service) => {
        servicesObject[service.name] = {
          analysis_id: service.analysisId,
          ...(service.port ? { port: Number.parseInt(service.port) } : {}),
        }
      })

      const response = await fetch(`${API_URL}/docker/generate/docker-compose`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          services: servicesObject,
          name: configName,
        }),
      })

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse
        throw new Error(errorData.detail || "Failed to generate docker-compose.yaml")
      }

      const data = await response.json()
      setComposeYaml(data.content)
      setConfigId(data.id)
      toast({
        title: "Compose File Generated",
        description: "docker-compose.yaml has been successfully generated.",
      })
    } catch (err) {
      setError(
        err instanceof Error
          ? (err as BackendError).detail || err.message
          : "Failed to generate docker-compose.yaml. Please try again.",
      )
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: err instanceof Error ? (err as BackendError).detail || err.message : "Failed to generate docker-compose.yaml",
      })
    } finally {
      setIsLoading(false)
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

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Compose File Generator</CardTitle>
          <CardDescription>
            Specify the services you want to include in your docker-compose.yaml file. Each service requires a name and
            the analysis ID from a previously analyzed repository.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 mb-4">
              <Label htmlFor="config-name">Configuration Name</Label>
              <Input
                id="config-name"
                placeholder="My Docker Compose Configuration"
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            {services.map((service, index) => (
              <div key={index} className="space-y-4 p-4 border rounded-md">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Service #{index + 1}</h3>
                  {services.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeService(index)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Remove service</span>
                    </Button>
                  )}
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor={`service-name-${index}`}>Service Name</Label>
                    <Input
                      id={`service-name-${index}`}
                      placeholder="e.g., api, frontend, db"
                      value={service.name}
                      onChange={(e) => updateService(index, "name", e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`analysis-id-${index}`}>Analysis ID</Label>
                    <AnalysisSelectorDropdown
                      value={service.analysisId}
                      onChange={(value) => updateService(index, "analysisId", value)}
                      placeholder="Select an analysis"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`port-${index}`}>Port (Optional)</Label>
                    <Input
                      id={`port-${index}`}
                      placeholder="e.g., 3000"
                      value={service.port}
                      onChange={(e) => updateService(index, "port", e.target.value)}
                      disabled={isLoading}
                      type="number"
                    />
                  </div>
                </div>
              </div>
            ))}
            <div className="flex flex-col gap-4">
              <Button type="button" variant="outline" onClick={addService} disabled={isLoading}>
                <Plus className="mr-2 h-4 w-4" />
                Add Another Service
              </Button>
              <Button type="submit" disabled={isLoading || services.some((s) => !s.name || !s.analysisId)}>
                {isLoading ? "Generating..." : "Generate docker-compose.yaml"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {composeYaml && (
        <Card>
          <CardHeader>
            <CardTitle>Generated docker-compose.yaml</CardTitle>
            <CardDescription>
              Review the generated docker-compose.yaml file. You can copy it to your clipboard or mark it as successful
              if it meets your needs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeDisplay code={composeYaml} language="yaml" />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" onClick={handleMarkAsSuccessful} disabled={!configId}>
              <Check className="mr-2 h-4 w-4" />
              Mark as Successful
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
