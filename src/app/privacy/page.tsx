import { Container } from "@/components/ui/container"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy | DockerHelper",
  description: "Privacy Policy for the DockerHelper platform",
}

export default function PrivacyPage() {
  return (
    <Container className="py-12 max-w-4xl">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: May 14, 2025</p>
        </div>

        <div className="space-y-6 text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">1. Introduction</h2>
            <p>
              DockerHelper (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains
              how we collect, use, disclose, and safeguard your information when you use our service.
            </p>
            <p>
              Please read this Privacy Policy carefully. By accessing or using our service, you acknowledge that you
              have read, understood, and agree to be bound by all the terms of this Privacy Policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">2. Information We Collect</h2>
            <h3 className="text-xl font-medium text-foreground">2.1 Personal Information</h3>
            <p>We may collect personal information that you voluntarily provide to us when you:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Register for an account</li>
              <li>Sign in with OAuth providers (Google, GitHub)</li>
              <li>Contact us or provide feedback</li>
              <li>Subscribe to our newsletter</li>
            </ul>
            <p>This information may include:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email address</li>
              <li>Name</li>
              <li>Profile information from OAuth providers</li>
            </ul>

            <h3 className="text-xl font-medium text-foreground">2.2 Repository Information</h3>
            <p>When you submit a repository for analysis, we collect:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Repository URL</li>
              <li>Branch information</li>
              <li>Code structure and dependencies</li>
            </ul>

            <h3 className="text-xl font-medium text-foreground">2.3 Usage Information</h3>
            <p>We automatically collect certain information when you visit, use, or navigate our service:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Device and connection information</li>
              <li>Browser and operating system information</li>
              <li>IP address</li>
              <li>Usage patterns and preferences</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">3. How We Use Your Information</h2>
            <p>We use the information we collect for various purposes, including to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, operate, and maintain our service</li>
              <li>Analyze repositories and generate Docker configurations</li>
              <li>Improve and personalize your experience</li>
              <li>Develop new products, services, and features</li>
              <li>Communicate with you about updates, security alerts, and support</li>
              <li>Prevent fraudulent activities and enhance security</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">4. How We Share Your Information</h2>
            <p>We may share your information in the following situations:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>With Service Providers:</strong> We may share your information with third-party vendors, service
                providers, contractors, or agents who perform services for us.
              </li>
              <li>
                <strong>Business Transfers:</strong> We may share or transfer your information in connection with a
                merger, acquisition, reorganization, or sale of assets.
              </li>
              <li>
                <strong>With Your Consent:</strong> We may disclose your information for any other purpose with your
                consent.
              </li>
              <li>
                <strong>Legal Requirements:</strong> We may disclose your information where required by law or to
                protect our rights.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect the security of your personal
              information. However, please be aware that no method of transmission over the internet or electronic
              storage is 100% secure.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">6. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our service and store certain
              information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being
              sent.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">7. Your Privacy Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The right to access your personal information</li>
              <li>The right to rectify inaccurate information</li>
              <li>The right to request deletion of your information</li>
              <li>The right to restrict or object to processing</li>
              <li>The right to data portability</li>
              <li>The right to withdraw consent</li>
            </ul>
            <p>
              To exercise these rights, please contact us using the information provided in the &quot;Contact Us&quot; section.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">8. Children&apos;s Privacy</h2>
            <p>
              Our service is not directed to individuals under the age of 16. We do not knowingly collect personal
              information from children. If you are a parent or guardian and believe your child has provided us with
              personal information, please contact us.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">9. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
              Privacy Policy on this page and updating the &quot;Last Updated&quot; date.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <Link href="mailto:privacy@dockerhelper.com" className="text-primary hover:underline">
                privacy@dockerhelper.com
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </Container>
  )
}
