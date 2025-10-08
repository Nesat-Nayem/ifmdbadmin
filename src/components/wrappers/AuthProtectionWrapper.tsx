'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import type { ChildrenType } from '@/types/component-props'
import FallbackLoading from '../FallbackLoading'
import { useAppSelector } from '@/hooks/useRedux'

const AuthProtectionWrapper = ({ children }: ChildrenType) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/auth/sign-in?redirectTo=${pathname}`)
    }
    if (isAuthenticated && pathname.startsWith('/auth')) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, pathname, router])

  if (!isAuthenticated) {
    return <FallbackLoading />
  }

  return <Suspense fallback={<FallbackLoading />}>{children}</Suspense>
}

export default AuthProtectionWrapper
