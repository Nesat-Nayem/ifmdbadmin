import React from 'react'
import { Row } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import VendorPaymentList from './components/VendorPaymentList'

export const metadata: Metadata = { title: 'Vendor Payment History' }

const VendorPaymentListPage = () => {
  return (
    <>
      <PageTItle title="Vendor Payment History" />
      <Row>
        <VendorPaymentList />
      </Row>
    </>
  )
}

export default VendorPaymentListPage
