import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import HomepageCategoryList from './components/HomepageCategoryList'

export const metadata: Metadata = { title: 'Homepage Categories' }

const HomepageCategoryPage = () => {
  return (
    <>
      <PageTItle title="Homepage Categories" />
      <HomepageCategoryList />
    </>
  )
}

export default HomepageCategoryPage
