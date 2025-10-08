import React from 'react'
import { Col, Row } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import AdvertiseEdit from './components/AdvertiseEdit'

export const metadata: Metadata = { title: 'Advertise Edit' }

const EditAddPage = () => {
  return (
    <>
      <PageTItle title="Advertise Edit" />
      <Row>
        <Col xl={12} lg={12}>
          <AdvertiseEdit />
        </Col>
      </Row>
    </>
  )
}

export default EditAddPage
