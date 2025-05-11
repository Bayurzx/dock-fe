"use client"

import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export interface ConfigOption {
  id: string
  name: string
  type?: "dockerfile" | "compose"
}

interface ConfigurationSelectorProps {
  label?: string
  configs: ConfigOption[]
  selectedConfigId: string | null
  onConfigChange: (configId: string) => void
  isLoading: boolean
  error?: string | null
  className?: string
  configType?: "dockerfile" | "compose" | "all"
}

export function ConfigurationSelector({
  label = "Select Configuration",
  configs,
  selectedConfigId,
  onConfigChange,
  isLoading,
  error,
  className,
  configType = "all",
}: ConfigurationSelectorProps) {
  const router = useRouter()

  // Filter configs by type if specified
  const filteredConfigs =
    configType !== "all" ? configs.filter((config) => !config.type || config.type === configType) : configs

  const handleCreateNew = () => {
    router.push("/repositories")
  }

  if (error) {
    return (
      <div className={className}>
        <Label className="mb-2 block">{label}</Label>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={className}>
        <Label className="mb-2 block">{label}</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (filteredConfigs.length === 0) {
    return (
      <div className={className}>
        <Label className="mb-2 block">{label}</Label>
        <div className="rounded-md border border-input bg-background p-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">No saved configurations found.</p>
          <Button size="sm" onClick={handleCreateNew}>
            Create Configuration
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <Label htmlFor="config-selector" className="mb-2 block">
        {label}
      </Label>
      <Select value={selectedConfigId || undefined} onValueChange={onConfigChange}>
        <SelectTrigger id="config-selector">
          <SelectValue placeholder="Select a configuration" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Saved Configurations</SelectLabel>
            {filteredConfigs.map((config) => (
              <SelectItem key={config.id} value={config.id}>
                {config.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
