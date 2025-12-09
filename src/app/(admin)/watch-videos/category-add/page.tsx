import React from 'react'
import { Col, Row } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import CategoryAdd from './components/CategoryAdd'

export const metadata: Metadata = { title: 'Add Watch Video Category' }

const WatchVideoCategoryAddPage = () => {
  return (
    <>
      <PageTItle title="Add Video Category" />
      <Row>
        <Col xl={12} lg={12}>
          <CategoryAdd />
        </Col>
      </Row>
    </>
  )
}

export default WatchVideoCategoryAddPage
