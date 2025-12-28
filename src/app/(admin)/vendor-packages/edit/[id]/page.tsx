'use client'

import React from 'react'
import VendorPackageEdit from './components/VendorPackageEdit'
import { useParams } from 'next/navigation'

const VendorPackageEditPage = () => {
  const { id } = useParams()
  return <VendorPackageEdit id={id as string} />
}

export default VendorPackageEditPage
