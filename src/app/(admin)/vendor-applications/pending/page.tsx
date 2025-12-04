import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import VendorApplicationsList from '../components/VendorApplicationsList'

export const metadata: Metadata = { title: 'Pending Vendor Applications' }

const PendingApplicationsPage = () => (
  <>
    <PageTItle title="Pending Vendor Applications" />
    <VendorApplicationsList status="pending" />
  </>
)

export default PendingApplicationsPage
