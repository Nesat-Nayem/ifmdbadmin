import React from 'react'
import { Col, Row } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import EventsAdd from './components/EventsAdd'

export const metadata: Metadata = { title: 'Events  Add' }

const EventsAddPage = () => {
  return (
    <>
      <PageTItle title="Events  Add" />
      <Row>
        <Col xl={12} lg={12}>
          <EventsAdd />
        </Col>
      </Row>
    </>
  )
}

export default EventsAddPage
