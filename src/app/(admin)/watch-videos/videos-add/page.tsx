import React from 'react'
import { Col, Row } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import WatchVideosAdd from './components/WatchVideosAdd'

export const metadata: Metadata = { title: 'Add Watch Video' }

const WatchVideosAddPage = () => {
  return (
    <>
      <PageTItle title="Add Watch Video" />
      <Row>
        <Col xl={12} lg={12}>
          <WatchVideosAdd />
        </Col>
      </Row>
    </>
  )
}

export default WatchVideosAddPage
