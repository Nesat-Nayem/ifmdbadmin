import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import PlatformFees from './components/PlatformFees'

export const metadata: Metadata = { title: 'Platform Fees Settings' }

const PlatformFeesPage = () => {
  return (
    <>
      <PageTItle title="Platform Fees Settings" />
      <PlatformFees />
    </>
  )
}

export default PlatformFeesPage
