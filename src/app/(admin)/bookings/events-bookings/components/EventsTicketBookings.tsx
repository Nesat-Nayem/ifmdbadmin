'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import React, { useState } from 'react'
import { Badge, Card, CardFooter, CardHeader, CardTitle, Col, Modal, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap'
import { useGetEventBookingsQuery, useDeleteEventBookingMutation, useCancelEventBookingMutation } from '@/store/eventsApi'

const EventsTicketBookings = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [bookingFilter, setBookingFilter] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  // Fetch bookings with filters
  const { data, isLoading, isError, refetch } = useGetEventBookingsQuery({
    page: currentPage,
    limit: 10,
    paymentStatus: paymentFilter || undefined,
    bookingStatus: bookingFilter || undefined,
    sortBy: 'bookedAt',
    sortOrder: 'desc',
  })

  const [deleteBooking, { isLoading: isDeleting }] = useDeleteEventBookingMutation()
  const [cancelBooking, { isLoading: isCancelling }] = useCancelEventBookingMutation()

  const bookings = data?.bookings || []
  const meta = data?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 }

  // Filter bookings by search term
  const filteredBookings = bookings.filter((booking: any) => {
    const eventTitle = booking.eventId?.title || ''
    const customerName = booking.customerDetails?.name || ''
    const bookingRef = booking.bookingReference || ''
    const searchLower = searchTerm.toLowerCase()
    return (
      eventTitle.toLowerCase().includes(searchLower) ||
      customerName.toLowerCase().includes(searchLower) ||
      bookingRef.toLowerCase().includes(searchLower)
    )
  })

  // Page change handler
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= meta.totalPages) {
      setCurrentPage(page)
    }
  }

  // Toast trigger
  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  // Delete handler
  const handleDelete = async () => {
    if (!selectedBookingId) return
    try {
      await deleteBooking(selectedBookingId).unwrap()
      showMessage('Booking deleted successfully!', 'success')
      setShowDeleteModal(false)
      setSelectedBookingId(null)
      refetch()
    } catch (error: any) {
      console.error('Delete failed:', error)
      showMessage(error?.data?.message || 'Failed to delete booking', 'error')
    }
  }

  // Cancel handler
  const handleCancel = async (id: string) => {
    try {
      await cancelBooking(id).unwrap()
      showMessage('Booking cancelled successfully!', 'success')
      refetch()
    } catch (error: any) {
      console.error('Cancel failed:', error)
      showMessage(error?.data?.message || 'Failed to cancel booking', 'error')
    }
  }

  // Status badge helper
  const getPaymentBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'warning',
      completed: 'success',
      failed: 'danger',
      refunded: 'info',
    }
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>
  }

  const getBookingBadge = (status: string) => {
    const variants: Record<string, string> = {
      confirmed: 'success',
      cancelled: 'danger',
      expired: 'secondary',
    }
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center text-danger py-5">
        <IconifyIcon icon="solar:danger-triangle-bold" className="fs-1 mb-2" />
        <p>Error loading bookings. Please try again.</p>
        <button className="btn btn-primary btn-sm" onClick={() => refetch()}>Retry</button>
      </div>
    )
  }

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
              <CardTitle as="h4" className="mb-0">
                Event Ticket Bookings ({meta.total})
              </CardTitle>

              {/* Filters */}
              <div className="d-flex align-items-center gap-2 ms-auto flex-wrap">
                <select
                  className="form-select form-select-sm"
                  style={{ maxWidth: 130 }}
                  value={paymentFilter}
                  onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1) }}
                >
                  <option value="">All Payments</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
                <select
                  className="form-select form-select-sm"
                  style={{ maxWidth: 130 }}
                  value={bookingFilter}
                  onChange={(e) => { setBookingFilter(e.target.value); setCurrentPage(1) }}
                >
                  <option value="">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="expired">Expired</option>
                </select>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control form-control-sm"
                  style={{ maxWidth: 180 }}
                />
              </div>
            </CardHeader>

            <div className="table-responsive">
              <table className="table align-middle mb-0 table-hover table-centered table-bordered">
                <thead className="bg-light-subtle">
                  <tr style={{ whiteSpace: 'nowrap' }}>
                    <th style={{ width: 20 }}>
                      <div className="form-check">
                        <input type="checkbox" className="form-check-input" id="checkAll" />
                      </div>
                    </th>
                    <th>Booking Ref</th>
                    <th>Event Name</th>
                    <th>Customer</th>
                    <th>Seat Type</th>
                    <th>Qty</th>
                    <th>Total Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Booked At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking: any) => (
                    <tr key={booking._id}>
                      <td>
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" />
                        </div>
                      </td>
                      <td>
                        <span className="fw-medium text-primary">{booking.bookingReference}</span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {booking.eventId?.posterImage && (
                            <img
                              src={booking.eventId.posterImage}
                              alt={booking.eventId?.title || 'Event'}
                              width={40}
                              height={40}
                              className="rounded"
                              style={{ objectFit: 'cover' }}
                            />
                          )}
                          <div>
                            <p className="mb-0 fw-medium">{booking.eventId?.title || 'N/A'}</p>
                            <small className="text-muted">
                              {booking.eventId?.startDate
                                ? new Date(booking.eventId.startDate).toLocaleDateString('en-GB', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : ''}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <p className="mb-0 fw-medium">{booking.customerDetails?.name || 'N/A'}</p>
                          <small className="text-muted">{booking.customerDetails?.email || ''}</small>
                        </div>
                      </td>
                      <td>{booking.seatType}</td>
                      <td className="text-center">{booking.quantity}</td>
                      <td className="fw-medium">₹{booking.finalAmount?.toLocaleString() || 0}</td>
                      <td>{getPaymentBadge(booking.paymentStatus)}</td>
                      <td>{getBookingBadge(booking.bookingStatus)}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {new Date(booking.bookedAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                        <br />
                        <small className="text-muted">
                          {new Date(booking.bookedAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </small>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Link href={`/bookings/events-bookings/${booking._id}`} className="btn btn-light btn-sm" title="View">
                            <IconifyIcon icon="solar:eye-broken" className="align-middle fs-18" />
                          </Link>
                          {booking.bookingStatus === 'confirmed' && (
                            <button
                              className="btn btn-soft-warning btn-sm"
                              onClick={() => handleCancel(booking._id)}
                              disabled={isCancelling}
                              title="Cancel"
                            >
                              <IconifyIcon icon="solar:close-circle-broken" className="align-middle fs-18" />
                            </button>
                          )}
                          <button
                            className="btn btn-soft-danger btn-sm"
                            onClick={() => {
                              setSelectedBookingId(booking._id)
                              setShowDeleteModal(true)
                            }}
                            disabled={isDeleting}
                            title="Delete"
                          >
                            <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan={11} className="text-center py-4">
                        <IconifyIcon icon="solar:ticket-broken" className="fs-1 text-muted mb-2" />
                        <p className="mb-0 text-muted">No bookings found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <CardFooter className="border-top">
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  Showing {filteredBookings.length} of {meta.total} bookings
                </small>
                <nav aria-label="Page navigation">
                  <ul className="pagination justify-content-end mb-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                        Previous
                      </button>
                    </li>

                    {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, index) => {
                      const pageNum = index + 1
                      return (
                        <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => handlePageChange(pageNum)}>
                            {pageNum}
                          </button>
                        </li>
                      )
                    })}

                    <li className={`page-item ${currentPage === meta.totalPages ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </CardFooter>
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this booking? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? <Spinner size="sm" /> : 'Delete'}
          </button>
        </Modal.Footer>
      </Modal>

      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant === 'success' ? 'success' : 'danger'}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default EventsTicketBookings
