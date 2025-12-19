import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import VendorWalletDashboard from './components/VendorWalletDashboard'

export const metadata: Metadata = { title: 'My Wallet' }

const WalletPage = () => (
  <>
    <PageTItle title="My Wallet" />
    <VendorWalletDashboard />
  </>
)

export default WalletPage
