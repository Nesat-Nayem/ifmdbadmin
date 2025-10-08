import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import MoviesList from './components/MoviesList'

export const metadata: Metadata = { title: 'Movies List' }

const MoviesListPage = () => {
  return (
    <>
      <PageTItle title="Movies List" />
      <MoviesList />
    </>
  )
}

export default MoviesListPage
