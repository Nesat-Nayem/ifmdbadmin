import React from 'react'
import { Col, Row } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import WatchVideosList from './components/WatchVideosList'

export const metadata: Metadata = { title: 'Watch Videos List' }

const WatchVideosListPage = () => {
  return (
    <>
      <PageTItle title="Watch Videos List" />
      <Row>
        <Col xl={12} lg={12}>
          <WatchVideosList />
        </Col>
      </Row>
    </>
  )
}

export default WatchVideosListPage
