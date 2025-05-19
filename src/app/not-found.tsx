// This is your main 404 page entry file
import NotFoundClient from '@/components/not-found-client'
import { Suspense } from 'react'

export default function NotFoundPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotFoundClient />
    </Suspense>
  )
}
