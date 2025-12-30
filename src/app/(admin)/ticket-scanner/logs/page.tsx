import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import ScanLogs from './components/ScanLogs'

export const metadata: Metadata = { title: 'Scan Logs' }

const ScanLogsPage = () => {
  return (
    <>
      <PageTItle title="Scan Logs" />
      <ScanLogs />
    </>
  )
}

export default ScanLogsPage
