import { Suspense } from "react"
import { Container } from "@/components/ui/container"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { OAuthRedirectContent } from "@/components/oauth-redirect-content"

export default function OAuthCallbackPage() {
  return (
    <Container className="max-w-md py-12">
      <Suspense fallback={<RedirectSkeleton />}>
        <OAuthRedirectContent />
      </Suspense>
    </Container>
  )
}

function RedirectSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-4">
          <Skeleton className="h-12 w-12 rounded-full mb-4" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  )
}
