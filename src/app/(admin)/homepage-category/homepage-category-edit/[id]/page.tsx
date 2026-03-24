import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import HomepageCategoryEdit from './components/HomepageCategoryEdit'

export const metadata: Metadata = { title: 'Edit Homepage Category' }

const HomepageCategoryEditPage = () => {
  return (
    <>
      <PageTItle title="Edit Homepage Category" />
      <HomepageCategoryEdit />
    </>
  )
}

export default HomepageCategoryEditPage
