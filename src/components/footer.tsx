import { Container } from "@/components/ui/container"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-background mt-auto">
      <Container>
        <div className="flex flex-col items-center justify-between gap-4 py-6 md:h-16 md:flex-row md:py-0">
          <div className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} DockerHelper. All rights reserved.
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/terms" className="transition-colors hover:text-primary">
              Terms
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-primary">
              Privacy
            </Link>
            <Link href="/contact" className="transition-colors hover:text-primary">
              Contact
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  )
}
