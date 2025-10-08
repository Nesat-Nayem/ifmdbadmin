import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import CinemaView from './components/CinemaView'

export const metadata: Metadata = { title: 'Cinema Hall View' }

const CinemaViewPage = () => {
  return (
    <>
      <PageTItle title="Cinema Hall View" />
      <CinemaView />
    </>
  )
}

export default CinemaViewPage
