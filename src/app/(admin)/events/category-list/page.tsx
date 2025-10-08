import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import EventsCategoryList from './components/EventsCategoryList'

export const metadata: Metadata = { title: 'Events Categories List' }

const EventsCategoryListPage = () => {
  return (
    <>
      <PageTItle title="Events Categories List" />
      <EventsCategoryList />
    </>
  )
}

export default EventsCategoryListPage
