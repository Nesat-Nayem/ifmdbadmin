'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { Card, CardFooter, CardHeader, CardTitle, Col, Row, Toast, ToastContainer } from 'react-bootstrap'
import { useDeleteEventsMutation, useGetEventsQuery } from '@/store/eventsApi'

const EventsTicketBookings = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  // ✅ Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  const { data: eventsData = [], isLoading, isError } = useGetEventsQuery()

  const [deleteEvents, { isLoading: isDeleting }] = useDeleteEventsMutation()

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error loading movies</div>

  // ✅ filter eventsData by title + category
  const filteredEvents = eventsData.filter((event: any) => [event.title, event.category].join(' ').toLowerCase().includes(searchTerm.toLowerCase()))

  // ✅ pagination
  const itemsPerPage = 5
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = filteredEvents.slice(startIndex, startIndex + itemsPerPage)

  // ✅ page change handler
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // ✅ Toast trigger
  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  // ✅ Delete handler
  const handleDelete = async (id: string) => {
    try {
      await deleteEvents(id).unwrap()
      showMessage('Events deleted successfully!', 'success')
    } catch (error: any) {
      console.error('Delete failed:', error)
      showMessage(error?.data?.message || 'Failed to delete Events', 'error')
    }
  }

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
              <CardTitle as="h4" className="mb-0">
                Events Ticket Booking List
              </CardTitle>

              {/* 🔍 Search */}
              <div className="d-flex align-items-center gap-2 ms-auto">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1) // reset to page 1 when searching
                  }}
                  className="form-control form-control-sm"
                  style={{ maxWidth: 200 }}
                />
              </div>
            </CardHeader>

            <div className="table-responsive">
              <table className="table align-middle mb-0 table-hover table-centered table-bordered">
                <thead className="bg-light-subtle">
                  <tr style={{ textWrap: 'nowrap' }}>
                    <th style={{ width: 20 }}>
                      <div className="form-check">
                        <input type="checkbox" className="form-check-input" id="checkAll" />
                      </div>
                    </th>

                    <th style={{ textWrap: 'nowrap' }}>Event Name</th>
                    <th style={{ textWrap: 'nowrap' }}>Organizer Name</th>
                    <th style={{ textWrap: 'nowrap' }}>User Name</th>
                    <th style={{ textWrap: 'nowrap' }}>City </th>
                    <th style={{ textWrap: 'nowrap' }}>Event Date</th>
                    <th style={{ textWrap: 'nowrap' }}>Price</th>
                    <th style={{ textWrap: 'nowrap' }}>Total Seats</th>
                    <th style={{ textWrap: 'nowrap' }}>Seat Number</th>
                    <th style={{ textWrap: 'nowrap' }}>Ticket Price</th>
                    <th style={{ textWrap: 'nowrap' }}>Status</th>
                    <th style={{ textWrap: 'nowrap' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((event: any) => (
                    <tr key={event._id}>
                      <td>
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" />
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded bg-light avatar-md d-flex align-items-center justify-content-center">
                            <Image src={event.posterImage || '/placeholder.png'} alt={event.title} width={60} height={60} className="rounded" />
                          </div>
                        </div>
                      </td>
                      <td>{event.title}</td>
                      <td>{event.category}</td>
                      <td>{event.category}</td>
                      <td>{event.category}</td>
                      <td>{event.category}</td>
                      <td>{event.category}</td>
                      <td style={{ textWrap: 'nowrap' }}>
                        {' '}
                        {new Date(event.startDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td style={{ textWrap: 'nowrap' }}>
                        {' '}
                        {new Date(event.endDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className={`fw-medium ${event.isActive ? 'text-success' : 'text-danger'}`}>{event.status}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link href={`/bookings/movies-bookings/edit/${event._id}`} className="btn btn-light btn-sm">
                            <IconifyIcon icon="solar:eye-broken" className="align-middle fs-18" />
                          </Link>
                          <button className="btn btn-soft-danger btn-sm" onClick={() => handleDelete(event._id)} disabled={isDeleting}>
                            <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {currentItems.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center">
                        No events found
                      </td>
                    </tr>
                  )}
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

export default EventsTicketBookings
