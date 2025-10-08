import React from 'react'
import { Row } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import VendorDetails from './components/VendorDetails'

export const metadata: Metadata = { title: 'Vendor Details' }

const VendorDetailsPage = () => {
  return (
    <>
      <PageTItle title="Vendor Details" />
      <Row>
        <VendorDetails />
      </Row>
    </>
  )
}

export default VendorDetailsPage
