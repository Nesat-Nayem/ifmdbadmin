import React from 'react'
import { Col, Row } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import VideoEdit from './components/VideoEdit'

export const metadata: Metadata = { title: 'Edit Video' }

const VideoEditPage = ({ params }: { params: { id: string } }) => {
  return (
    <>
      <PageTItle title="Edit Video" />
      <Row>
        <Col xl={12} lg={12}>
          <VideoEdit videoId={params.id} />
        </Col>
      </Row>
    </>
  )
}

export default VideoEditPage
