'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Container,
  Modal,
  Row,
  Spinner,
  Table,
  Toast,
  ToastContainer,
} from 'react-bootstrap'
import {
  useGetMySubscriptionQuery,
  useCreateRenewalOrderMutation,
  useVerifyRenewalMutation,
  IVendorPackage,
} from '@/store/vendorApi'

declare global {
  interface Window {
    Razorpay?: any
  }
}

const formatDate = (d?: string) => {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return '—'
  }
}

const formatDuration = (duration: number, type: string) =>
  `${duration} ${type.charAt(0).toUpperCase() + type.slice(1)}`

const StatusBadge: React.FC<{ status: 'active' | 'expired' | 'pending_payment' }> = ({ status }) => {
  if (status === 'active') return <Badge bg="success">Active</Badge>
  if (status === 'expired') return <Badge bg="danger">Expired</Badge>
  return <Badge bg="warning" text="dark">Pending Payment</Badge>
}

const MySubscription: React.FC = () => {
  const { data, isLoading, isError, refetch } = useGetMySubscriptionQuery()
  const [createOrder, { isLoading: creatingOrder }] = useCreateRenewalOrderMutation()
  const [verifyRenewal, { isLoading: verifyingRenewal }] = useVerifyRenewalMutation()

  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)
  const [confirmModal, setConfirmModal] = useState<{ show: boolean; pkg: IVendorPackage | null }>({
    show: false,
    pkg: null,
  })
  const [toast, setToast] = useState<{ show: boolean; msg: string; variant: 'success' | 'danger' }>({
    show: false,
    msg: '',
    variant: 'success',
  })

  const showToast = (msg: string, variant: 'success' | 'danger' = 'success') =>
    setToast({ show: true, msg, variant })

  // Load Razorpay script once
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.Razorpay) return
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      try {
        document.body.removeChild(script)
      } catch {}
    }
  }, [])

  // Pre-select the currently subscribed package (if still listed) when data arrives.
  useEffect(() => {
    if (!data?.subscription) return
    const currentPkgId =
      typeof data.subscription.packageId === 'string'
        ? data.subscription.packageId
        : (data.subscription.packageId as any)?._id
    if (currentPkgId) setSelectedPackageId(String(currentPkgId))
    else if (data.packages?.[0]) setSelectedPackageId(data.packages[0]._id)
  }, [data])

  const sub = data?.subscription
  const packages = data?.packages || []

  const isExpired = sub?.status === 'expired'
  const isActive = sub?.status === 'active'

  const selectedPkg = useMemo(
    () => packages.find((p) => p._id === selectedPackageId) || null,
    [packages, selectedPackageId]
  )

  const handleRenewClick = () => {
    if (!selectedPkg) {
      showToast('Please select a package to continue', 'danger')
      return
    }
    setConfirmModal({ show: true, pkg: selectedPkg })
  }

  const handleConfirmPay = async () => {
    const pkg = confirmModal.pkg
    if (!pkg) return
    if (!window.Razorpay) {
      showToast('Payment system not loaded. Please refresh the page.', 'danger')
      return
    }

    try {
      const order = await createOrder({ packageId: pkg._id }).unwrap()

      const options = {
        key: order.keyId,
        amount: order.amount * 100, // paise
        currency: order.currency || 'INR',
        name: 'MovieMart',
        description: `Film Trade Subscription Renewal — ${pkg.name}`,
        order_id: order.razorpayOrderId,
        theme: { color: '#0d6efd' },
        handler: async (response: any) => {
          try {
            await verifyRenewal({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              packageId: pkg._id,
            }).unwrap()

            showToast('Subscription renewed successfully!', 'success')
            setConfirmModal({ show: false, pkg: null })
            refetch()
          } catch (err: any) {
            showToast(err?.data?.message || 'Failed to verify payment', 'danger')
          }
        },
        modal: {
          ondismiss: () => {
            // user cancelled — nothing to do
          },
        },
      }

      const rz = new window.Razorpay(options)
      rz.open()
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to create renewal order', 'danger')
    }
  }

  if (isLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading subscription…</p>
      </Container>
    )
  }

  if (isError) {
    return (
      <Container className="py-5">
        <Alert variant="danger">Failed to load subscription details.</Alert>
      </Container>
    )
  }

  // Vendor doesn't have film_trade — friendly empty state
  if (!data?.hasFilmTrade) {
    return (
      <Container className="py-4">
        <Card>
          <CardBody>
            <Alert variant="info" className="mb-0">
              You do not have a Film Trade service on your vendor account, so
              there is no subscription to manage. If you would like to add Film
              Trade, please contact support.
            </Alert>
          </CardBody>
        </Card>
      </Container>
    )
  }

  return (
    <Container fluid className="py-3">
      {/* Status Banner */}
      {isExpired && (
        <Alert variant="danger" className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div>
            <strong>Your Film Trade subscription has expired.</strong>
            <div className="small">
              {sub?.daysOverdue ? `Expired ${sub.daysOverdue} day${sub.daysOverdue === 1 ? '' : 's'} ago. ` : ''}
              Your films are hidden from the public site and you can&apos;t add new movies until you renew.
            </div>
          </div>
        </Alert>
      )}
      {isActive && sub?.daysRemaining !== null && sub?.daysRemaining! <= 7 && (
        <Alert variant="warning">
          Your Film Trade subscription expires in <strong>{sub?.daysRemaining}</strong> day
          {sub?.daysRemaining === 1 ? '' : 's'}. Renew now to avoid disruption.
        </Alert>
      )}

      <Row className="g-3">
        {/* Current Subscription */}
        <Col lg={5}>
          <Card className="h-100">
            <CardHeader className="d-flex align-items-center justify-content-between">
              <CardTitle as="h5" className="mb-0">Current Subscription</CardTitle>
              {sub && <StatusBadge status={sub.status} />}
            </CardHeader>
            <CardBody>
              <dl className="row mb-0">
                <dt className="col-sm-5 text-muted">Package</dt>
                <dd className="col-sm-7">{sub?.packageName || '—'}</dd>

                <dt className="col-sm-5 text-muted">Started On</dt>
                <dd className="col-sm-7">{formatDate(sub?.subscriptionStart)}</dd>

                <dt className="col-sm-5 text-muted">Expires On</dt>
                <dd className="col-sm-7">{formatDate(sub?.subscriptionEnd)}</dd>

                <dt className="col-sm-5 text-muted">Last Renewed</dt>
                <dd className="col-sm-7">{formatDate(sub?.lastRenewedAt)}</dd>

                <dt className="col-sm-5 text-muted">Days Remaining</dt>
                <dd className="col-sm-7">
                  {sub?.daysRemaining !== null && sub?.daysRemaining !== undefined
                    ? `${sub.daysRemaining} day${sub.daysRemaining === 1 ? '' : 's'}`
                    : sub?.daysOverdue
                    ? <span className="text-danger">Overdue by {sub.daysOverdue} day{sub.daysOverdue === 1 ? '' : 's'}</span>
                    : '—'}
                </dd>
              </dl>
            </CardBody>
          </Card>
        </Col>

        {/* Renew / Choose Plan */}
        <Col lg={7}>
          <Card className="h-100">
            <CardHeader>
              <CardTitle as="h5" className="mb-0">
                {isExpired ? 'Renew Your Subscription' : 'Renew or Change Plan'}
              </CardTitle>
            </CardHeader>
            <CardBody>
              {packages.length === 0 ? (
                <Alert variant="info" className="mb-0">
                  No active packages available. Please contact support.
                </Alert>
              ) : (
                <>
                  <Row className="g-3">
                    {packages.map((pkg) => {
                      const isSelected = selectedPackageId === pkg._id
                      return (
                        <Col md={6} key={pkg._id}>
                          <Card
                            role="button"
                            onClick={() => setSelectedPackageId(pkg._id)}
                            className={`h-100 border ${
                              isSelected ? 'border-primary border-2 shadow-sm' : ''
                            }`}>
                            <CardBody>
                              <div className="d-flex align-items-start justify-content-between">
                                <div>
                                  <h6 className="mb-1">{pkg.name}</h6>
                                  <div className="text-muted small">
                                    {formatDuration(pkg.duration, pkg.durationType)}
                                  </div>
                                </div>
                                {pkg.isPopular && <Badge bg="warning" text="dark">Popular</Badge>}
                              </div>
                              <h4 className="mt-2 mb-2">₹{pkg.price.toLocaleString()}</h4>
                              {pkg.description && (
                                <p className="text-muted small mb-2">{pkg.description}</p>
                              )}
                              {pkg.features?.length > 0 && (
                                <ul className="ps-3 mb-0 small">
                                  {pkg.features.slice(0, 4).map((f, i) => (
                                    <li key={i}>{f}</li>
                                  ))}
                                </ul>
                              )}
                            </CardBody>
                          </Card>
                        </Col>
                      )
                    })}
                  </Row>
                  <div className="text-end mt-3">
                    <Button
                      variant={isExpired ? 'danger' : 'primary'}
                      disabled={!selectedPkg || creatingOrder || verifyingRenewal}
                      onClick={handleRenewClick}>
                      {creatingOrder
                        ? 'Creating Order…'
                        : isExpired
                        ? `Renew Now — ₹${selectedPkg?.price.toLocaleString() || ''}`
                        : `Pay & Extend — ₹${selectedPkg?.price.toLocaleString() || ''}`}
                    </Button>
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Payment History */}
      <Card className="mt-3">
        <CardHeader>
          <CardTitle as="h5" className="mb-0">Payment History</CardTitle>
        </CardHeader>
        <CardBody className="p-0">
          {(sub?.paymentHistory || []).length === 0 ? (
            <div className="p-4 text-center text-muted">No payments yet.</div>
          ) : (
            <Table responsive striped hover className="mb-0">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Package</th>
                  <th>Period</th>
                  <th className="text-end">Amount</th>
                  <th>Status</th>
                  <th>Transaction</th>
                </tr>
              </thead>
              <tbody>
                {(sub?.paymentHistory || []).map((p, idx) => (
                  <tr key={idx}>
                    <td>{formatDate(p.paidAt)}</td>
                    <td className="text-capitalize">{p.type}</td>
                    <td>{p.packageName || '—'}</td>
                    <td className="small text-muted">
                      {formatDate(p.periodStart)} → {formatDate(p.periodEnd)}
                    </td>
                    <td className="text-end">₹{p.amount?.toLocaleString() || 0}</td>
                    <td>
                      <Badge bg={p.status === 'completed' ? 'success' : p.status === 'failed' ? 'danger' : 'warning'}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="small">
                      <code>{p.transactionId || '—'}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Confirm modal */}
      <Modal
        show={confirmModal.show}
        onHide={() => setConfirmModal({ show: false, pkg: null })}
        centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Renewal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {confirmModal.pkg && (
            <>
              <p className="mb-2">
                You are about to renew your <strong>Film Trade</strong> subscription with the
                <strong> {confirmModal.pkg.name}</strong> plan.
              </p>
              <ul className="mb-3">
                <li>Duration: {formatDuration(confirmModal.pkg.duration, confirmModal.pkg.durationType)}</li>
                <li>Amount: ₹{confirmModal.pkg.price.toLocaleString()}</li>
              </ul>
              <p className="text-muted small mb-0">
                {isActive
                  ? 'The new period starts at the end of your current subscription.'
                  : 'A new subscription period starts immediately upon successful payment.'}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setConfirmModal({ show: false, pkg: null })}
            disabled={creatingOrder || verifyingRenewal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmPay}
            disabled={creatingOrder || verifyingRenewal}>
            {creatingOrder ? 'Opening Razorpay…' : 'Proceed to Pay'}
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg={toast.variant}
          show={toast.show}
          onClose={() => setToast((s) => ({ ...s, show: false }))}
          delay={4000}
          autohide>
          <Toast.Body className="text-white">{toast.msg}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  )
}

export default MySubscription
