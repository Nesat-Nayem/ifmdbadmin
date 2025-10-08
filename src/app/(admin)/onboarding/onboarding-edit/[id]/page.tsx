import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import OnboardingEdit from './components/OnboardingEdit'

export const metadata: Metadata = { title: 'Onboarding Edit' }

const PermissionsPage = () => {
  return (
    <>
      <PageTItle title="Onboarding Edit" />
      <OnboardingEdit />
    </>
  )
}

export default PermissionsPage
