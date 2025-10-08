import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import EventsView from './components/EventsView'

export const metadata: Metadata = { title: 'Events View' }

const EventsViewPage = () => {
  return (
    <>
      <PageTItle title="Events View" />
      <EventsView />
    </>
  )
}

export default EventsViewPage
