import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import OnboardingList from './components/OnBoardingList'

export const metadata: Metadata = { title: 'Onboarding List' }

const PermissionsPage = () => {
  return (
    <>
      <PageTItle title="Onboarding List" />
      <OnboardingList />
    </>
  )
}

export default PermissionsPage
