import React from 'react'
import GeneralSettings from './components/GeneralSettings'
import StoreSettings from './components/StoreSettings'
import LocalizationSettings from './components/LocalizationSettings'
import SettingsBoxs from './components/SettingsBoxs'
import CustomersSettings from './components/CustomersSettings'
import PageTItle from '@/components/PageTItle'
import Link from 'next/link'
import PasswordForm from './components/PasswordForm'

const SettingsPage = () => {
  return (
    <>
      <PageTItle title="SETTINGS" />
      <GeneralSettings />
      <PasswordForm />
      {/* <StoreSettings />
      <LocalizationSettings />
      <SettingsBoxs />
      <CustomersSettings /> */}
    </>
  )
}

export default SettingsPage
