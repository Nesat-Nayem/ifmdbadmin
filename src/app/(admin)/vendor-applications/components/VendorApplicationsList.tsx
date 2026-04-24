'use client'

import {
  useGetVendorApplicationsQuery,
  useApproveVendorApplicationMutation,
  useRejectVendorApplicationMutation,
  useDeleteVendorApplicationMutation,
  useBlockVendorApplicationMutation,
  useUnblockVendorApplicationMutation,
  IVendorApplication,
  IVendorUserPopulated,
} from '@/store/vendorApi'
import React, { useState, useMemo } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Container, Badge, Modal, Spinner, Table, Form, InputGroup, Row, Col } from 'react-bootstrap'
import { Toast, ToastContainer } from 'react-bootstrap'

interface Props {
  status?: 'pending' | 'approved' | 'rejected'
}

const VendorApplicationsList = ({ status }: Props) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  
  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const queryParams = useMemo(() => {
    const params: { status?: string; search?: string } = {}
    if (status) params.status = status
    if (debouncedSearch.trim()) params.search = debouncedSearch.trim()
    return Object.keys(params).length > 0 ? params : undefined
  }, [status, debouncedSearch])

  const { data: applications = [], isLoading, isError, refetch } = useGetVendorApplicationsQuery(queryParams)
  const [approveApp] = useApproveVendorApplicationMutation()
  const [rejectApp] = useRejectVendorApplicationMutation()
  const [deleteApp] = useDeleteVendorApplicationMutation()
  const [blockApp] = useBlockVendorApplicationMutation()
  const [unblockApp] = useUnblockVendorApplicationMutation()
  
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success')
  
  const [viewModal, setViewModal] = useState<{ show: boolean; app: IVendorApplication | null }>({ show: false, app: null })
  const [approveModal, setApproveModal] = useState<{ show: boolean; app: IVendorApplication | null }>({ show: false, app: null })
  const [rejectModal, setRejectModal] = useState<{ show: boolean; app: IVendorApplication | null }>({ show: false, app: null })
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; app: IVendorApplication | null }>({ show: false, app: null })
  const [blockModal, setBlockModal] = useState<{ show: boolean; app: IVendorApplication | null }>({ show: false, app: null })
  const [rejectionReason, setRejectionReason] = useState('')
  const [blockReason, setBlockReason] = useState('')
  const [processing, setProcessing] = useState(false)

  // Helper: read the populated user (server populates vendorUserId with block state)
  const getVendorUser = (app: IVendorApplication | null): IVendorUserPopulated | null => {
    if (!app || !app.vendorUserId) return null
    return typeof app.vendorUserId === 'string' ? null : (app.vendorUserId as IVendorUserPopulated)
  }
  const isBlocked = (app: IVendorApplication | null): boolean => !!getVendorUser(app)?.isBlocked

  const showMessage = (msg: string, type: 'success' | 'danger' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const handleApprove = async () => {
    if (!approveModal.app) return
    setProcessing(true)
    try {
      await approveApp(approveModal.app._id).unwrap()
      showMessage('Application approved! Credentials sent to vendor email.')
      setApproveModal({ show: false, app: null })
      setViewModal({ show: false, app: null })
    } catch (err: any) {
      showMessage(err?.data?.message || 'Failed to approve', 'danger')
    }
    setProcessing(false)
  }

  const handleReject = async () => {
    if (!rejectModal.app) return
    setProcessing(true)
    try {
      await rejectApp({ id: rejectModal.app._id, rejectionReason }).unwrap()
      showMessage('Application rejected.')
      setRejectModal({ show: false, app: null })
      setRejectionReason('')
    } catch (err: any) {
      showMessage(err?.data?.message || 'Failed to reject', 'danger')
    }
    setProcessing(false)
  }

  const handleBlock = async () => {
    if (!blockModal.app) return
    setProcessing(true)
    try {
      await blockApp({ id: blockModal.app._id, reason: blockReason.trim() }).unwrap()
      showMessage('Vendor blocked. Their content is now hidden and they cannot log in.')
      setBlockModal({ show: false, app: null })
      setBlockReason('')
    } catch (err: any) {
      showMessage(err?.data?.message || 'Failed to block vendor', 'danger')
    }
    setProcessing(false)
  }

  const handleUnblock = async (app: IVendorApplication) => {
    setProcessing(true)
    try {
      await unblockApp(app._id).unwrap()
      showMessage('Vendor unblocked. Their content and login are restored.')
    } catch (err: any) {
      showMessage(err?.data?.message || 'Failed to unblock vendor', 'danger')
    }
    setProcessing(false)
  }

  const handleDelete = async () => {
    if (!deleteModal.app) return
    setProcessing(true)
    try {
      await deleteApp(deleteModal.app._id).unwrap()
      showMessage(deleteModal.app.status === 'approved' 
        ? 'Application and vendor account deleted successfully!' 
        : 'Application deleted successfully!')
      setDeleteModal({ show: false, app: null })
    } catch (err: any) {
      showMessage(err?.data?.message || 'Failed to delete', 'danger')
    }
    setProcessing(false)
  }

  const getStatusBadge = (s: string) => {
    const variants: Record<string, string> = { pending: 'warning', approved: 'success', rejected: 'danger' }
    return <Badge bg={variants[s] || 'secondary'}>{s.toUpperCase()}</Badge>
  }

  const getServiceBadges = (services: IVendorApplication['selectedServices']) => (
    <div className="d-flex flex-wrap gap-1">
      {services.map((s, i) => {
        const labels: Record<string, { label: string; bg: string }> = {
          film_trade: { label: `Film Trade${s.packageName ? ` (${s.packageName})` : ''}`, bg: 'primary' },
          events: { label: `Events (${s.platformFee}%)`, bg: 'warning' },
          movie_watch: { label: `Movie Watch (${s.platformFee}%)`, bg: 'info' },
        }
        const info = labels[s.serviceType] || { label: s.serviceType, bg: 'secondary' }
        return <Badge key={i} bg={info.bg} className="text-white">{info.label}</Badge>
      })}
    </div>
  )

  if (isLoading) return <Container className="text-center py-5"><Spinner animation="border" /></Container>
  if (isError) return <Container className="text-center py-5"><p className="text-danger">Error loading</p><Button onClick={() => refetch()}>Retry</Button></Container>

  return (
    <>
      <Container>
        <Card>
          <CardHeader>
            <Row className="align-items-center">
              <Col>
                <CardTitle as="h4" className="mb-0">📋 {status === 'pending' ? 'Pending' : 'All'} Vendor Applications</CardTitle>
              </Col>
              <Col md={4}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search by name, email, phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
                      ✕
                    </Button>
                  )}
                </InputGroup>
              </Col>
            </Row>
          </CardHeader>
          <CardBody>
            {applications.length === 0 ? (
              <div className="text-center py-5 text-muted">No applications found.</div>
            ) : (
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Vendor</th>
                    <th>Contact</th>
                    <th>Services</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id}>
                      <td>
                        <strong>{app.vendorName}</strong>
                        <br /><small className="text-muted">{app.businessType}</small>
                      </td>
                      <td>
                        <small>{app.email}</small>
                        <br /><small className="text-muted">{app.phone}</small>
                      </td>
                      <td>{getServiceBadges(app.selectedServices)}</td>
                      <td>
                        {app.totalAmount > 0 ? (
                          <>
                            ₹{app.totalAmount.toLocaleString()}
                            <br />
                            <small className={app.paymentInfo?.status === 'completed' ? 'text-success' : 'text-warning'}>
                              {app.paymentInfo?.status || 'N/A'}
                            </small>
                          </>
                        ) : (
                          <span className="text-muted">Free</span>
                        )}
                      </td>
                      <td>
                        {getStatusBadge(app.status)}
                        {isBlocked(app) && (
                          <Badge bg="dark" className="ms-1" title={getVendorUser(app)?.blockedReason || 'Blocked'}>
                            BLOCKED
                          </Badge>
                        )}
                      </td>
                      <td><small>{new Date(app.createdAt).toLocaleDateString()}</small></td>
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          <Button size="sm" variant="outline-primary" onClick={() => setViewModal({ show: true, app })}>
                            View
                          </Button>
                          {app.status === 'pending' && (
                            <>
                              <Button size="sm" variant="success" onClick={() => setApproveModal({ show: true, app })} disabled={processing} title="Approve">
                                ✓
                              </Button>
                              <Button size="sm" variant="danger" onClick={() => setRejectModal({ show: true, app })}>
                                ✕
                              </Button>
                            </>
                          )}
                          {app.status === 'approved' && (
                            isBlocked(app) ? (
                              <Button
                                size="sm"
                                variant="outline-success"
                                onClick={() => handleUnblock(app)}
                                disabled={processing}
                                title="Unblock vendor"
                              >
                                Unblock
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline-warning"
                                onClick={() => { setBlockReason(''); setBlockModal({ show: true, app }) }}
                                disabled={processing}
                                title="Block vendor"
                              >
                                Block
                              </Button>
                            )
                          )}
                          <Button size="sm" variant="outline-danger" onClick={() => setDeleteModal({ show: true, app })} title="Delete">
                            🗑️
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </CardBody>
        </Card>
      </Container>

      {/* View Modal */}
      <Modal show={viewModal.show} onHide={() => setViewModal({ show: false, app: null })} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Application Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewModal.app && (
            <div>
              <div className="row g-3 mb-4">
                <div className="col-md-6"><strong>Vendor:</strong> {viewModal.app.vendorName}</div>
                <div className="col-md-6"><strong>Business:</strong> {viewModal.app.businessType}</div>
                <div className="col-md-6"><strong>Email:</strong> {viewModal.app.email}</div>
                <div className="col-md-6"><strong>Phone:</strong> {viewModal.app.phone}</div>
                <div className="col-md-6"><strong>Country:</strong> {viewModal.app.country || 'IN'}</div>
                <div className="col-md-6"><strong>GST:</strong> {viewModal.app.gstNumber || 'N/A'}</div>
                <div className="col-12"><strong>Address:</strong> {viewModal.app.address}</div>
              </div>
              
              <h6>Selected Services</h6>
              <div className="mb-3">{getServiceBadges(viewModal.app.selectedServices)}</div>
              
              {viewModal.app.totalAmount > 0 && (
                <div className="bg-light p-3 rounded mb-3">
                  <strong>Total: ₹{viewModal.app.totalAmount.toLocaleString()}</strong>
                  <span className={`ms-2 badge ${viewModal.app.paymentInfo?.status === 'completed' ? 'bg-success' : 'bg-warning'}`}>
                    {viewModal.app.paymentInfo?.status || 'pending'}
                  </span>
                </div>
              )}

              <h6>KYC Documents</h6>
              <div className="d-flex gap-3 flex-wrap">
                {/* India KYC */}
                {viewModal.app.aadharFrontUrl && <div className="text-center"><img src={viewModal.app.aadharFrontUrl} alt="Aadhar Front" style={{ height: 100, borderRadius: 8 }} /><small className="d-block mt-1">Aadhar Front</small></div>}
                {viewModal.app.aadharBackUrl && <div className="text-center"><img src={viewModal.app.aadharBackUrl} alt="Aadhar Back" style={{ height: 100, borderRadius: 8 }} /><small className="d-block mt-1">Aadhar Back</small></div>}
                {viewModal.app.panImageUrl && <div className="text-center"><img src={viewModal.app.panImageUrl} alt="PAN" style={{ height: 100, borderRadius: 8 }} /><small className="d-block mt-1">PAN Card</small></div>}
                {/* International KYC */}
                {viewModal.app.nationalIdUrl && <div className="text-center"><img src={viewModal.app.nationalIdUrl} alt="National ID" style={{ height: 100, borderRadius: 8 }} /><small className="d-block mt-1">National ID</small></div>}
                {viewModal.app.passportUrl && <div className="text-center"><img src={viewModal.app.passportUrl} alt="Passport" style={{ height: 100, borderRadius: 8 }} /><small className="d-block mt-1">Passport</small></div>}
                {/* No documents */}
                {!viewModal.app.aadharFrontUrl && !viewModal.app.aadharBackUrl && !viewModal.app.panImageUrl && !viewModal.app.nationalIdUrl && !viewModal.app.passportUrl && <span className="text-muted">No documents uploaded</span>}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {viewModal.app?.status === 'pending' && (
            <>
              <Button variant="danger" onClick={() => { setViewModal({ show: false, app: null }); setRejectModal({ show: true, app: viewModal.app }); }}>
                Reject
              </Button>
              <Button
                variant="success"
                onClick={() => { const app = viewModal.app; setViewModal({ show: false, app: null }); setApproveModal({ show: true, app }); }}
                disabled={processing}
              >
                Approve & Send Credentials
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={() => setViewModal({ show: false, app: null })}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Approve Confirmation Modal */}
      <Modal show={approveModal.show} onHide={() => !processing && setApproveModal({ show: false, app: null })} centered>
        <Modal.Header closeButton>
          <Modal.Title>Approve Application</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {approveModal.app && (
            <div>
              <p>
                Are you sure you want to approve <strong>{approveModal.app.vendorName}</strong>
                {approveModal.app.email ? <> (<small>{approveModal.app.email}</small>)</> : null}?
              </p>
              <ul className="mb-0">
                <li>A vendor account will be created (if not already).</li>
                <li>Login credentials will be emailed to the vendor.</li>
                <li>Their content will become visible on the frontend.</li>
              </ul>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setApproveModal({ show: false, app: null })} disabled={processing}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleApprove} disabled={processing}>
            {processing ? 'Approving...' : 'Yes, Approve & Send Credentials'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reject Modal */}
      <Modal show={rejectModal.show} onHide={() => setRejectModal({ show: false, app: null })} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reject Application</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Reason for rejection</Form.Label>
            <Form.Control as="textarea" rows={3} value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Enter reason..." />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setRejectModal({ show: false, app: null })}>Cancel</Button>
          <Button variant="danger" onClick={handleReject} disabled={processing || !rejectionReason}>
            {processing ? 'Rejecting...' : 'Reject Application'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Block Confirmation Modal */}
      <Modal show={blockModal.show} onHide={() => setBlockModal({ show: false, app: null })} centered>
        <Modal.Header closeButton>
          <Modal.Title>Block Vendor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {blockModal.app && (
            <div>
              <p>
                You are about to block <strong>{blockModal.app.vendorName}</strong> (
                <small>{blockModal.app.email}</small>). While blocked:
              </p>
              <ul className="mb-3">
                <li>All of their <strong>Events</strong>, <strong>Film Trade</strong> and <strong>Watch Movie</strong> content will be hidden from the frontend.</li>
                <li>They will <strong>not be able to log in</strong> to the admin panel.</li>
              </ul>
              <Form.Group>
                <Form.Label>Reason (optional, shown to the vendor at login)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="e.g. Repeated policy violations"
                />
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setBlockModal({ show: false, app: null })} disabled={processing}>Cancel</Button>
          <Button variant="warning" onClick={handleBlock} disabled={processing}>
            {processing ? 'Blocking...' : 'Block Vendor'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={deleteModal.show} onHide={() => setDeleteModal({ show: false, app: null })} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Application</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteModal.app && (
            <div>
              <p>Are you sure you want to delete the application for <strong>{deleteModal.app.vendorName}</strong>?</p>
              {deleteModal.app.status === 'approved' && (
                <div className="alert alert-warning">
                  <strong>Warning:</strong> This vendor has been approved. Deleting will also remove their vendor account and they will no longer be able to log in.
                </div>
              )}
              {deleteModal.app.status === 'pending' && (
                <p className="text-muted">This application has not been approved yet, so no user account will be affected.</p>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteModal({ show: false, app: null })}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} disabled={processing}>
            {processing ? 'Deleting...' : 'Delete Application'}
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer className="p-3" position="top-end" style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default VendorApplicationsList
