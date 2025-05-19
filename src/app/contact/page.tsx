import { Container } from "@/components/ui/container"
import { ContactForm } from "@/components/contact-form"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Contact Us | DockerHelper",
  description: "Get in touch with the DockerHelper team",
}

export default function ContactPage() {
  return (
    <Container className="py-12">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Contact Us</h1>
            <p className="text-xl text-muted-foreground">Have questions or feedback? We&apos;d love to hear from you.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="rounded-full bg-primary/10 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Phone</h3>
                <p className="text-muted-foreground">+1 (555) 123-4567</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="rounded-full bg-primary/10 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-muted-foreground">
                  <Link href="mailto:support@dockerhelper.com" className="hover:underline">
                    support@dockerhelper.com
                  </Link>
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="rounded-full bg-primary/10 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Office</h3>
                <p className="text-muted-foreground">
                  123 Docker Lane
                  <br />
                  San Francisco, CA 94107
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>

            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">How does DockerHelper work?</h3>
                <p className="text-muted-foreground">
                  DockerHelper uses AI to analyze your repository&apos;s code, dependencies, and structure to generate
                  optimized Docker configurations tailored to your specific project.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Is my code secure when I submit it for analysis?</h3>
                <p className="text-muted-foreground">
                  Yes, we take security seriously. Your code is processed securely, and we don&apos;t store the actual code
                  content after analysis is complete. See our Privacy Policy for more details.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Can I use DockerHelper with private repositories?</h3>
                <p className="text-muted-foreground">
                  Yes, you can connect your GitHub account to access private repositories. We use OAuth to securely
                  access only the repositories you explicitly submit for analysis.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">How accurate are the generated Docker configurations?</h3>
                <p className="text-muted-foreground">
                  Our AI model is trained on thousands of real-world Docker configurations and continuously improves
                  based on user feedback. While no automated system is perfect, our configurations are designed to be
                  production-ready with minimal adjustments.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <ContactForm />
        </div>
      </div>
    </Container>
  )
}
