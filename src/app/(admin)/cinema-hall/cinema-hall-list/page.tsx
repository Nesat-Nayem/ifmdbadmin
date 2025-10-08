import React from 'react'
import CategoryList from './components/CinemaList'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import CinemaList from './components/CinemaList'

export const metadata: Metadata = { title: 'Cinema Hall List' }

const CinemaHallListPage = () => {
  return (
    <>
      <PageTItle title="CINEMA HALL LIST" />
      <CinemaList />
    </>
  )
}

export default CinemaHallListPage
