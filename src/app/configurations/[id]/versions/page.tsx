"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { use } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ArrowLeft, Clock, RotateCcw, SplitSquareVertical } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { CodeDisplay } from "@/components/code-display"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VersionRevertFlow } from "@/components/version-revert-flow"
import Cookies from "js-cookie"

// API base URL - would typically come from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

interface ConfigVersion {
  version_number: number
  content_type: "dockerfile" | "compose"
  feedback_used?: string
  created_at: string
  content?: string
}

interface Configuration {
  id: string
  name: string
  type: "dockerfile" | "compose"
}

export default function ConfigurationVersionsPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const { id: configId } = use(params)

  const [versions, setVersions] = useState<ConfigVersion[]>([])
  const [configuration, setConfiguration] = useState<Configuration | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingConfig, setIsLoadingConfig] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<ConfigVersion | null>(null)
  const [isRevertDialogOpen, setIsRevertDialogOpen] = useState(false)
  const [isReverting, setIsReverting] = useState(false)
  const [isCompareDialogOpen, setIsCompareDialogOpen] = useState(false)
  const [compareVersionNumber, setCompareVersionNumber] = useState<string>("")
  const [compareVersion, setCompareVersion] = useState<ConfigVersion | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchConfiguration()
    fetchVersions()
  }, [configId])

  const fetchConfiguration = async () => {
    setIsLoadingConfig(true)
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
      setConfiguration({
        id: data.id,
        name: data.name,
        type: data.type,
      })
    } catch (err) {
      console.error("Error fetching configuration:", err)
    } finally {
      setIsLoadingConfig(false)
    }
  }

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
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch versions")
      }

      const data = await response.json()
      setVersions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch versions. Please try again.")
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch versions",
      })
    } finally {
      setIsLoading(false)
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

  const handleViewVersion = async (version: ConfigVersion) => {
    try {
      const versionWithContent = await fetchVersionContent(version.version_number)
      if (versionWithContent) {
        setSelectedVersion({
          ...version,
          content: versionWithContent.content,
        })
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch version content",
      })
    }
  }

  const handleCompareVersions = async () => {
    if (!selectedVersion || !compareVersionNumber) return

    try {
      const versionWithContent = await fetchVersionContent(Number.parseInt(compareVersionNumber))
      if (versionWithContent) {
        setCompareVersion({
          ...versions.find((v) => v.version_number === Number.parseInt(compareVersionNumber))!,
          content: versionWithContent.content,
        })
        setIsCompareDialogOpen(true)
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch version content for comparison",
      })
    }
  }

  const handleRevertToVersion = async () => {
    if (!selectedVersion) return

    setIsReverting(true)
    try {
      const token = Cookies.get("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch(
        `${API_URL}/docker/configs/${configId}/versions/${selectedVersion.version_number}/revert`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to revert to version")
      }

      toast({
        title: "Version Reverted",
        description: `Successfully reverted to version ${selectedVersion.version_number}`,
      })

      // Refresh versions list
      await fetchVersions()
      setIsRevertDialogOpen(false)
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Revert Failed",
        description: err instanceof Error ? err.message : "Failed to revert to version",
      })
    } finally {
      setIsReverting(false)
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
    // Refresh versions list
    await fetchVersions()

    // Clear selected version
    setSelectedVersion(null)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8">
        <Container>
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.push(`/configurations/${configId}`)} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Configuration
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isLoadingConfig ? (
                    "Version History"
                  ) : (
                    <>
                      Version History for {configuration?.name}{" "}
                      <Badge variant="outline" className="ml-2">
                        {configuration?.type === "dockerfile" ? "Dockerfile" : "docker-compose.yaml"}
                      </Badge>
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  View and manage the version history of this configuration. You can view previous versions and revert
                  to them if needed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                ) : versions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No versions found for this configuration.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Version</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Feedback Used</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {versions.map((version, index) => (
                        <TableRow
                          key={version.version_number}
                          className={selectedVersion?.version_number === version.version_number ? "bg-muted/50" : ""}
                        >
                          <TableCell className="font-medium">
                            {version.version_number}
                            {index === 0 && (
                              <Badge variant="secondary" className="ml-2">
                                Current
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {version.content_type === "dockerfile" ? "Dockerfile" : "docker-compose.yaml"}
                            </Badge>
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
                                onClick={() => handleViewVersion(version)}
                                className="h-8 px-2"
                              >
                                View
                              </Button>
                              {version.version_number !== versions[0].version_number && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedVersion(version)
                                    setIsRevertDialogOpen(true)
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
                )}
              </CardContent>
            </Card>

            {selectedVersion && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Version {selectedVersion.version_number}</CardTitle>
                      <CardDescription>Created on {formatDate(selectedVersion.created_at)}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {versions.length > 1 && (
                        <div className="flex items-center gap-2">
                          <Select value={compareVersionNumber} onValueChange={setCompareVersionNumber}>
                            <SelectTrigger className="w-[220px]">
                              <SelectValue placeholder="Compare with version..." />
                            </SelectTrigger>
                            <SelectContent>
                              {versions
                                .filter((v) => v.version_number !== selectedVersion.version_number)
                                .map((version) => (
                                  <SelectItem key={version.version_number} value={version.version_number.toString()}>
                                    Version {version.version_number} ({formatDate(version.created_at)})
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <Button variant="outline" onClick={handleCompareVersions} disabled={!compareVersionNumber}>
                            <SplitSquareVertical className="mr-2 h-4 w-4" />
                            Compare
                          </Button>
                        </div>
                      )}
                      {selectedVersion.version_number !== versions[0]?.version_number && (
                        <Button variant="outline" onClick={() => setIsRevertDialogOpen(true)}>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Revert to This Version
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    {selectedVersion.feedback_used && (
                      <div className="mb-4 p-3 bg-muted rounded-md">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Feedback Used:</span>
                        </div>
                        <p className="text-sm">{selectedVersion.feedback_used}</p>
                      </div>
                    )}
                  </div>
                  <CodeDisplay
                    code={selectedVersion.content || ""}
                    language={selectedVersion.content_type === "dockerfile" ? "dockerfile" : "yaml"}
                  />
                </CardContent>
              </Card>
            )}

            <VersionRevertFlow
              configId={configId}
              configName={configuration?.name || "Configuration"}
              configType={(configuration?.type as "dockerfile" | "compose") || "dockerfile"}
              onRevertSuccess={handleRevertSuccess}
            />
          </div>
        </Container>
      </main>
      <Footer />

      {/* Revert Confirmation Dialog */}
      <Dialog open={isRevertDialogOpen} onOpenChange={setIsRevertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Revert</DialogTitle>
            <DialogDescription>
              Are you sure you want to revert to version {selectedVersion?.version_number}? This will create a new
              version with the content from the selected version.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRevertDialogOpen(false)} disabled={isReverting}>
              Cancel
            </Button>
            <Button onClick={handleRevertToVersion} disabled={isReverting}>
              {isReverting ? "Reverting..." : "Revert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version Comparison Dialog */}
      <div className="max-w-4xl">
        <Dialog open={isCompareDialogOpen} onOpenChange={setIsCompareDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Version Comparison</DialogTitle>
              <DialogDescription>
                Comparing Version {selectedVersion?.version_number} with Version {compareVersion?.version_number}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <h3 className="text-sm font-medium mb-2">
                  Version {selectedVersion?.version_number} ({formatDate(selectedVersion?.created_at || "")})
                </h3>
                <div className="border rounded-md">
                  <CodeDisplay
                    code={selectedVersion?.content || ""}
                    language={selectedVersion?.content_type === "dockerfile" ? "dockerfile" : "yaml"}
                  />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-2">
                  Version {compareVersion?.version_number} ({formatDate(compareVersion?.created_at || "")})
                </h3>
                <div className="border rounded-md">
                  <CodeDisplay
                    code={compareVersion?.content || ""}
                    language={compareVersion?.content_type === "dockerfile" ? "dockerfile" : "yaml"}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCompareDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
