"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Container } from "@/components/ui/container"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import Cookies from "js-cookie"

export default function OAuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Processing authentication...")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const processCallback = () => {
      const token = searchParams?.get("token")
      const error = searchParams?.get("error")
      const callbackUrl = searchParams?.get("callbackUrl") || "/repositories"

      if (error) {
        setStatus("error")
        setMessage(`Authentication failed: ${error}`)

        // Redirect to login after a delay
        setTimeout(() => {
          router.push("/login")
        }, 3000)
        return
      }

      if (token) {
        // Store the token in a cookie
        Cookies.set("token", token, { secure: true, sameSite: "strict" })

        setStatus("success")
        setMessage("Authentication successful! Redirecting...")

        // Redirect after a short delay
        setTimeout(() => {
          router.push(decodeURI(callbackUrl))
        }, 1500)
      } else {
        setStatus("error")
        setMessage("Authentication failed. No token received.")

        // Redirect to login after a delay
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      }
    }

    processCallback()
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12">
        <Container className="max-w-md">
          <Card className="animate-in">
            <CardHeader>
              <CardTitle className="flex items-center">
                {status === "loading" && "Authentication in Progress"}
                {status === "success" && "Authentication Successful"}
                {status === "error" && "Authentication Failed"}
              </CardTitle>
              <CardDescription>
                {status === "loading" ? "Please wait while we complete the authentication process." : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-4">
                {status === "loading" && <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />}
                {status === "success" && <CheckCircle className="h-12 w-12 text-success mb-4" />}
                {status === "error" && <XCircle className="h-12 w-12 text-destructive mb-4" />}
                <p className="mt-2 text-center">{message}</p>
              </div>
            </CardContent>
          </Card>
        </Container>
      </main>
      <Footer />
    </div>
  )
}
