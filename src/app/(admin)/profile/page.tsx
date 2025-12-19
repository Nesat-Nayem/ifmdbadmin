import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import VendorProfile from './components/VendorProfile'

export const metadata: Metadata = { title: 'My Profile' }

const ProfilePage = () => (
  <>
    <PageTItle title="My Profile & Settings" />
    <VendorProfile />
  </>
)

export default ProfilePage
