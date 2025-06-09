import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProviderWrapper } from "@/components/auth-provider-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "DockerHelper - Automated Docker Configuration",
    template: "%s | DockerHelper"
  },
  description: "Generate optimized Dockerfile and docker-compose.yaml configurations automatically for your Git repositories. Save time with AI-powered Docker setup.",
  keywords: [
    "Docker",
    "Dockerfile",
    "docker-compose",
    "DevOps",
    "containerization",
    "CI/CD",
    "deployment automation"
  ],
  authors: [{ name: "Adebayo Omolumo", url: "https://visit.adebayoomolumo.website" }],
  creator: "Bayurzx",
  publisher: "Bayurzx",
  metadataBase: new URL(process.env.NEXT_PUBLIC_PRODUCTION_URL || "https://dockerhelper.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DockerHelper - Automated Docker Configuration",
    description: "Generate optimized Dockerfile and docker-compose.yaml configurations automatically for your Git repositories.",
    url: "https://dockerhelper.vercel.app",
    siteName: "DockerHelper",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DockerHelper - Automated Docker Configuration",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DockerHelper - Automated Docker Configuration",
    description: "Generate optimized Dockerfile and docker-compose.yaml configurations automatically for your Git repositories.",
    images: ["/og-image.png"],
    creator: "@adebayoomolumo",
    site: "@dockerhelper",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          <AuthProviderWrapper>
            {children}
            <Toaster />
          </AuthProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  )
}
