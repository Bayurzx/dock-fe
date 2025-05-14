"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle, Check, Eye, History, Pencil, Trash, Sparkles } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Cookies from "js-cookie"
import type { Configuration, BackendError, ErrorResponse } from "@/types"

// API base URL - would typically come from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

interface ConfigVersion {
  version_number: number
  content_type: "dockerfile" | "compose"
  feedback_used?: string
  created_at: string
}

export function ConfigurationsList() {
  const [configurations, setConfigurations] = useState<Configuration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedConfig, setSelectedConfig] = useState<Configuration | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isMarkSuccessfulDialogOpen, setIsMarkSuccessfulDialogOpen] = useState(false)
  const [markSuccessfulOption, setMarkSuccessfulOption] = useState<"current" | "revert">("current")
  const [configVersions, setConfigVersions] = useState<ConfigVersion[]>([])
  const [isLoadingVersions, setIsLoadingVersions] = useState(false)
  const [selectedVersionNumber, setSelectedVersionNumber] = useState<string>("")
  const [isReverting, setIsReverting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Add a new state variable for the configuration being edited:
  const [editingConfig, setEditingConfig] = useState<Configuration | null>(null)
  const [newConfigName, setNewConfigName] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    fetchConfigurations()
  }, [])

  const fetchConfigurations = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const token = Cookies.get("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`${API_URL}/docker/configs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse
        throw new Error(errorData.detail || "Failed to fetch configurations")
      }

      const data = await response.json()
      setConfigurations(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? (err as BackendError).detail || err.message
          : "Failed to fetch configurations. Please try again.",
      )
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? (err as BackendError).detail || err.message : "Failed to fetch configurations",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchConfigVersions = async (configId: string) => {
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
        const errorData = (await response.json()) as ErrorResponse
        throw new Error(errorData.detail || "Failed to fetch configuration versions")
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
        description: err instanceof Error ? (err as BackendError).detail || err.message : "Failed to fetch configuration versions",
      })
      return []
    } finally {
      setIsLoadingVersions(false)
    }
  }

  const handleViewConfig = (config: Configuration) => {
    router.push(`/configurations/${config.id}`)
  }

  const handleViewVersions = (config: Configuration) => {
    router.push(`/configurations/${config.id}/versions`)
  }

  const handleDeleteConfig = (config: Configuration) => {
    setSelectedConfig(config)
    setIsDeleteDialogOpen(true)
  }

  // Add a function to handle editing a configuration name:
  const handleEditConfig = (config: Configuration) => {
    setEditingConfig(config)
    setNewConfigName(config.name)
    setIsEditDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedConfig) return

    try {
      const token = Cookies.get("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`${API_URL}/docker/configs/${selectedConfig.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse
        throw new Error(errorData.detail || "Failed to delete configuration")
      }

      setConfigurations(configurations.filter((config) => config.id !== selectedConfig.id))
      toast({
        title: "Configuration Deleted",
        description: "The configuration has been successfully deleted.",
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: err instanceof Error ? (err as BackendError).detail || err.message : "Failed to delete configuration",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setSelectedConfig(null)
    }
  }

  const handleMarkAsSuccessful = async (config: Configuration) => {
    setSelectedConfig(config)

    // Check if there are previous versions
    const versions = await fetchConfigVersions(config.id)

    if (versions.length > 1) {
      // If there are previous versions, show the dialog
      setIsMarkSuccessfulDialogOpen(true)
    } else {
      // If there are no previous versions, mark the current version as successful directly
      markCurrentAsSuccessful(config.id)
    }
  }

  const markCurrentAsSuccessful = async (configId: string) => {
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

      // Update the local state
      setConfigurations(configurations.map((c) => (c.id === configId ? { ...c, is_verified_good: true } : c)))

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
        description: err instanceof Error ? (err as BackendError).detail || err.message : "Failed to submit feedback",
      })
    } finally {
      setIsMarkSuccessfulDialogOpen(false)
      setSelectedConfig(null)
    }
  }

  const handleRevertToVersion = async () => {
    if (!selectedConfig || !selectedVersionNumber) return

    setIsReverting(true)
    try {
      const token = Cookies.get("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(
        `${API_URL}/docker/configs/${selectedConfig.id}/versions/${selectedVersionNumber}/revert`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse
        throw new Error(errorData.detail || "Failed to revert to version")
      }

      toast({
        title: "Version Reverted",
        description: `Successfully reverted to version ${selectedVersionNumber}`,
      })

      // Refresh configurations list
      await fetchConfigurations()
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Revert Failed",
        description: err instanceof Error ? (err as BackendError).detail || err.message : "Failed to revert to version",
      })
    } finally {
      setIsReverting(false)
      setIsMarkSuccessfulDialogOpen(false)
      setSelectedConfig(null)
    }
  }

  const handleMarkSuccessfulSubmit = async () => {
    if (!selectedConfig) return

    if (markSuccessfulOption === "current") {
      await markCurrentAsSuccessful(selectedConfig.id)
    } else if (markSuccessfulOption === "revert" && selectedVersionNumber) {
      await handleRevertToVersion()
    }
  }

  // Add a function to save the edited configuration name:
  const saveConfigName = async () => {
    if (!editingConfig) return

    try {
      const token = Cookies.get("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(`${API_URL}/docker/configs/${editingConfig.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newConfigName,
        }),
      })

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse
        throw new Error(errorData.detail || "Failed to update configuration name")
      }

      // Update the local state
      setConfigurations(configurations.map((c) => (c.id === editingConfig.id ? { ...c, name: newConfigName } : c)))

      toast({
        title: "Configuration Updated",
        description: "The configuration name has been successfully updated.",
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err instanceof Error ? (err as BackendError).detail || err.message : "Failed to update configuration name",
      })
    } finally {
      setIsEditDialogOpen(false)
      setEditingConfig(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Render skeleton loaders when loading
  const renderSkeletonLoaders = () => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          <TableCell>
            <Skeleton className="h-5 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-28" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-24" />
          </TableCell>
          <TableCell className="text-right">
            <div className="flex justify-end gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </TableCell>
        </TableRow>
      ))
  }

  // Render for mobile view
  const renderMobileCards = () => {
    return configurations.map((config) => (
      <Card key={config.id} className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{config.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{config.type === "dockerfile" ? "Dockerfile" : "docker-compose.yaml"}</Badge>
            {config.is_verified_good ? (
              <Badge variant="success">Successful</Badge>
            ) : (
              <Badge variant="outline">Pending feedback</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground">Created: {formatDate(config.created_at)}</p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 pt-0">
          <Button variant="ghost" size="sm" onClick={() => handleViewConfig(config)} className="h-8 w-8 p-0">
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleViewVersions(config)} className="h-8 w-8 p-0">
            <History className="h-4 w-4" />
            <span className="sr-only">Versions</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleEditConfig(config)} className="h-8 w-8 p-0">
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          {!config.is_verified_good && (
            <Button variant="ghost" size="sm" onClick={() => handleMarkAsSuccessful(config)} className="h-8 w-8 p-0">
              <Check className="h-4 w-4" />
              <span className="sr-only">Mark as successful</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteConfig(config)}
            className="h-8 w-8 p-0 text-destructive"
          >
            <Trash className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </CardFooter>
      </Card>
    ))
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Configurations</CardTitle>
          <CardDescription>
            View and manage your saved Dockerfile and docker-compose.yaml configurations.
          </CardDescription>
          <div className="flex justify-end mt-2">
            <Button onClick={() => router.push("/configurations/improve")} className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Improve Configurations
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>{renderSkeletonLoaders()}</TableBody>
              </Table>
            </div>
          ) : configurations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No configurations found. Analyze a repository to get started.</p>
              <Button className="mt-4" onClick={() => router.push("/repositories")}>
                Analyze Repository
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop view */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {configurations.map((config) => (
                      <TableRow key={config.id}>
                        <TableCell className="font-medium">{config.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {config.type === "dockerfile" ? "Dockerfile" : "docker-compose.yaml"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(config.created_at)}</TableCell>
                        <TableCell>
                          {config.is_verified_good ? (
                            <Badge variant="success">Successful</Badge>
                          ) : (
                            <Badge variant="outline">Pending feedback</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewConfig(config)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewVersions(config)}
                              className="h-8 w-8 p-0"
                            >
                              <History className="h-4 w-4" />
                              <span className="sr-only">Versions</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditConfig(config)}
                              className="h-8 w-8 p-0"
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            {!config.is_verified_good && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsSuccessful(config)}
                                className="h-8 w-8 p-0"
                              >
                                <Check className="h-4 w-4" />
                                <span className="sr-only">Mark as successful</span>
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteConfig(config)}
                              className="h-8 w-8 p-0 text-destructive"
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile view */}
              <div className="md:hidden">{renderMobileCards()}</div>
            </>
          )}
        </CardContent>
      </Card>

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

      {/* Edit Configuration Name Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Configuration Name</DialogTitle>
            <DialogDescription>Update the name of this configuration.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="config-name">Configuration Name</Label>
              <Input id="config-name" value={newConfigName} onChange={(e) => setNewConfigName(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveConfigName} disabled={!newConfigName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
