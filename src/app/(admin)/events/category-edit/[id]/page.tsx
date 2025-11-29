import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import EventsCategoryEdit from './components/EventsCategoryEdit'

export const metadata: Metadata = { title: 'Edit Event Category' }

const EventsCategoryEditPage = () => {
  return (
    <>
      <PageTItle title="Edit Event Category" />
      <EventsCategoryEdit />
    </>
  )
}

export default EventsCategoryEditPage
