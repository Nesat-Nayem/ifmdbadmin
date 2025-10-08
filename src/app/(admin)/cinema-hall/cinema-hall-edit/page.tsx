import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import CinemaHallEdit from './components/CinemaHallEdit'

export const metadata: Metadata = { title: 'Cinema Hall Edit' }

const CinemaHallEditPage = () => {
  return (
    <>
      <PageTItle title="Cinema Hall Edit" />
      <CinemaHallEdit />
    </>
  )
}

export default CinemaHallEditPage
