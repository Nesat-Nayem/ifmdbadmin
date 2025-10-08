import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import EventsTicketBookings from './components/EventsTicketBookings'

export const metadata: Metadata = { title: 'Events Bookings List' }

const EventsTicketBookingsListPage = () => {
  return (
    <>
      <PageTItle title="Events Bookings List" />
      <EventsTicketBookings />
    </>
  )
}

export default EventsTicketBookingsListPage
