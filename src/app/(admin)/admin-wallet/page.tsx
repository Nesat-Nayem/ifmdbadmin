import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import AdminWalletDashboard from './components/AdminWalletDashboard'

export const metadata: Metadata = { title: 'Admin Wallet' }

const AdminWalletPage = () => (
  <>
    <PageTItle title="Platform Earnings" />
    <AdminWalletDashboard />
  </>
)

export default AdminWalletPage
