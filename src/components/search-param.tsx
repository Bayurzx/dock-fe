"use client"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

export function SearchParamsComponent() {
  const searchParams = useSearchParams()
  const ref = searchParams.get("ref") // for example

  useEffect(() => {
    if (ref) {
      console.log("Referral from:", ref)
    }
  }, [ref])

  return null
}
