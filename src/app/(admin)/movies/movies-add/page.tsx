import React from 'react'
import { Col, Row } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import MoviesAdd from './components/MoviesAdd'

export const metadata: Metadata = { title: 'Movies  Add' }

const MoviesAddPage = () => {
  return (
    <>
      <PageTItle title="Movies  Add" />
      <Row>
        <Col xl={12} lg={12}>
          <MoviesAdd />
        </Col>
      </Row>
    </>
  )
}

export default MoviesAddPage
