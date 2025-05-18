import { Container } from "@/components/ui/container"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms of Service | DockerHelper",
  description: "Terms of Service for using the DockerHelper platform",
}

export default function TermsPage() {
  return (
    <Container className="py-12 max-w-4xl">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: May 14, 2025</p>
        </div>

        <div className="space-y-6 text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>
              By accessing or using DockerHelper (&quot;Service&quot;), you agree to be bound by these Terms of Service. If you
              disagree with any part of the terms, you may not access the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">2. Description of Service</h2>
            <p>
              DockerHelper provides an AI-powered service that analyzes Git repositories and generates Docker
              configurations. The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">3. User Accounts</h2>
            <p>
              When you create an account with us, you must provide accurate and complete information. You are
              responsible for safeguarding the password and for all activities that occur under your account.
            </p>
            <p>
              You agree not to disclose your password to any third party. You must notify us immediately upon becoming
              aware of any breach of security or unauthorized use of your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">4. Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by DockerHelper and are
              protected by international copyright, trademark, patent, trade secret, and other intellectual property
              laws.
            </p>
            <p>
              You retain all rights to your repositories and code. By submitting repositories for analysis, you grant us
              a license to analyze the code and generate Docker configurations based on it.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">5. User Responsibilities</h2>
            <p>You agree not to use the Service:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>In any way that violates any applicable national or international law or regulation.</li>
              <li>To transmit any material that is defamatory, obscene, or otherwise objectionable.</li>
              <li>
                To impersonate or attempt to impersonate DockerHelper, a DockerHelper employee, another user, or any
                other person.
              </li>
              <li>To engage in any conduct that restricts or inhibits anyone&apos;s use or enjoyment of the Service.</li>
              <li>To attempt to gain unauthorized access to the Service, other accounts, or computer systems.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">6. Limitation of Liability</h2>
            <p>
              In no event shall DockerHelper, nor its directors, employees, partners, agents, suppliers, or affiliates,
              be liable for any indirect, incidental, special, consequential or punitive damages, including without
              limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your access to or use of or inability to access or use the Service.</li>
              <li>Any conduct or content of any third party on the Service.</li>
              <li>Any content obtained from the Service.</li>
              <li>Unauthorized access, use, or alteration of your transmissions or content.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">7. Service Modifications</h2>
            <p>
              DockerHelper reserves the right to modify or discontinue, temporarily or permanently, the Service with or
              without notice. We shall not be liable to you or to any third party for any modification, suspension, or
              discontinuance of the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">8. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without
              regard to its conflict of law provisions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will provide notice of any changes by updating
              the &quot;Last Updated&quot; date at the top of these Terms.
            </p>
            <p>
              Your continued use of the Service after any such changes constitutes your acceptance of the new Terms. If
              you do not agree to the new terms, please stop using the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">10. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at{" "}
              <Link href="mailto:support@iglumtech.com" className="text-primary hover:underline">
                support@iglumtech.com
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </Container>
  )
}
