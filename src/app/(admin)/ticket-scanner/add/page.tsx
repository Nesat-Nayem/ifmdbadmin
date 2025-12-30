import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import ScannerAdd from './components/ScannerAdd'

export const metadata: Metadata = { title: 'Add Scanner Access' }

const ScannerAddPage = () => {
  return (
    <>
      <PageTItle title="Add Scanner Access" />
      <ScannerAdd />
    </>
  )
}

export default ScannerAddPage
