import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import ScannerList from './components/ScannerList'

export const metadata: Metadata = { title: 'Scanner Accounts' }

const ScannerListPage = () => {
  return (
    <>
      <PageTItle title="Scanner Accounts" />
      <ScannerList />
    </>
  )
}

export default ScannerListPage
