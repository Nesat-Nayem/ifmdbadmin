import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import MySubscription from './components/MySubscription'

export const metadata: Metadata = { title: 'My Subscription' }

const SubscriptionPage = () => {
  return (
    <>
      <PageTItle title="My Subscription" />
      <MySubscription />
    </>
  )
}

export default SubscriptionPage
