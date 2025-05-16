"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import Cookies from "js-cookie"

// Add import for BackendError
import type { BackendError } from "@/types"

// Define user type
interface User {
  id: string
  email: string
  full_name: string
  picture_url?: string
}

// Define validation error type
interface ValidationError {
  field: string
  message: string
}

// Define error response type
interface ErrorResponse {
  detail: string
  errors?: ValidationError[]
}

// Define auth context type
interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (fullName: string, email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  loginWithGithub: () => Promise<void>
  loginWithGitlab: () => Promise<void> // Add GitLab login function
  logout: () => void
  isLoading: boolean
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider props
interface AuthProviderProps {
  children: ReactNode
}

// API base URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
const OAUTH_CALLBACK_URL = process.env.NEXT_PUBLIC_OAUTH_CALLBACK_URL || `${APP_URL}/login/callback`

// Feature flags
const ENABLE_GITHUB_LOGIN = process.env.NEXT_PUBLIC_ENABLE_GITHUB_LOGIN !== "false"
const ENABLE_GOOGLE_LOGIN = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN !== "false"
const ENABLE_GITLAB_LOGIN = process.env.NEXT_PUBLIC_ENABLE_GITLAB_LOGIN !== "false" // Add GitLab feature flag

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Check for token in URL (OAuth callback)
  useEffect(() => {
    const checkUrlForToken = () => {
      // Check if we're on the login callback page
      if (pathname === "/login/callback") {
        const token = searchParams?.get("token")
        const error = searchParams?.get("error")

        if (error) {
          toast({
            variant: "destructive",
            title: "Authentication Failed",
            description: error,
          })
          return
        }

        if (token) {
          // Store the token in a cookie
          Cookies.set("token", token, { secure: true, sameSite: "strict" })

          // Fetch user data with the new token
          fetchUserData(token)

          toast({
            title: "Authentication Successful",
            description: "You have been successfully logged in.",
          })
        }
      }
    }

    checkUrlForToken()
  }, [pathname, searchParams, toast])

  // Check for existing token on load
  useEffect(() => {
    const token = Cookies.get("token")

    if (token) {
      fetchUserData(token)
    } else {
      setIsLoading(false)
    }
  }, [])

  // Fetch user data with token
  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        // If token is invalid, clear it
        Cookies.remove("token")

        if (pathname === "/login/callback") {
          toast({
            variant: "destructive",
            title: "Authentication Failed",
            description: "Failed to fetch user data. Please try again.",
          })
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      Cookies.remove("token")

      if (pathname === "/login/callback") {
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: "An error occurred while fetching user data.",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Login with email/password
  const login = async (email: string, password: string) => {
    try {
      // Create form data for the request
      const formData = new URLSearchParams()
      formData.append("username", email)
      formData.append("password", password)

      const response = await fetch(`${API_URL}/auth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      })

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse
        throw new Error((errorData as BackendError).detail || "Login failed")
      }

      const { access_token, token_type } = await response.json()

      // Store token in a cookie
      Cookies.set("token", access_token, { secure: true, sameSite: "strict" })

      // Fetch user data
      await fetchUserData(access_token)

      toast({
        title: "Login successful",
        description: "Welcome back!",
      })
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  // Register new user
  const register = async (fullName: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          picture_url: null,
        }),
      })

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse
        if (errorData.detail === "Email already registered.") {
          throw new Error("Email already registered")
        } else if (errorData.errors && errorData.errors.length > 0) {
          // Handle validation errors
          const errorMessages = errorData.errors.map((err) => err.message).join(", ")
          throw new Error(errorMessages)
        } else {
          throw new Error(errorData.detail || "Registration failed")
        }
      }

      const { access_token, token_type } = await response.json()

      // Store token in a cookie
      Cookies.set("token", access_token, { secure: true, sameSite: "strict" })

      // Fetch user data
      await fetchUserData(access_token)

      toast({
        title: "Registration successful",
        description: `Welcome to DockerHelper, ${fullName}!`,
      })
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  // Login with Google
  const loginWithGoogle = async () => {
    if (!ENABLE_GOOGLE_LOGIN) {
      toast({
        variant: "destructive",
        title: "Google login disabled",
        description: "Google login is currently disabled.",
      })
      return
    }

    // Get the current URL to use as a callback
    const callbackUrl = pathname !== "/login" && pathname !== "/register" ? pathname : "/repositories"

    // Construct the redirect URL
    const redirectUrl = `${API_URL}/auth/login/google?callbackUrl=${encodeURIComponent(OAUTH_CALLBACK_URL)}?callbackUrl=${encodeURIComponent(callbackUrl)}`

    // Redirect to Google OAuth endpoint
    window.location.href = redirectUrl
  }

  // Login with GitHub
  const loginWithGithub = async () => {
    if (!ENABLE_GITHUB_LOGIN) {
      toast({
        variant: "destructive",
        title: "GitHub login disabled",
        description: "GitHub login is currently disabled.",
      })
      return
    }

    // Get the current URL to use as a callback
    const callbackUrl = pathname !== "/login" && pathname !== "/register" ? pathname : "/repositories"

    // Construct the redirect URL
    const redirectUrl = `${API_URL}/auth/login/github?callbackUrl=${encodeURIComponent(OAUTH_CALLBACK_URL)}?callbackUrl=${encodeURIComponent(callbackUrl)}`

    // Redirect to GitHub OAuth endpoint
    window.location.href = redirectUrl
  }

  // Login with GitLab
  const loginWithGitlab = async () => {
    if (!ENABLE_GITLAB_LOGIN) {
      toast({
        variant: "destructive",
        title: "GitLab login disabled",
        description: "GitLab login is currently disabled.",
      })
      return
    }

    // Get the current URL to use as a callback
    const callbackUrl = pathname !== "/login" && pathname !== "/register" ? pathname : "/repositories"

    // Construct the redirect URL
    const redirectUrl = `${API_URL}/auth/login/gitlab?callbackUrl=${encodeURIComponent(OAUTH_CALLBACK_URL)}?callbackUrl=${encodeURIComponent(callbackUrl)}`

    // Redirect to GitLab OAuth endpoint
    window.location.href = redirectUrl
  }

  // Logout
  const logout = () => {
    Cookies.remove("token")
    setUser(null)
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
    router.push("/login")
  }

  const value = {
    user,
    login,
    register,
    loginWithGoogle,
    loginWithGithub,
    loginWithGitlab, // Add GitLab login function to context
    logout,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
