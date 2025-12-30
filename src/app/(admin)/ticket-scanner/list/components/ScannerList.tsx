'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import React, { useState } from 'react'
import { Card, CardFooter, CardHeader, CardTitle, Col, Row, Toast, ToastContainer, Badge, Button, Modal, Form } from 'react-bootstrap'
import { useGetScannerAccountsQuery, useDeleteScannerMutation, useToggleScannerStatusMutation, useUpdateScannerMutation } from '@/store/scannerApi'
import { useGetEventsQuery } from '@/store/eventsApi'

const ScannerList = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success')
  const [showToast, setShowToast] = useState(false)

  // Edit Modal state
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingScanner, setEditingScanner] = useState<any>(null)
  const [editForm, setEditForm] = useState({ name: '', phone: '', notes: '', password: '' })
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])

  const { data: response, isLoading, isError, refetch } = useGetScannerAccountsQuery({ 
    page: currentPage, 
    limit: 10,
    search: searchTerm || undefined 
  })
  const { data: eventsData = [] } = useGetEventsQuery()
  const [deleteScanner, { isLoading: isDeleting }] = useDeleteScannerMutation()
  const [toggleStatus, { isLoading: isToggling }] = useToggleScannerStatusMutation()
  const [updateScanner, { isLoading: isUpdating }] = useUpdateScannerMutation()

  const scanners = response?.data || []
  const pagination = response?.pagination || { page: 1, pages: 1, total: 0 }

  const showMessage = (msg: string, type: 'success' | 'danger' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.pages) {
      setCurrentPage(page)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete scanner "${name}"?`)) return

    try {
      await deleteScanner(id).unwrap()
      showMessage('Scanner deleted successfully!', 'success')
      refetch()
    } catch (error: any) {
      console.error('Delete failed:', error)
      showMessage(error?.data?.message || 'Failed to delete scanner', 'danger')
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      const result = await toggleStatus(id).unwrap()
      showMessage(result.message || 'Status updated!', 'success')
      refetch()
    } catch (error: any) {
      console.error('Toggle failed:', error)
      showMessage(error?.data?.message || 'Failed to update status', 'danger')
    }
  }

  const openEditModal = (scanner: any) => {
    setEditingScanner(scanner)
    setEditForm({
      name: scanner.name,
      phone: scanner.phone || '',
      notes: scanner.notes || '',
      password: '',
    })
    setSelectedEvents(
      scanner.allowedEvents?.map((e: any) => (typeof e === 'string' ? e : e._id)) || []
    )
    setShowEditModal(true)
  }

  const handleEventToggle = (eventId: string) => {
    setSelectedEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    )
  }

  const handleUpdate = async () => {
    if (!editingScanner) return

    try {
      const updateData: any = {
        id: editingScanner._id,
        name: editForm.name,
        phone: editForm.phone,
        notes: editForm.notes,
        allowedEvents: selectedEvents,
      }
      if (editForm.password) {
        updateData.password = editForm.password
      }

      await updateScanner(updateData).unwrap()
      showMessage('Scanner updated successfully!', 'success')
      setShowEditModal(false)
      refetch()
    } catch (error: any) {
      console.error('Update failed:', error)
      showMessage(error?.data?.message || 'Failed to update scanner', 'danger')
    }
  }

  if (isLoading) return <div className="text-center py-5">Loading...</div>
  if (isError) return <div className="alert alert-danger">Error loading scanners</div>

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
              <CardTitle as="h4" className="mb-0">
                Scanner Accounts
              </CardTitle>

              <div className="d-flex align-items-center gap-2 ms-auto">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="form-control form-control-sm"
                  style={{ maxWidth: 200 }}
                />
              </div>

              <Link href="/ticket-scanner/add" className="btn btn-sm btn-success">
                + Add Scanner
              </Link>
            </CardHeader>

            <div className="table-responsive">
              <table className="table align-middle mb-0 table-hover table-centered table-bordered">
                <thead className="bg-light-subtle">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Events Access</th>
                    <th>Total Scans</th>
                    <th>Last Active</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {scanners.map((scanner: any) => (
                    <tr key={scanner._id}>
                      <td>
                        <strong>{scanner.name}</strong>
                      </td>
                      <td>{scanner.email}</td>
                      <td>{scanner.phone || '-'}</td>
                      <td>
                        {scanner.allowedEvents?.length > 0 ? (
                          <Badge bg="info">{scanner.allowedEvents.length} Events</Badge>
                        ) : (
                          <Badge bg="secondary">All Events</Badge>
                        )}
                      </td>
                      <td>
                        <Badge bg="primary">{scanner.totalScans || 0}</Badge>
                      </td>
                      <td>
                        {scanner.lastScanAt ? (
                          <small>{new Date(scanner.lastScanAt).toLocaleString()}</small>
                        ) : (
                          <small className="text-muted">Never</small>
                        )}
                      </td>
                      <td>
                        <Badge bg={scanner.isActive ? 'success' : 'danger'}>
                          {scanner.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            variant={scanner.isActive ? 'outline-warning' : 'outline-success'}
                            size="sm"
                            onClick={() => handleToggleStatus(scanner._id)}
                            disabled={isToggling}
                            title={scanner.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <IconifyIcon icon={scanner.isActive ? 'solar:pause-broken' : 'solar:play-broken'} />
                          </Button>
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => openEditModal(scanner)}
                            title="Edit"
                          >
                            <IconifyIcon icon="solar:pen-2-broken" />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(scanner._id, scanner.name)}
                            disabled={isDeleting}
                            title="Delete"
                          >
                            <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {scanners.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-4">
                        <p className="mb-2">No scanner accounts found</p>
                        <Link href="/ticket-scanner/add" className="btn btn-sm btn-primary">
                          Create your first scanner
                        </Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {pagination.pages > 1 && (
              <CardFooter className="border-top">
                <nav>
                  <ul className="pagination justify-content-end mb-0">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                        Previous
                      </button>
                    </li>
                    {Array.from({ length: pagination.pages }, (_, i) => (
                      <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(i + 1)}>
                          {i + 1}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === pagination.pages ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </CardFooter>
            )}
          </Card>
        </Col>
      </Row>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Scanner: {editingScanner?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>New Password (leave empty to keep current)</Form.Label>
                <Form.Control
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="Enter new password"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Label>Allowed Events</Form.Label>
              <div className="border rounded p-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <Form.Check
                  type="checkbox"
                  id="edit-all-events"
                  label={<strong>All Events</strong>}
                  checked={selectedEvents.length === 0}
                  onChange={() => setSelectedEvents([])}
                  className="mb-2 pb-2 border-bottom"
                />
                {eventsData.map((event: any) => (
                  <Form.Check
                    key={event._id}
                    type="checkbox"
                    id={`edit-event-${event._id}`}
                    label={event.title}
                    checked={selectedEvents.includes(event._id)}
                    onChange={() => handleEventToggle(event._id)}
                    className="mb-1"
                  />
                ))}
              </div>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdate} disabled={isUpdating}>
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default ScannerList
