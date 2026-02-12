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
  Button,
  Table,
  Badge,
  Modal,
  Form,
  Spinner,
  Alert,
} from 'react-bootstrap'
import {
  useGetWalletStatsQuery,
  useUpdateBankDetailsMutation,
  IBankDetails,
} from '@/store/walletApi'

const VendorWalletDashboard = () => {
  const { data: stats, isLoading, isError, refetch } = useGetWalletStatsQuery()
  const [updateBankDetails, { isLoading: isUpdatingBank }] = useUpdateBankDetailsMutation()

  const [showBankModal, setShowBankModal] = useState(false)
  const [bankForm, setBankForm] = useState<IBankDetails>({
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    branchName: '',
    upiId: '',
  })
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null)

  React.useEffect(() => {
    if (stats?.wallet?.bankDetails) {
      setBankForm({
        accountHolderName: stats.wallet.bankDetails.accountHolderName || '',
        accountNumber: stats.wallet.bankDetails.accountNumber || '',
        ifscCode: stats.wallet.bankDetails.ifscCode || '',
        bankName: stats.wallet.bankDetails.bankName || '',
        branchName: stats.wallet.bankDetails.branchName || '',
        upiId: stats.wallet.bankDetails.upiId || '',
      })
    }
  }, [stats])

  const handleUpdateBankDetails = async () => {
    try {
      await updateBankDetails(bankForm).unwrap()
      setMessage({ type: 'success', text: 'Bank details updated successfully!' })
      setShowBankModal(false)
      refetch()
    } catch (err: any) {
      setMessage({ type: 'danger', text: err?.data?.message || 'Failed to update bank details' })
    }
  }

  const isRouteVendor = !!stats?.wallet?.razorpayLinkedAccountId

  const getRouteStatusBadge = (status?: string) => {
    switch (status) {
      case 'activated': return <Badge bg="success">Active</Badge>
      case 'created': return <Badge bg="info">Pending Activation</Badge>
      case 'suspended': return <Badge bg="danger">Suspended</Badge>
      case 'failed': return <Badge bg="danger">Setup Failed</Badge>
      case 'pending': return <Badge bg="warning">Pending</Badge>
      default: return <Badge bg="secondary">Not Connected</Badge>
    }
  }

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

  const getTransactionTypeBadge = (type: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      credit: { bg: 'success', text: 'Credit' },
      debit: { bg: 'danger', text: 'Debit' },
      pending_credit: { bg: 'warning', text: 'Pending' },
      pending_to_available: { bg: 'info', text: 'Released' },
      platform_fee: { bg: 'secondary', text: 'Platform Fee' },
    }
    const badge = badges[type] || { bg: 'secondary', text: type }
    return <Badge bg={badge.bg}>{badge.text}</Badge>
  }

  if (isLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading wallet...</p>
      </Container>
    )
  }

  if (isError || !stats) {
    return (
      <Container className="text-center py-5">
        <p className="text-danger">Failed to load wallet data</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </Container>
    )
  }

  const hasBankDetails = stats.wallet.bankDetails?.accountNumber && stats.wallet.bankDetails?.ifscCode

  return (
    <Container>
      {message && (
        <Alert variant={message.type} dismissible onClose={() => setMessage(null)} className="mb-4">
          {message.text}
        </Alert>
      )}

      {/* Wallet Balance Cards */}
      <Row className="g-4 mb-4">
        <Col md={6} lg={3}>
          <Card className="h-100 border-success">
            <CardBody>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1">Available Balance</p>
                  <h3 className="text-success mb-0">{formatCurrency(stats.wallet.balance)}</h3>
                </div>
                <div className="bg-success bg-opacity-10 rounded-circle p-3">
                  <i className="bi bi-wallet2 fs-3 text-success"></i>
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
                  <p className="text-muted mb-1">Pending (7-day hold)</p>
                  <h3 className="text-warning mb-0">{formatCurrency(stats.wallet.pendingBalance)}</h3>
                </div>
                <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                  <i className="bi bi-clock-history fs-3 text-warning"></i>
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
                  <p className="text-muted mb-1">Total Earnings</p>
                  <h3 className="text-primary mb-0">{formatCurrency(stats.wallet.totalEarnings)}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                  <i className="bi bi-graph-up-arrow fs-3 text-primary"></i>
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
                  <p className="text-muted mb-1">Total Withdrawn</p>
                  <h3 className="text-info mb-0">{formatCurrency(stats.wallet.totalWithdrawn)}</h3>
                </div>
                <div className="bg-info bg-opacity-10 rounded-circle p-3">
                  <i className="bi bi-bank fs-3 text-info"></i>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Earnings Period Cards */}
      <Row className="g-4 mb-4">
        <Col md={6} lg={3}>
          <Card className="h-100">
            <CardBody className="text-center">
              <p className="text-muted mb-2">Today</p>
              <h4 className="mb-0">{formatCurrency(stats.earnings.daily)}</h4>
            </CardBody>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="h-100">
            <CardBody className="text-center">
              <p className="text-muted mb-2">This Week</p>
              <h4 className="mb-0">{formatCurrency(stats.earnings.weekly)}</h4>
            </CardBody>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="h-100">
            <CardBody className="text-center">
              <p className="text-muted mb-2">This Month</p>
              <h4 className="mb-0">{formatCurrency(stats.earnings.monthly)}</h4>
            </CardBody>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="h-100">
            <CardBody className="text-center">
              <p className="text-muted mb-2">This Year</p>
              <h4 className="mb-0">{formatCurrency(stats.earnings.yearly)}</h4>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Earnings by Service */}
      {Object.keys(stats.earningsByService).length > 0 && (
        <Row className="g-4 mb-4">
          <Col lg={6}>
            <Card className="h-100">
              <CardHeader>
                <CardTitle as="h5" className="mb-0">Earnings by Service</CardTitle>
              </CardHeader>
              <CardBody>
                <Table responsive bordered className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Service</th>
                      <th>Total Earnings</th>
                      <th>Transactions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.earningsByService).map(([service, data]) => (
                      <tr key={service}>
                        <td>
                          {service === 'events' && '🎭 Events'}
                          {service === 'movie_watch' && '🎬 Movie Watch'}
                          {service === 'film_trade' && '🎥 Film Trade'}
                          {!['events', 'movie_watch', 'film_trade'].includes(service) && service}
                        </td>
                        <td className="text-success fw-bold">{formatCurrency(data.total)}</td>
                        <td>{data.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>

          {/* Bank Details & Route Status */}
          <Col lg={6}>
            <Card className="h-100">
              <CardHeader className="d-flex justify-content-between align-items-center">
                <CardTitle as="h5" className="mb-0">Bank Details & Payment Setup</CardTitle>
                <Button variant="outline-primary" size="sm" onClick={() => setShowBankModal(true)}>
                  {hasBankDetails ? 'Update' : 'Add'} Bank Details
                </Button>
              </CardHeader>
              <CardBody>
                {hasBankDetails ? (
                  <div>
                    <p><strong>Account Holder:</strong> {stats.wallet.bankDetails?.accountHolderName}</p>
                    <p><strong>Account Number:</strong> ****{stats.wallet.bankDetails?.accountNumber?.slice(-4)}</p>
                    <p><strong>IFSC Code:</strong> {stats.wallet.bankDetails?.ifscCode}</p>
                    <p><strong>Bank:</strong> {stats.wallet.bankDetails?.bankName}</p>
                    {stats.wallet.bankDetails?.upiId && (
                      <p><strong>UPI ID:</strong> {stats.wallet.bankDetails?.upiId}</p>
                    )}
                    <hr />
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <strong>Route Payment Status:</strong>
                      {getRouteStatusBadge(stats.wallet.razorpayAccountStatus)}
                    </div>
                    {isRouteVendor ? (
                      <Alert variant="success" className="mb-0 mt-3">
                        <small>
                          <strong>Automatic Settlements Enabled</strong><br />
                          Your earnings from events and movie purchases are automatically transferred
                          to your bank account after the hold period. No manual withdrawal needed.
                        </small>
                      </Alert>
                    ) : (
                      <Alert variant="info" className="mb-0 mt-3">
                        <small>
                          <strong>Tip:</strong> Update your bank details to enable Razorpay Route
                          automatic settlements. Your earnings will be directly sent to your bank account.
                        </small>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="bi bi-bank fs-1 text-muted"></i>
                    <p className="text-muted mt-2">No bank details added yet</p>
                    <p className="text-muted small">
                      Add your bank details to enable automatic payment settlements via Razorpay Route
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <CardTitle as="h5" className="mb-0">Recent Transactions</CardTitle>
          <Button variant="outline-primary" size="sm" href="/wallet/transactions">
            View All
          </Button>
        </CardHeader>
        <CardBody>
          {stats.recentTransactions.length > 0 ? (
            <Table responsive hover>
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Net Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTransactions.map((txn) => (
                  <tr key={txn._id}>
                    <td>{formatDate(txn.createdAt)}</td>
                    <td>
                      {txn.description}
                      {txn.metadata?.itemTitle && (
                        <small className="d-block text-muted">{txn.metadata.itemTitle}</small>
                      )}
                      {txn.metadata?.isGovernmentEvent && (
                        <Badge bg="success" className="ms-1">🏛️ Govt Event</Badge>
                      )}
                      {txn.metadata?.platformFeePercentage && (
                        <small className="d-block text-info">Fee: {txn.metadata.platformFeePercentage}%</small>
                      )}
                    </td>
                    <td>{getTransactionTypeBadge(txn.type)}</td>
                    <td>{formatCurrency(txn.amount)}</td>
                    <td className={txn.type === 'debit' ? 'text-danger' : 'text-success'}>
                      {txn.type === 'debit' ? '-' : '+'}{formatCurrency(txn.netAmount)}
                    </td>
                    <td>
                      <Badge bg={txn.status === 'completed' ? 'success' : txn.status === 'pending' ? 'warning' : 'danger'}>
                        {txn.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted">No transactions yet</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Bank Details Modal */}
      <Modal show={showBankModal} onHide={() => setShowBankModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Bank Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Account Holder Name *</Form.Label>
              <Form.Control
                type="text"
                value={bankForm.accountHolderName}
                onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Account Number *</Form.Label>
              <Form.Control
                type="text"
                value={bankForm.accountNumber}
                onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>IFSC Code *</Form.Label>
              <Form.Control
                type="text"
                value={bankForm.ifscCode}
                onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Bank Name *</Form.Label>
              <Form.Control
                type="text"
                value={bankForm.bankName}
                onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Branch Name</Form.Label>
              <Form.Control
                type="text"
                value={bankForm.branchName}
                onChange={(e) => setBankForm({ ...bankForm, branchName: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>UPI ID (Optional)</Form.Label>
              <Form.Control
                type="text"
                value={bankForm.upiId}
                onChange={(e) => setBankForm({ ...bankForm, upiId: e.target.value })}
                placeholder="yourname@upi"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBankModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateBankDetails}
            disabled={isUpdatingBank || !bankForm.accountHolderName || !bankForm.accountNumber || !bankForm.ifscCode || !bankForm.bankName}
          >
            {isUpdatingBank ? 'Saving...' : 'Save Bank Details'}
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  )
}

export default VendorWalletDashboard
