"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function OAuthRedirectContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // This is a legacy page - redirect to the new callback page
    // with all the query parameters
    const queryString = searchParams?.toString() || ""
    router.replace(`/login/callback${queryString ? `?${queryString}` : ""}`)
  }, [router, searchParams])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Redirecting...</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <p className="mt-2 text-center">Redirecting to authentication handler...</p>
        </div>
      </CardContent>
    </Card>
  )
}
