import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Container } from "@/components/ui/container"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

import { OAuthCallbackContent } from "@/components/oauth-callback-content"

export default function OAuthCallbackPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12">
        <Container className="max-w-md">
          <Suspense fallback={<CallbackSkeleton />}>
            <OAuthCallbackContent />
          </Suspense>
        </Container>
      </main>
      <Footer />
    </div>
  )
}

function CallbackSkeleton() {
  return (
    <Card className="animate-in">
      <CardHeader>
        <Skeleton className="h-7 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-4">
          <Skeleton className="h-12 w-12 rounded-full mb-4" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-10 w-1/2 mt-4" />
        </div>
      </CardContent>
    </Card>
  )
}
