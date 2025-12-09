import React from 'react'
import { Col, Row } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import VideoDetails from './components/VideoDetails'

export const metadata: Metadata = { title: 'Video Details' }

const VideoDetailsPage = ({ params }: { params: { id: string } }) => {
  return (
    <>
      <PageTItle title="Video Details" />
      <Row>
        <Col xl={12} lg={12}>
          <VideoDetails videoId={params.id} />
        </Col>
      </Row>
    </>
  )
}

export default VideoDetailsPage
