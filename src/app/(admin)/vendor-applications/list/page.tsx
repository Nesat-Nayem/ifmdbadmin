import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import VendorApplicationsList from '../components/VendorApplicationsList'

export const metadata: Metadata = { title: 'All Vendor Applications' }

const AllApplicationsPage = () => (
  <>
    <PageTItle title="All Vendor Applications" />
    <VendorApplicationsList />
  </>
)

export default AllApplicationsPage
