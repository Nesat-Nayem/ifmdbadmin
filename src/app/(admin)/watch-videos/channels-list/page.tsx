import React from 'react'
import { Col, Row } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import ChannelsList from './components/ChannelsList'

export const metadata: Metadata = { title: 'Video Channels' }

const WatchVideoChannelsPage = () => {
  return (
    <>
      <PageTItle title="Video Channels" />
      <Row>
        <Col xl={12} lg={12}>
          <ChannelsList />
        </Col>
      </Row>
    </>
  )
}

export default WatchVideoChannelsPage
