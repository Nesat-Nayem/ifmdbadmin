import React from 'react'
import { Col, Row } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import EventsAddCategory from './components/EventsAddCategory'

export const metadata: Metadata = { title: 'Events Category Add' }

const EventsCategoryAddPage = () => {
  return (
    <>
      <PageTItle title="Events Category Add" />
      <Row>
        <Col xl={12} lg={12}>
          <EventsAddCategory />
        </Col>
      </Row>
    </>
  )
}

export default EventsCategoryAddPage
