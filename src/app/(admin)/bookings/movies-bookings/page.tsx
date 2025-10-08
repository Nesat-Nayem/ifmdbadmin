import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import MoviesTicketBookings from './components/MoviesTicketBookings'

export const metadata: Metadata = { title: 'Movies Bookings List' }

const MoviesBookingsListPage = () => {
  return (
    <>
      <PageTItle title="Movies Bookings List" />
      <MoviesTicketBookings />
    </>
  )
}

export default MoviesBookingsListPage
