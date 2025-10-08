import React from 'react'
import { Metadata } from 'next'
import PageTItle from '@/components/PageTItle'
import MoviesCategoryEdit from './components/MoviesCategoryEdit'

export const metadata: Metadata = { title: 'Edit Movie Category' }

const MoviesCategoryEditPage = ({ params }: { params: { id: string } }) => {
  return (
    <>
      <PageTItle title="Edit Movie Category" />
      <MoviesCategoryEdit id={params.id} />
    </>
  )
}

export default MoviesCategoryEditPage
