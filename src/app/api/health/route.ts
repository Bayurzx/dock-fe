import { NextResponse } from "next/server"

export async function GET() {
  try {
    // You can add more health checks here
    // For example, check database connectivity, external API status, etc.

    const healthCheck = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.NPM_PACKAGE_VERSION || "1.0.0",
    }

    return NextResponse.json(healthCheck, { status: 200 })
  } catch (error) {
    const errorResponse = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    }

    return NextResponse.json(errorResponse, { status: 503 })
  }
}
