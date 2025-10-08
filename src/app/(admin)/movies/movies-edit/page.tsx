import React from 'react'
import { Col, Row } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import MoviesEdit from './components/MoviesEdit'

export const metadata: Metadata = { title: 'Movies  Edit' }

const MoviesEditPage = () => {
  return (
    <>
      <PageTItle title="Movies Edit" />
      <Row>
        <Col xl={12} lg={12}>
          <MoviesEdit />
        </Col>
      </Row>
    </>
  )
}

export default MoviesEditPage
