import React from 'react'
import { Col, Row } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import MoviesAddCategory from './components/MoviesAddCategory'

export const metadata: Metadata = { title: 'Movies Category Add' }

const MoviesCategoryAddPage = () => {
  return (
    <>
      <PageTItle title="Movies Category Add" />
      <Row>
        <Col xl={12} lg={12}>
          <MoviesAddCategory />
        </Col>
      </Row>
    </>
  )
}

export default MoviesCategoryAddPage
