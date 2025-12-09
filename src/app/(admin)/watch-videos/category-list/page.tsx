import React from 'react'
import { Col, Row } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import CategoryList from './components/CategoryList'

export const metadata: Metadata = { title: 'Watch Video Categories' }

const WatchVideoCategoryListPage = () => {
  return (
    <>
      <PageTItle title="Video Categories" />
      <Row>
        <Col xl={12} lg={12}>
          <CategoryList />
        </Col>
      </Row>
    </>
  )
}

export default WatchVideoCategoryListPage
