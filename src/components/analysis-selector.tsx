"use client"
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
import { useRouter } from "next/navigation"

export interface AnalysisOption {
  id: string
  display_name: string
  repo_url: string
  branch: string
}

interface AnalysisSelectorProps {
  label?: string
  analyses: AnalysisOption[]
  selectedAnalysisId: string | null
  onAnalysisChange: (analysisId: string) => void
  isLoading: boolean
  error?: string | null
  className?: string
}

export function AnalysisSelector({
  label = "Select Repository Analysis",
  analyses,
  selectedAnalysisId,
  onAnalysisChange,
  isLoading,
  error,
  className,
}: AnalysisSelectorProps) {
  const router = useRouter()

  const handleAnalyzeNew = () => {
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

  if (analyses.length === 0) {
    return (
      <div className={className}>
        <Label className="mb-2 block">{label}</Label>
        <div className="rounded-md border border-input bg-background p-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">No analyses found. Please analyze a repository first.</p>
          <Button size="sm" onClick={handleAnalyzeNew}>
            Analyze Repository
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <Label htmlFor="analysis-selector" className="mb-2 block">
        {label}
      </Label>
      <Select value={selectedAnalysisId || undefined} onValueChange={onAnalysisChange}>
        <SelectTrigger id="analysis-selector">
          <SelectValue placeholder="Select a repository analysis" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Repository Analyses</SelectLabel>
            {analyses.map((analysis) => (
              <SelectItem key={analysis.id} value={analysis.id}>
                {analysis.display_name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
