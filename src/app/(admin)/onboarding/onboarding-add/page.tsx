import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import OnboardingAdd from './components/OnboardingAdd'

export const metadata: Metadata = { title: 'Onboarding' }

const PermissionsPage = () => {
  return (
    <>
      <PageTItle title="Onboarding" />
      <OnboardingAdd />
    </>
  )
}

export default PermissionsPage
