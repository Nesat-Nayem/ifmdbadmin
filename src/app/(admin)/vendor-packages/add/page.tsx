import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import VendorPackageAdd from './components/VendorPackageAdd'

export const metadata: Metadata = { title: 'Add Vendor Package' }

const VendorPackageAddPage = () => {
  return (
    <>
      <PageTItle title="Add Vendor Package" />
      <VendorPackageAdd />
    </>
  )
}

export default VendorPackageAddPage
