import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Container } from "@/components/ui/container"
import ConfigImprovementHub from "@/components/config-improvement-hub"

export default function ConfigurationImprovePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8">
        <Container>
          <h1 className="text-3xl font-bold mb-6">Configuration Improvement</h1>
          <p className="text-lg mb-8">Improve your Docker configurations by providing feedback or reporting errors.</p>
          <ConfigImprovementHub />
        </Container>
      </main>
      <Footer />
    </div>
  )
}
