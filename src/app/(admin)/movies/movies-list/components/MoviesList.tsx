'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Card, CardFooter, CardHeader, CardTitle, Col, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap'
import { useDeleteMovieMutation, useGetMoviesQuery } from '@/store/moviesApi'

const MoviesList = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // ✅ Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  // ✅ Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const { data, isLoading, isError } = useGetMoviesQuery({ page: currentPage, limit: 10, search: debouncedSearch || undefined })

  const currentItems = data?.data ?? []
  const totalPages = data?.meta?.totalPages ?? 1

  const [deleteMovie, { isLoading: isDeleting }] = useDeleteMovieMutation()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ✅ page change handler
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // ✅ Reset to page 1 on search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  // ✅ Toast trigger
  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  // ✅ Delete movie handler
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this movie?')) return
    setDeletingId(id)
    try {
      await deleteMovie(id).unwrap()
      showMessage('Movie deleted successfully!', 'success')
    } catch (error) {
      console.error(error)
      showMessage('Failed to delete movie', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
              <CardTitle as="h4" className="mb-0">
                Movies List
              </CardTitle>

              <div className="d-flex align-items-center gap-2 ms-auto">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="form-control form-control-sm"
                  style={{ maxWidth: 200 }}
                />
              </div>

              <Link href="/movies/movies-add" className="btn btn-sm btn-success">
                + Add Movie
              </Link>
            </CardHeader>

            {/* ✅ Table */}
            <div className="table-responsive">
              <table className="table align-middle mb-0 table-hover table-centered table-bordered">
                <thead className="bg-light-subtle">
                  <tr style={{ textWrap: 'nowrap' }}>
                    <th>
                      <div className="form-check">
                        <input type="checkbox" className="form-check-input" id="selectAll" />
                        <label className="form-check-label" htmlFor="selectAll" />
                      </div>
                    </th>
                    <th>Poster</th>
                    <th>Title</th>
                    <th>Genres</th>
                    <th>Format</th>
                    <th>Languages</th>
                    <th>Release Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {isLoading && (
                    <tr>
                      <td colSpan={9} className="text-center py-4">
                        <Spinner size="sm" animation="border" className="me-2" /> Loading movies...
                      </td>
                    </tr>
                  )}
                  {isError && !isLoading && (
                    <tr>
                      <td colSpan={9} className="text-center py-4 text-danger">
                        Failed to load movies
                      </td>
                    </tr>
                  )}
                  {!isLoading && !isError && currentItems.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-4">
                        No movies found
                      </td>
                    </tr>
                  )}
                  {!isLoading && !isError && currentItems.map((movie: any) => (
                    <tr key={movie._id}>
                      <td>
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" />
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded bg-light avatar-md d-flex align-items-center justify-content-center">
                            {movie.posterUrl ? (
                              <Image src={movie.posterUrl} alt={movie.title} width={60} height={80} className="rounded" />
                            ) : (
                              <Image
                                src="https://b.rgbimg.com/users/h/hi/hisks/600/mhYExIC.jpg"
                                alt="movie poster"
                                width={60}
                                height={80}
                                className="rounded"
                              />
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{movie.title}</td>
                      <td>{movie.genres?.join(', ') || '—'}</td>
                      <td>{movie.formats?.join(', ') || '—'}</td>
                      <td>{movie.languages?.join(', ') || '—'}</td>
                      <td>
                        {movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        }) : '—'}
                      </td>
                      <td className={movie.isActive ? 'fw-medium text-success' : 'fw-medium text-danger'}>
                        {movie.isActive ? 'Active' : 'Inactive'}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link href={`/movies/${movie._id}`} className="btn btn-light btn-sm">
                            <IconifyIcon icon="solar:eye-broken" className="align-middle fs-18" />
                          </Link>
                          <Link href={`/movies/movies-edit/${movie._id}`} className="btn btn-soft-info btn-sm">
                            <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                          </Link>
                          <button
                            className="btn btn-soft-danger btn-sm"
                            onClick={() => handleDelete(movie._id)}
                            disabled={isDeleting && deletingId === movie._id}
                          >
                            {isDeleting && deletingId === movie._id ? (
                              <Spinner size="sm" animation="border" className="me-1" />
                            ) : (
                              <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ✅ Pagination */}
            <CardFooter className="border-top">
              <nav aria-label="Page navigation example">
                <ul className="pagination justify-content-end mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                      Previous
                    </button>
                  </li>

                  {Array.from({ length: totalPages }, (_, index) => (
                    <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => handlePageChange(index + 1)}>
                        {index + 1}
                      </button>
                    </li>
                  ))}

                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </CardFooter>
          </Card>
        </Col>
      </Row>

      {/* ✅ Toast Notification */}
      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant === 'success' ? 'success' : 'danger'}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default MoviesList
