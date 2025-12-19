import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import WithdrawalHistory from './components/WithdrawalHistory'

export const metadata: Metadata = { title: 'Withdrawal History' }

const WithdrawalsPage = () => (
  <>
    <PageTItle title="Withdrawal History" />
    <WithdrawalHistory />
  </>
)

export default WithdrawalsPage
