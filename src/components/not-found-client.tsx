'use client'

// This wrapper ensures client-side only execution
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
// import NotFound from '@/components/not-found'

const NotFoundContent = dynamic(
  () => import('@/components/not-found'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-blue-100 dark:bg-blue-900">
        <div className="text-blue-600 dark:text-blue-300 text-lg">
          Loading ocean scene...
        </div>
      </div>
    )
  }
)

export default function NotFoundClient() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return <NotFoundContent />
}