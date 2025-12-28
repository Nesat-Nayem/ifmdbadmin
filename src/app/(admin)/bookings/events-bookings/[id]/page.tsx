'use client'

import React from 'react'
import EventBookingDetails from './components/EventBookingDetails'
import { useParams } from 'next/navigation'

const EventBookingDetailsPage = () => {
  const { id } = useParams()
  return <EventBookingDetails id={id as string} />
}

export default EventBookingDetailsPage
