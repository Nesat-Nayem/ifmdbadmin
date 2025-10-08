import React from 'react'
import { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import MoviesEditForm from '../components/MoviesEditForm'

export const metadata: Metadata = { title: 'Edit Movie' }

const MoviesEditDynamicPage = ({ params }: { params: { id: string } }) => {
  return (
    <>
      <PageTItle title={`Edit Movie`} />
      <MoviesEditForm id={params.id} />
    </>
  )
}

export default MoviesEditDynamicPage
