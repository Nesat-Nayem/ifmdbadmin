import React from 'react'
import CategoryList from './components/AdvertiseList'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import AdvertiseList from './components/AdvertiseList'

export const metadata: Metadata = { title: 'Advertise List' }

const AdvertiseListPage = () => {
  return (
    <>
      <PageTItle title="ADVERTISE LIST" />
      <AdvertiseList />
    </>
  )
}

export default AdvertiseListPage
