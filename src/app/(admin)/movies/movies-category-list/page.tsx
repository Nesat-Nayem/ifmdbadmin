import React from 'react'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import MoviesCategoryList from './components/MoviesCategoryList'

export const metadata: Metadata = { title: 'Movies Categories List' }

const MoviesCategoryListPage = () => {
  return (
    <>
      <PageTItle title="Movies Categories List" />
      <MoviesCategoryList />
    </>
  )
}

export default MoviesCategoryListPage
