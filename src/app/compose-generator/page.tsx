import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Container } from "@/components/ui/container"
import { ComposeGeneratorForm } from "@/components/compose-generator-form"

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
          <ComposeGeneratorForm />
        </Container>
      </main>
      <Footer />
    </div>
  )
}
