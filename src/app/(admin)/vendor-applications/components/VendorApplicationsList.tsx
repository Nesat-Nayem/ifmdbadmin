'use client'

import { useGetVendorApplicationsQuery, useApproveVendorApplicationMutation, useRejectVendorApplicationMutation, IVendorApplication } from '@/store/vendorApi'
import React, { useState } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Container, Badge, Modal, Spinner, Table, Form } from 'react-bootstrap'
import { Toast, ToastContainer } from 'react-bootstrap'

interface Props {
  status?: 'pending' | 'approved' | 'rejected'
}

const VendorApplicationsList = ({ status }: Props) => {
  const { data: applications = [], isLoading, isError, refetch } = useGetVendorApplicationsQuery(status ? { status } : undefined)
  const [approveApp] = useApproveVendorApplicationMutation()
  const [rejectApp] = useRejectVendorApplicationMutation()
  
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success')
  
  const [viewModal, setViewModal] = useState<{ show: boolean; app: IVendorApplication | null }>({ show: false, app: null })
  const [rejectModal, setRejectModal] = useState<{ show: boolean; app: IVendorApplication | null }>({ show: false, app: null })
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)

  const showMessage = (msg: string, type: 'success' | 'danger' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const handleApprove = async (id: string) => {
    setProcessing(true)
    try {
      await approveApp(id).unwrap()
      showMessage('Application approved! Credentials sent to vendor email.')
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
            <CardTitle as="h4">📋 {status === 'pending' ? 'Pending' : 'All'} Vendor Applications</CardTitle>
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
                      <td>{getStatusBadge(app.status)}</td>
                      <td><small>{new Date(app.createdAt).toLocaleDateString()}</small></td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button size="sm" variant="outline-primary" onClick={() => setViewModal({ show: true, app })}>
                            View
                          </Button>
                          {app.status === 'pending' && (
                            <>
                              <Button size="sm" variant="success" onClick={() => handleApprove(app._id)} disabled={processing}>
                                ✓
                              </Button>
                              <Button size="sm" variant="danger" onClick={() => setRejectModal({ show: true, app })}>
                                ✕
                              </Button>
                            </>
                          )}
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
                <div className="col-md-6"><strong>PAN:</strong> {viewModal.app.panNumber}</div>
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
                {viewModal.app.aadharFrontUrl && <img src={viewModal.app.aadharFrontUrl} alt="Aadhar Front" style={{ height: 100, borderRadius: 8 }} />}
                {viewModal.app.aadharBackUrl && <img src={viewModal.app.aadharBackUrl} alt="Aadhar Back" style={{ height: 100, borderRadius: 8 }} />}
                {viewModal.app.panImageUrl && <img src={viewModal.app.panImageUrl} alt="PAN" style={{ height: 100, borderRadius: 8 }} />}
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
              <Button variant="success" onClick={() => handleApprove(viewModal.app!._id)} disabled={processing}>
                {processing ? 'Approving...' : 'Approve & Send Credentials'}
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={() => setViewModal({ show: false, app: null })}>Close</Button>
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

      <ToastContainer className="p-3" position="top-end" style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default VendorApplicationsList
