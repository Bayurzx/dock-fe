import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Container } from "@/components/ui/container"
import { RepositoryForm } from "@/components/repository-form"

export default function RepositoriesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8">
        <Container>
          <h1 className="text-3xl font-bold mb-6">Repository Analysis</h1>
          <p className="text-lg mb-8">
            Submit a Git repository URL to analyze its structure and generate Docker configurations.
          </p>
          <RepositoryForm />
        </Container>
      </main>
      <Footer />
    </div>
  )
}
