// This is your main 404 page entry file
import { Suspense } from 'react'
import NotFoundClient from '@/components/not-found-client'

export default function NotFoundPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotFoundClient />
    </Suspense>
  )
}
