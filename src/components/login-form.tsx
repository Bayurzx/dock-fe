"use client"

import type React from "react"
import type { BackendError } from "@/types"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GoogleIcon, GithubIcon, GitlabIcon } from "@/components/service-icons"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { login, loginWithGoogle, loginWithGithub, loginWithGitlab } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await login(email, password)
      router.push("/repositories")
    } catch (err) {
      setError(err instanceof Error ? (err as BackendError).detail || err.message : "Incorrect email or password")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle()
    } catch (err) {
      setError(
        err instanceof Error
          ? (err as BackendError).detail || err.message
          : "Failed to login with Google. Please try again.",
      )
    }
  }

  const handleGithubLogin = async () => {
    try {
      await loginWithGithub()
    } catch (err) {
      setError(
        err instanceof Error
          ? (err as BackendError).detail || err.message
          : "Failed to login with GitHub. Please try again.",
      )
    }
  }

  const handleGitlabLogin = async () => {
    try {
      await loginWithGitlab()
    } catch (err) {
      setError(
        err instanceof Error
          ? (err as BackendError).detail || err.message
          : "Failed to login with GitLab. Please try again.",
      )
    }
  }

  return (
    <Card className="w-full card-hover animate-in">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4 animate-in">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="transition-all duration-200 focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="transition-all duration-200 focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button type="submit" className="w-full hover-scale" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <Button variant="outline" type="button" onClick={handleGoogleLogin} className="hover-scale">
              <GoogleIcon className="mr-2 h-4 w-4" />
              Google
            </Button>
            <Button variant="outline" type="button" onClick={handleGithubLogin} className="hover-scale">
              <GithubIcon className="mr-2 h-4 w-4" />
              GitHub
            </Button>
            <Button variant="outline" type="button" onClick={handleGitlabLogin} className="hover-scale">
              <GitlabIcon className="mr-2 h-4 w-4" />
              GitLab
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
