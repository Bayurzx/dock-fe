"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { use } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ArrowLeft, Check, Pencil, RotateCcw, Save, Trash, Sparkles } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { CodeDisplay } from "@/components/code-display"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { VersionRevertFlow } from "@/components/version-revert-flow"
import Cookies from "js-cookie"
import type { Configuration } from "@/types"

// API base URL - would typically come from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

interface ConfigVersion {
  version_number: number
  content_type: "dockerfile" | "compose"
  feedback_used?: string
  created_at: string
  content?: string
}

export default function ConfigurationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const { id: configId } = use(params)

  const [configuration, setConfiguration] = useState<Configuration | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isImprovementDialogOpen, setIsImprovementDialogOpen] = useState(false)
  const [improvementFeedback, setImprovementFeedback] = useState("")
  const [isImproving, setIsImproving] = useState(false)
  const [isMarkSuccessfulDialogOpen, setIsMarkSuccessfulDialogOpen] = useState(false)
  const [markSuccessfulOption, setMarkSuccessfulOption] = useState<"current" | "revert">("current")
  const [configVersions, setConfigVersions] = useState<ConfigVersion[]>([])
  const [isLoadingVersions, setIsLoadingVersions] = useState(false)
  const [selectedVersionNumber, setSelectedVersionNumber] = useState<string>("")
  const [isReverting, setIsReverting] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<ConfigVersion | null>(null)
  const [isVersionContentDialogOpen, setIsVersionContentDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchConfiguration()
  }, [configId])

  useEffect(() => {
    if (activeTab === "versions") {
      fetchVersions()
    }
  }, [activeTab, configId])

  const fetchConfiguration = async () => {
    setIsLoading(true)
    setError(null)

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

  const fetchVersions = async () => {
    setIsLoadingVersions(true)
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
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch configuration versions")
      }

      const data = await response.json()
      setConfigVersions(data)

      // If there are versions, select the latest one by default (excluding the current version)
      if (data.length > 1) {
        setSelectedVersionNumber(data[1].version_number.toString())
      }

      return data
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch configuration versions",
      })
      return []
    } finally {
      setIsLoadingVersions(false)
    }
  }

  const fetchVersionContent = async (versionNumber: number) => {
    try {
      const token = Cookies.get("token")
      if (!token) {
        router.push("/login")
        return null
      }

      const response = await fetch(`${API_URL}/docker/configs/${configId}/versions/${versionNumber}/content`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch version content")
      }

      const data = await response.json()
      return data
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch version content",
      })
      return null
    }
  }

  const handleViewVersionContent = async (version: ConfigVersion) => {
    const versionWithContent = await fetchVersionContent(version.version_number)
    if (versionWithContent) {
      setSelectedVersion({
        ...version,
        content: versionWithContent.content,
      })
      setIsVersionContentDialogOpen(true)
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

    // Check if there are previous versions
    const versions = await fetchVersions()

    if (versions.length > 1) {
      // If there are previous versions, show the dialog
      setIsMarkSuccessfulDialogOpen(true)
    } else {
      // If there are no previous versions, mark the current version as successful directly
      markCurrentAsSuccessful()
    }
  }

  const markCurrentAsSuccessful = async () => {
    if (!configuration) return

    try {
      const token = Cookies.get("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`${API_URL}/docker/configs/${configuration.id}/mark_successful`, {
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
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to submit feedback")
      }

      setConfiguration({ ...configuration, is_verified_good: true })
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
    } finally {
      setIsMarkSuccessfulDialogOpen(false)
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
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to revert to version")
      }

      toast({
        title: "Version Reverted",
        description: `Successfully reverted to version ${selectedVersionNumber}`,
      })

      // Refresh configuration
      await fetchConfiguration()
      await fetchVersions()
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Revert Failed",
        description: err instanceof Error ? err.message : "Failed to revert to version",
      })
    } finally {
      setIsReverting(false)
      setIsMarkSuccessfulDialogOpen(false)
    }
  }

  const handleMarkSuccessfulSubmit = async () => {
    if (markSuccessfulOption === "current") {
      await markCurrentAsSuccessful()
    } else if (markSuccessfulOption === "revert" && selectedVersionNumber) {
      await handleRevertToVersion()
    }
  }

  const handleImproveConfig = async () => {
    if (!configuration || !improvementFeedback.trim()) return

    setIsImproving(true)
    try {
      const token = Cookies.get("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`${API_URL}/docker/configs/${configuration.id}/improve`, {
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
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to improve configuration")
      }

      const data = await response.json()
      setConfiguration({
        ...configuration,
        content: data.content,
        dockerfile_content: data.dockerfile_content,
        docker_compose_content: data.docker_compose_content,
      })
      setImprovementFeedback("")
      setIsImprovementDialogOpen(false)

      // Refresh versions after improvement
      fetchVersions()

      toast({
        title: "Configuration Improved",
        description: "Your feedback has been applied to improve the configuration.",
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Improvement Failed",
        description: err instanceof Error ? err.message : "Failed to improve configuration",
      })
    } finally {
      setIsImproving(false)
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

  const handleRevertSuccess = async () => {
    // Refresh configuration and versions
    await fetchConfiguration()
    await fetchVersions()

    // Switch to details tab
    setActiveTab("details")
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
                    {!configuration.is_verified_good && (
                      <Button variant="outline" onClick={handleMarkAsSuccessful}>
                        <Check className="mr-2 h-4 w-4" />
                        Mark as Successful
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/configurations/improve?config=${configuration.id}`)}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Improve
                    </Button>
                    <Button variant="outline" onClick={() => setIsImprovementDialogOpen(true)}>
                      Improve Configuration
                    </Button>
                    <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="versions">Version History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-6 pt-4">
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
                            {configuration.is_verified_good ? (
                              <Badge variant="success">Successful</Badge>
                            ) : (
                              <Badge variant="outline">Pending feedback</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium block mb-2">Configuration Content</Label>
                        <CodeDisplay
                          code={
                            configuration.content ||
                            configuration.docker_compose_content ||
                            configuration.dockerfile_content ||
                            ""
                          }
                          language={configuration.type === "dockerfile" ? "dockerfile" : "yaml"}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="versions" className="space-y-6 pt-4">
                      {isLoadingVersions ? (
                        <div className="flex justify-center py-12">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        </div>
                      ) : configVersions.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No version history found for this configuration.</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Version</TableHead>
                                  <TableHead>Created At</TableHead>
                                  <TableHead>Feedback Used</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {configVersions.map((version, index) => (
                                  <TableRow key={version.version_number}>
                                    <TableCell className="font-medium">
                                      {version.version_number}
                                      {index === 0 && (
                                        <Badge variant="secondary" className="ml-2">
                                          Current
                                        </Badge>
                                      )}
                                    </TableCell>
                                    <TableCell>{formatDate(version.created_at)}</TableCell>
                                    <TableCell>
                                      {version.feedback_used ? (
                                        <span className="text-sm">{version.feedback_used}</span>
                                      ) : (
                                        <span className="text-sm text-muted-foreground">None</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex justify-end gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleViewVersionContent(version)}
                                          className="h-8 px-2"
                                        >
                                          View
                                        </Button>
                                        {index > 0 && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              setSelectedVersionNumber(version.version_number.toString())
                                              handleRevertToVersion()
                                            }}
                                            className="h-8 px-2"
                                          >
                                            <RotateCcw className="mr-1 h-3 w-3" />
                                            Revert
                                          </Button>
                                        )}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>

                          <VersionRevertFlow
                            configId={configId}
                            configName={configuration.name}
                            configType={configuration.type}
                            onRevertSuccess={handleRevertSuccess}
                          />
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
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

      {/* Improvement Dialog */}
      <Dialog open={isImprovementDialogOpen} onOpenChange={setIsImprovementDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Improve Configuration</DialogTitle>
            <DialogDescription>
              Provide feedback or instructions to improve this configuration. Be specific about what you want to change.
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

      {/* Mark as Successful Dialog with Version Options */}
      <Dialog open={isMarkSuccessfulDialogOpen} onOpenChange={setIsMarkSuccessfulDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Mark Configuration as Successful</DialogTitle>
            <DialogDescription>
              This configuration has previous versions. Would you like to mark the current version as successful or
              revert to a previous version?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup
              value={markSuccessfulOption}
              onValueChange={(value) => setMarkSuccessfulOption(value as "current" | "revert")}
            >
              <div className="flex items-center space-x-2 mb-4">
                <RadioGroupItem value="current" id="current" />
                <Label htmlFor="current">Mark current version as successful</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="revert" id="revert" />
                <Label htmlFor="revert">Revert to a previous version</Label>
              </div>
            </RadioGroup>

            {markSuccessfulOption === "revert" && (
              <div className="mt-4 space-y-2">
                <Label htmlFor="version-select">Select Version</Label>
                {isLoadingVersions ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    value={selectedVersionNumber}
                    onValueChange={setSelectedVersionNumber}
                    disabled={configVersions.length <= 1}
                  >
                    <SelectTrigger id="version-select">
                      <SelectValue placeholder="Select a version" />
                    </SelectTrigger>
                    <SelectContent>
                      {configVersions
                        .filter((v, i) => i > 0) // Skip the current version (index 0)
                        .map((version) => (
                          <SelectItem key={version.version_number} value={version.version_number.toString()}>
                            Version {version.version_number} - {formatDate(version.created_at)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMarkSuccessfulDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleMarkSuccessfulSubmit}
              disabled={isReverting || (markSuccessfulOption === "revert" && !selectedVersionNumber)}
            >
              {isReverting ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version Content Dialog */}
      <Dialog open={isVersionContentDialogOpen} onOpenChange={setIsVersionContentDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[500px] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              Version {selectedVersion?.version_number} - {selectedVersion && formatDate(selectedVersion.created_at)}
            </DialogTitle>
            <DialogDescription>
              {selectedVersion?.feedback_used
                ? `Feedback used: ${selectedVersion.feedback_used}`
                : "No feedback was used for this version"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedVersion?.content ? (
              <CodeDisplay
                code={selectedVersion.content}
                language={selectedVersion.content_type === "dockerfile" ? "dockerfile" : "yaml"}
              />
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No content available for this version.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            {selectedVersion && selectedVersion.version_number !== configVersions[0]?.version_number && (
              <Button
                onClick={() => {
                  setSelectedVersionNumber(selectedVersion.version_number.toString())
                  setIsVersionContentDialogOpen(false)
                  handleRevertToVersion()
                }}
                className="mr-auto"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Revert to This Version
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsVersionContentDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
