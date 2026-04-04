'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import React, { useState } from 'react'
import { Card, CardFooter, CardHeader, CardTitle, Col, Modal, Button, Spinner, Row, Toast, ToastContainer } from 'react-bootstrap'
import { useDeleteEventsMutation, useGetEventsQuery } from '@/store/eventsApi'

const EventsList = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteModal, setDeleteModal] = useState({ show: false, id: '', title: '' })

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  const { data: eventsData = [], isLoading, isError } = useGetEventsQuery()
  const [deleteEvents, { isLoading: isDeleting }] = useDeleteEventsMutation()

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error loading events</div>

  const filteredEvents = eventsData.filter((event: any) =>
    [event.title, event.category].join(' ').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = filteredEvents.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
  }

  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: (number | '...')[] = []
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages)
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
    }
    return pages
  }

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const handleDelete = async () => {
    try {
      await deleteEvents(deleteModal.id).unwrap()
      setDeleteModal({ show: false, id: '', title: '' })
      showMessage('Event deleted successfully!', 'success')
    } catch (error: any) {
      console.error('Delete failed:', error)
      showMessage(error?.data?.message || 'Failed to delete event', 'error')
    }
  }

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
              <CardTitle as="h4" className="mb-0">
                Events List
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

              <Link href="/events/events-add" className="btn btn-sm btn-success">
                + Add Events
              </Link>
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
                    <th style={{ textWrap: 'nowrap' }}>Poster</th>
                    <th style={{ textWrap: 'nowrap' }}>Event Name</th>
                    <th style={{ textWrap: 'nowrap' }}>Category</th>
                    <th style={{ textWrap: 'nowrap' }}>Start Date</th>
                    <th style={{ textWrap: 'nowrap' }}>End Date</th>
                    <th style={{ textWrap: 'nowrap' }}>Event Status</th>
                    <th style={{ textWrap: 'nowrap' }}>Active</th>
                    <th style={{ textWrap: 'nowrap' }}>Scheduled</th>
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
                          <div
                            className="rounded bg-light avatar-md d-flex align-items-center justify-content-center overflow-hidden"
                            style={{ width: 60, height: 60, flexShrink: 0 }}
                          >
                            {event.posterImage ? (
                              <img
                                src={event.posterImage}
                                alt={event.title}
                                width={60}
                                height={60}
                                className="rounded"
                                style={{ objectFit: 'cover', width: '60px', height: '60px' }}
                                onError={(e) => {
                                  const img = e.target as HTMLImageElement
                                  img.onerror = null
                                  img.style.display = 'none'
                                  const parent = img.parentElement
                                  if (parent && !parent.querySelector('.no-img-label')) {
                                    const label = document.createElement('span')
                                    label.className = 'no-img-label text-muted'
                                    label.style.fontSize = '10px'
                                    label.textContent = 'No Image'
                                    parent.appendChild(label)
                                  }
                                }}
                              />
                            ) : (
                              <span className="text-muted" style={{ fontSize: 10 }}>No Image</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{event.title}</td>
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
                      <td>
                        <span
                          className={`badge ${
                            event.status === 'upcoming'
                              ? 'bg-primary'
                              : event.status === 'ongoing'
                              ? 'bg-info'
                              : event.status === 'completed'
                              ? 'bg-secondary'
                              : event.status === 'cancelled'
                              ? 'bg-danger'
                              : 'bg-warning'
                          }`}
                        >
                          {event.status}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${event.isActive ? 'bg-success' : 'bg-danger'}`}>
                          {event.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${event.isScheduled ? 'bg-warning text-dark' : 'bg-light text-dark border'}`}>
                          {event.isScheduled ? 'Scheduled' : 'No'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link href={`/events/${event._id}`} className="btn btn-light btn-sm">
                            <IconifyIcon icon="solar:eye-broken" className="align-middle fs-18" />
                          </Link>
                          <Link href={`/events/events-edit/${event._id}`} className="btn btn-soft-info btn-sm">
                            <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                          </Link>
                          <button
                            className="btn btn-soft-danger btn-sm"
                            onClick={() => setDeleteModal({ show: true, id: event._id, title: event.title })}
                          >
                            <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {currentItems.length === 0 && (
                    <tr>
                      <td colSpan={10} className="text-center">
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

                  {getPageNumbers().map((page, index) =>
                    page === '...' ? (
                      <li key={`ellipsis-${index}`} className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    ) : (
                      <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(page)}>
                          {page}
                        </button>
                      </li>
                    )
                  )}

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

      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant === 'success' ? 'success' : 'danger'}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Delete Confirmation Modal */}
      <Modal show={deleteModal.show} onHide={() => setDeleteModal({ show: false, id: '', title: '' })} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to permanently delete <strong>{deleteModal.title}</strong>? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteModal({ show: false, id: '', title: '' })}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? <Spinner size="sm" className="me-1" /> : null}
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default EventsList
