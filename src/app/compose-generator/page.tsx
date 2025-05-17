import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Container } from "@/components/ui/container"
import { ComposeGeneratorForm } from "@/components/compose-generator-form"
import { Skeleton } from "@/components/ui/skeleton"

export default function ComposeGeneratorPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8">
        <Container>
          <h1 className="text-3xl font-bold mb-6">Docker Compose Generator</h1>
          <p className="text-lg mb-8">
            Create a docker-compose.yaml file by specifying multiple services from your analyzed repositories.
          </p>
          <Suspense fallback={<FormSkeleton />}>
            <ComposeGeneratorForm />
          </Suspense>
        </Container>
      </main>
      <Footer />
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  )
}
