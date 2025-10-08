import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import EventsList from './components/EventsList'

export const metadata: Metadata = { title: 'Events List' }

const EventsListPage = () => {
  return (
    <>
      <PageTItle title="Events List" />
      <EventsList />
    </>
  )
}

export default EventsListPage
