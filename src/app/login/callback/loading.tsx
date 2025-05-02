import { Container } from "@/components/ui/container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <Container className="max-w-md py-12">
      <Card>
        <CardHeader>
          <CardTitle>Authentication in Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="mt-2 text-center">Processing authentication...</p>
          </div>
        </CardContent>
      </Card>
    </Container>
  )
}
