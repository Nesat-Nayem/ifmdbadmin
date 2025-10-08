import React from 'react'
import { Col, Row } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import AddCast from './components/AddCast'

export const metadata: Metadata = { title: 'Add cast' }

const AddCastPage = () => {
  return (
    <>
      <PageTItle title="Add Cast" />
      <Row>
        <Col xl={12} lg={12}>
          <AddCast />
        </Col>
      </Row>
    </>
  )
}

export default AddCastPage
