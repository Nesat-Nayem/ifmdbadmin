import React from 'react'
import { Col, Row } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import AddCast from './components/AddCrew'
import AddCrew from './components/AddCrew'

export const metadata: Metadata = { title: 'Add Crew' }

const AddCrewPage = () => {
  return (
    <>
      <PageTItle title="Add Crew" />
      <Row>
        <Col xl={12} lg={12}>
          <AddCrew />
        </Col>
      </Row>
    </>
  )
}

export default AddCrewPage
