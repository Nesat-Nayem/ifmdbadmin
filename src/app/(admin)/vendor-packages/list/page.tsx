import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import VendorPackageList from './components/VendorPackageList'

export const metadata: Metadata = { title: 'Vendor Packages' }

const VendorPackageListPage = () => {
  return (
    <>
      <PageTItle title="Vendor Packages" />
      <VendorPackageList />
    </>
  )
}

export default VendorPackageListPage
