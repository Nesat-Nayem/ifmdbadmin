'use client'

import React, { useState } from 'react'
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Table,
  Badge,
  Button,
  Spinner,
  Form,
  Modal,
  Alert,
  Pagination,
} from 'react-bootstrap'
import {
  useGetAdminWalletStatsQuery,
  useGetAllWithdrawalsQuery,
  useGetAllWalletsQuery,
  useProcessWithdrawalMutation,
} from '@/store/walletApi'

const AdminWalletDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'withdrawals' | 'vendors'>('overview')
  const [withdrawalPage, setWithdrawalPage] = useState(1)
  const [withdrawalStatus, setWithdrawalStatus] = useState('')
  const [vendorPage, setVendorPage] = useState(1)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null)
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [processForm, setProcessForm] = useState({
    status: 'completed',
    gatewayTransactionId: '',
    adminNotes: '',
    failureReason: '',
  })
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null)

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useGetAdminWalletStatsQuery()
  const { data: withdrawalsData, isLoading: withdrawalsLoading, refetch: refetchWithdrawals } = useGetAllWithdrawalsQuery({
    page: withdrawalPage,
    limit: 20,
    status: withdrawalStatus || undefined,
  })
  const { data: vendorsData, isLoading: vendorsLoading } = useGetAllWalletsQuery({
    page: vendorPage,
    limit: 20,
    userType: 'vendor',
  })

  const [processWithdrawal, { isLoading: isProcessing }] = useProcessWithdrawalMutation()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      pending: { bg: 'warning', text: 'Pending' },
      processing: { bg: 'info', text: 'Processing' },
      completed: { bg: 'success', text: 'Completed' },
      failed: { bg: 'danger', text: 'Failed' },
      cancelled: { bg: 'secondary', text: 'Cancelled' },
    }
    const badge = badges[status] || { bg: 'secondary', text: status }
    return <Badge bg={badge.bg}>{badge.text}</Badge>
  }

  const handleProcessWithdrawal = async () => {
    if (!selectedWithdrawal) return

    try {
      await processWithdrawal({
        id: selectedWithdrawal._id,
        ...processForm,
      }).unwrap()
      setMessage({ type: 'success', text: 'Withdrawal processed successfully!' })
      setShowProcessModal(false)
      setSelectedWithdrawal(null)
      setProcessForm({
        status: 'completed',
        gatewayTransactionId: '',
        adminNotes: '',
        failureReason: '',
      })
      refetchWithdrawals()
      refetchStats()
    } catch (err: any) {
      setMessage({ type: 'danger', text: err?.data?.message || 'Failed to process withdrawal' })
    }
  }

  if (statsLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading admin wallet...</p>
      </Container>
    )
  }

  return (
    <Container>
      {message && (
        <Alert variant={message.type} dismissible onClose={() => setMessage(null)} className="mb-4">
          {message.text}
        </Alert>
      )}

      {/* Tab Navigation */}
      <div className="mb-4">
        <Button
          variant={activeTab === 'overview' ? 'primary' : 'outline-primary'}
          className="me-2"
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </Button>
        <Button
          variant={activeTab === 'withdrawals' ? 'primary' : 'outline-primary'}
          className="me-2"
          onClick={() => setActiveTab('withdrawals')}
        >
          Withdrawal Requests
          {stats && stats.pendingWithdrawals > 0 && (
            <Badge bg="danger" className="ms-2">{stats.pendingWithdrawals}</Badge>
          )}
        </Button>
        <Button
          variant={activeTab === 'vendors' ? 'primary' : 'outline-primary'}
          onClick={() => setActiveTab('vendors')}
        >
          Vendor Wallets
        </Button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <>
          {/* Platform Earnings Cards */}
          <Row className="g-4 mb-4">
            <Col md={6} lg={3}>
              <Card className="h-100 border-success">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1">Total Platform Earnings</p>
                      <h3 className="text-success mb-0">{formatCurrency(stats.totalPlatformEarnings)}</h3>
                    </div>
                    <div className="bg-success bg-opacity-10 rounded-circle p-3">
                      <i className="bi bi-currency-rupee fs-3 text-success"></i>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="h-100 border-primary">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1">Today&apos;s Earnings</p>
                      <h3 className="text-primary mb-0">{formatCurrency(stats.dailyPlatformEarnings)}</h3>
                    </div>
                    <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                      <i className="bi bi-calendar-day fs-3 text-primary"></i>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="h-100 border-info">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1">Monthly Earnings</p>
                      <h3 className="text-info mb-0">{formatCurrency(stats.monthlyPlatformEarnings)}</h3>
                    </div>
                    <div className="bg-info bg-opacity-10 rounded-circle p-3">
                      <i className="bi bi-calendar-month fs-3 text-info"></i>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="h-100 border-warning">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1">Total Vendor Payouts</p>
                      <h3 className="text-warning mb-0">{formatCurrency(stats.totalVendorPayouts)}</h3>
                    </div>
                    <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                      <i className="bi bi-send fs-3 text-warning"></i>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Stats Row */}
          <Row className="g-4 mb-4">
            <Col md={6} lg={4}>
              <Card className="h-100">
                <CardBody className="text-center">
                  <h2 className="mb-1">{stats.totalVendors}</h2>
                  <p className="text-muted mb-0">Total Vendors</p>
                </CardBody>
              </Card>
            </Col>
            <Col md={6} lg={4}>
              <Card className="h-100">
                <CardBody className="text-center">
                  <h2 className="mb-1 text-warning">{stats.pendingWithdrawals}</h2>
                  <p className="text-muted mb-0">Pending Withdrawals</p>
                </CardBody>
              </Card>
            </Col>
            <Col md={12} lg={4}>
              <Card className="h-100">
                <CardBody>
                  <h6 className="mb-3">Earnings by Service</h6>
                  {Object.keys(stats.platformFeeByService).length > 0 ? (
                    <div>
                      {Object.entries(stats.platformFeeByService).map(([service, data]) => (
                        <div key={service} className="d-flex justify-content-between mb-2">
                          <span>
                            {service === 'events' && '🎭 Events'}
                            {service === 'movie_watch' && '🎬 Movie Watch'}
                            {!['events', 'movie_watch'].includes(service) && service}
                          </span>
                          <span className="fw-bold">{formatCurrency(data.total)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted small mb-0">No earnings data yet</p>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* Withdrawals Tab */}
      {activeTab === 'withdrawals' && (
        <Card>
          <CardHeader>
            <Row className="align-items-center">
              <Col>
                <CardTitle as="h5" className="mb-0">Withdrawal Requests</CardTitle>
              </Col>
              <Col md={3}>
                <Form.Select
                  value={withdrawalStatus}
                  onChange={(e) => {
                    setWithdrawalStatus(e.target.value)
                    setWithdrawalPage(1)
                  }}
                  size="sm"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Col>
            </Row>
          </CardHeader>
          <CardBody>
            {withdrawalsLoading ? (
              <div className="text-center py-4">
                <Spinner animation="border" size="sm" />
              </div>
            ) : withdrawalsData?.data && withdrawalsData.data.length > 0 ? (
              <>
                <Table responsive hover>
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Vendor</th>
                      <th>Amount</th>
                      <th>Bank Details</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawalsData.data.map((withdrawal) => {
                      const user = typeof withdrawal.userId === 'object' ? withdrawal.userId : null
                      return (
                        <tr key={withdrawal._id}>
                          <td>{formatDate(withdrawal.createdAt)}</td>
                          <td>
                            {user ? (
                              <>
                                <strong>{user.name}</strong>
                                <small className="d-block text-muted">{user.email}</small>
                              </>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="fw-bold">{formatCurrency(withdrawal.amount)}</td>
                          <td>
                            <small>
                              {withdrawal.bankDetails.accountHolderName}<br />
                              A/C: {withdrawal.bankDetails.accountNumber}<br />
                              IFSC: {withdrawal.bankDetails.ifscCode}<br />
                              {withdrawal.bankDetails.bankName}
                            </small>
                          </td>
                          <td>{getStatusBadge(withdrawal.status)}</td>
                          <td>
                            {(withdrawal.status === 'pending' || withdrawal.status === 'processing') && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  setSelectedWithdrawal(withdrawal)
                                  setShowProcessModal(true)
                                }}
                              >
                                Process
                              </Button>
                            )}
                            {withdrawal.gatewayTransactionId && (
                              <small className="d-block text-muted mt-1">
                                Txn: {withdrawal.gatewayTransactionId}
                              </small>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </Table>

                {withdrawalsData.meta && withdrawalsData.meta.totalPages > 1 && (
                  <div className="d-flex justify-content-end">
                    <Pagination className="mb-0">
                      <Pagination.Prev
                        onClick={() => setWithdrawalPage(withdrawalPage - 1)}
                        disabled={withdrawalPage === 1}
                      />
                      <Pagination.Item active>{withdrawalPage}</Pagination.Item>
                      <Pagination.Next
                        onClick={() => setWithdrawalPage(withdrawalPage + 1)}
                        disabled={withdrawalPage === withdrawalsData.meta!.totalPages}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted">No withdrawal requests found</p>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Vendors Tab */}
      {activeTab === 'vendors' && (
        <Card>
          <CardHeader>
            <CardTitle as="h5" className="mb-0">Vendor Wallets</CardTitle>
          </CardHeader>
          <CardBody>
            {vendorsLoading ? (
              <div className="text-center py-4">
                <Spinner animation="border" size="sm" />
              </div>
            ) : vendorsData?.data && vendorsData.data.length > 0 ? (
              <>
                <Table responsive hover>
                  <thead className="table-light">
                    <tr>
                      <th>Vendor</th>
                      <th>Available Balance</th>
                      <th>Pending Balance</th>
                      <th>Total Earnings</th>
                      <th>Total Withdrawn</th>
                      <th>Route Status</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendorsData.data.map((wallet) => (
                      <tr key={wallet._id}>
                        <td>
                          <strong>{wallet.userId?.name || 'N/A'}</strong>
                          <small className="d-block text-muted">{wallet.userId?.email || ''}</small>
                        </td>
                        <td className="text-success fw-bold">{formatCurrency(wallet.balance)}</td>
                        <td className="text-warning">{formatCurrency(wallet.pendingBalance)}</td>
                        <td>{formatCurrency(wallet.totalEarnings)}</td>
                        <td>{formatCurrency(wallet.totalWithdrawn)}</td>
                        <td>
                          {(wallet as any).razorpayLinkedAccountId ? (
                            <Badge bg={(wallet as any).razorpayAccountStatus === 'activated' ? 'success' : 'warning'}>
                              {(wallet as any).razorpayAccountStatus === 'activated' ? 'Route Active' : 'Route Pending'}
                            </Badge>
                          ) : (
                            <Badge bg="secondary">No Route</Badge>
                          )}
                        </td>
                        <td>
                          <Badge bg={wallet.isActive ? 'success' : 'secondary'}>
                            {wallet.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                {vendorsData.meta && vendorsData.meta.totalPages > 1 && (
                  <div className="d-flex justify-content-end">
                    <Pagination className="mb-0">
                      <Pagination.Prev
                        onClick={() => setVendorPage(vendorPage - 1)}
                        disabled={vendorPage === 1}
                      />
                      <Pagination.Item active>{vendorPage}</Pagination.Item>
                      <Pagination.Next
                        onClick={() => setVendorPage(vendorPage + 1)}
                        disabled={vendorPage === vendorsData.meta!.totalPages}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted">No vendor wallets found</p>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Process Withdrawal Modal */}
      <Modal show={showProcessModal} onHide={() => setShowProcessModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Process Withdrawal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedWithdrawal && (
            <>
              <div className="mb-3 p-3 bg-light rounded">
                <p className="mb-1"><strong>Amount:</strong> {formatCurrency(selectedWithdrawal.amount)}</p>
                <p className="mb-1"><strong>Account:</strong> {selectedWithdrawal.bankDetails.accountNumber}</p>
                <p className="mb-0"><strong>IFSC:</strong> {selectedWithdrawal.bankDetails.ifscCode}</p>
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Status *</Form.Label>
                <Form.Select
                  value={processForm.status}
                  onChange={(e) => setProcessForm({ ...processForm, status: e.target.value })}
                >
                  <option value="processing">Mark as Processing</option>
                  <option value="completed">Mark as Completed</option>
                  <option value="failed">Mark as Failed</option>
                </Form.Select>
              </Form.Group>

              {processForm.status === 'completed' && (
                <Form.Group className="mb-3">
                  <Form.Label>Transaction ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={processForm.gatewayTransactionId}
                    onChange={(e) => setProcessForm({ ...processForm, gatewayTransactionId: e.target.value })}
                    placeholder="Enter bank/gateway transaction ID"
                  />
                </Form.Group>
              )}

              {processForm.status === 'failed' && (
                <Form.Group className="mb-3">
                  <Form.Label>Failure Reason *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={processForm.failureReason}
                    onChange={(e) => setProcessForm({ ...processForm, failureReason: e.target.value })}
                    placeholder="Enter reason for failure"
                  />
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Admin Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={processForm.adminNotes}
                  onChange={(e) => setProcessForm({ ...processForm, adminNotes: e.target.value })}
                  placeholder="Optional notes"
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProcessModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleProcessWithdrawal}
            disabled={isProcessing || (processForm.status === 'failed' && !processForm.failureReason)}
          >
            {isProcessing ? 'Processing...' : 'Update Status'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default AdminWalletDashboard
