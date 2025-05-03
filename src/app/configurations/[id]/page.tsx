"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ArrowLeft, Check, Pencil, Save, Trash } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { CodeDisplay } from "@/components/code-display"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Cookies from "js-cookie"

// API base URL - would typically come from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

interface Configuration {
  id: string
  name: string
  type: "dockerfile" | "compose"
  created_at: string
  is_successful?: boolean
  content: string
  docker_compose_content?: string
  dockerfile_content?: string
}

export default function ConfigurationDetailPage({ params }: { params: { id: string } }) {
  const [configuration, setConfiguration] = useState<Configuration | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchConfiguration()
  }, [params.id])

  const fetchConfiguration = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const token = Cookies.get("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`${API_URL}/docker/configs/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch configuration")
      }

      const data = await response.json()
      setConfiguration(data)
      setNewName(data.name)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch configuration. Please try again.")
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch configuration",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveName = async () => {
    if (!configuration) return

    try {
      const token = Cookies.get("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`${API_URL}/docker/configs/${configuration.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newName,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update configuration name")
      }

      setConfiguration({ ...configuration, name: newName })
      setIsEditing(false)
      toast({
        title: "Configuration Updated",
        description: "The configuration name has been successfully updated.",
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err instanceof Error ? err.message : "Failed to update configuration name",
      })
    }
  }

  const handleMarkAsSuccessful = async () => {
    if (!configuration) return

    try {
      const token = Cookies.get("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`${API_URL}/docker/configs/${configuration.id}/feedback`, {
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

      setConfiguration({ ...configuration, is_successful: true })
      toast({
        title: "Feedback Submitted",
        description:
          "Thank you for marking this configuration as successful! This feedback helps improve our system for future generations.",
        duration: 5000,
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Feedback Failed",
        description: err instanceof Error ? err.message : "Failed to submit feedback",
      })
    }
  }

  const confirmDelete = async () => {
    if (!configuration) return

    try {
      const token = Cookies.get("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`${API_URL}/docker/configs/${configuration.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete configuration")
      }

      toast({
        title: "Configuration Deleted",
        description: "The configuration has been successfully deleted.",
      })
      router.push("/configurations")
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: err instanceof Error ? err.message : "Failed to delete configuration",
      })
    } finally {
      setIsDeleteDialogOpen(false)
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

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8">
        <Container>
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.push("/configurations")} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Configurations
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : configuration ? (
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="max-w-md"
                          autoFocus
                        />
                        <Button size="sm" onClick={handleSaveName} disabled={!newName.trim()}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CardTitle>{configuration.name}</CardTitle>
                        <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <CardDescription>
                      {configuration.type === "dockerfile" ? "Dockerfile" : "docker-compose.yaml"} configuration
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {!configuration.is_successful && (
                      <Button variant="outline" onClick={handleMarkAsSuccessful}>
                        <Check className="mr-2 h-4 w-4" />
                        Mark as Successful
                      </Button>
                    )}
                    <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Type</Label>
                      <div className="mt-1">
                        <Badge variant="outline">
                          {configuration.type === "dockerfile" ? "Dockerfile" : "docker-compose.yaml"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Created</Label>
                      <div className="mt-1">{formatDate(configuration.created_at)}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <div className="mt-1">
                        {configuration.is_successful ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Successful</Badge>
                        ) : (
                          <Badge variant="outline">Pending feedback</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium block mb-2">Configuration Content</Label>
                    <CodeDisplay
                      code={configuration.content || configuration.docker_compose_content || configuration.dockerfile_content || ""}
                      language={configuration.type === "dockerfile" ? "dockerfile" : "yaml"}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Configuration not found.</p>
              <Button className="mt-4" onClick={() => router.push("/configurations")}>
                Back to Configurations
              </Button>
            </div>
          )}
        </Container>
      </main>
      <Footer />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this configuration? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
