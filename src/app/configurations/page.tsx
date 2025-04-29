import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Container } from "@/components/ui/container"
import { ConfigurationsList } from "@/components/configurations-list"

export default function ConfigurationsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8">
        <Container>
          <h1 className="text-3xl font-bold mb-6">Your Docker Configurations</h1>
          <p className="text-lg mb-8">View and manage your saved Dockerfile and docker-compose.yaml configurations.</p>
          <ConfigurationsList />
        </Container>
      </main>
      <Footer />
    </div>
  )
}
