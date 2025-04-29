"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Container } from "@/components/ui/container"
import { LogOut, User, ChevronDown } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="border-b bg-background sticky top-0 z-10 shadow-sm transition-all duration-200">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="font-bold text-xl text-primary transition-colors duration-200 hover:text-primary/80"
            >
              DockerHelper
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
                Home
              </Link>
              {user && (
                <>
                  <Link href="/repositories" className="text-sm font-medium transition-colors hover:text-primary">
                    Repositories
                  </Link>
                  <Link href="/configurations" className="text-sm font-medium transition-colors hover:text-primary">
                    Configurations
                  </Link>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.email}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="animate-in slide-in">
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" className="hover-scale">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="hover-scale">Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </Container>
    </header>
  )
}
