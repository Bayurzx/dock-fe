import { LoginForm } from "@/components/login-form"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Container } from "@/components/ui/container"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12">
        <Container className="max-w-md">
          <LoginForm />
        </Container>
      </main>
      <Footer />
    </div>
  )
}
