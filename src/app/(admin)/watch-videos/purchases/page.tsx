import React from 'react'
import { Col, Row } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import PurchasesList from './components/PurchasesList'

export const metadata: Metadata = { title: 'Video Purchases' }

const WatchVideoPurchasesPage = () => {
  return (
    <>
      <PageTItle title="Video Purchases" />
      <Row>
        <Col xl={12} lg={12}>
          <PurchasesList />
        </Col>
      </Row>
    </>
  )
}

export default WatchVideoPurchasesPage
