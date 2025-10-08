import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import MoviesView from './components/MoviesView'

export const metadata: Metadata = { title: 'Movies View' }

const MoviesViewPage = () => {
  return (
    <>
      <PageTItle title="Movies View" />
      <MoviesView />
    </>
  )
}

export default MoviesViewPage
