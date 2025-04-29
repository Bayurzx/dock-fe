import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Welcome to DockerHelper</h1>
        <p className="text-lg mb-4">Automatically generate Docker configurations for your Git repositories using AI.</p>
        <p className="text-lg">Get started by logging in or creating an account.</p>
      </main>
      <Footer />
    </div>
  )
}
