"use client"

import { Suspense, type ReactNode } from "react"
import { AuthProvider } from "@/lib/auth-context"

interface AuthProviderWrapperProps {
  children: ReactNode
}

export function AuthProviderWrapper({ children }: AuthProviderWrapperProps) {
  return (
    <Suspense fallback={<div>Loading authentication...</div>}>
      <AuthProvider>{children}</AuthProvider>
    </Suspense>
  )
}
