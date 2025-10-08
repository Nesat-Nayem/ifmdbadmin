import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import CinemaHallAdd from './components/CinemaHallAdd'

export const metadata: Metadata = { title: 'Cinema Hall Add' }

const CinemaHallPage = () => {
  return (
    <>
      <PageTItle title="Cinema Hall Add" />
      <CinemaHallAdd />
    </>
  )
}

export default CinemaHallPage
