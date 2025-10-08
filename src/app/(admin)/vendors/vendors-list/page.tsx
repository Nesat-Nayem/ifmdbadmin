import React from 'react'
import { Row } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import VendorList from './components/VendorList'

export const metadata: Metadata = { title: 'Vendor List' }

const VendorListPage = () => {
  return (
    <>
      <PageTItle title="Vendor List" />
      <Row>
        <VendorList />
      </Row>
    </>
  )
}

export default VendorListPage
