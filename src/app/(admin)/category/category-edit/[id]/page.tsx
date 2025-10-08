import React from 'react'
import { Col, Row } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import EditCategory from './components/EditCategory'

export const metadata: Metadata = { title: 'EDIT CATEGORY' }

const CategoryEditPage = () => {
  return (
    <>
      <PageTItle title="EDIT CATEGORY" />
      <Row>
        <Col xl={12} lg={12}>
          <EditCategory />
        </Col>
      </Row>
    </>
  )
}

export default CategoryEditPage
