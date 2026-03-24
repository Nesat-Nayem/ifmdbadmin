import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import HomepageCategoryAdd from './components/HomepageCategoryAdd'

export const metadata: Metadata = { title: 'Add Homepage Category' }

const HomepageCategoryAddPage = () => {
  return (
    <>
      <PageTItle title="Add Homepage Category" />
      <HomepageCategoryAdd />
    </>
  )
}

export default HomepageCategoryAddPage
