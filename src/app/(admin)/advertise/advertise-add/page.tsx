import React from 'react'
import { Col, Row } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import AdvertiseAdd from './components/AdvertiseAdd'

export const metadata: Metadata = { title: 'Advertise Add' }

const AddPage = () => {
  return (
    <>
      <PageTItle title="Advertise Add" />
      <Row>
        <Col xl={12} lg={12}>
          <AdvertiseAdd />
        </Col>
      </Row>
    </>
  )
}

export default AddPage
