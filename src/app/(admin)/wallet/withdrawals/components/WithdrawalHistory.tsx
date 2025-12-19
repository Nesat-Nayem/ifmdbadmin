'use client'

import React, { useState } from 'react'
import {
  Container,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Table,
  Badge,
  Button,
  Spinner,
  Form,
  Row,
  Col,
  Pagination,
  Modal,
  Alert,
} from 'react-bootstrap'
import { useGetMyWithdrawalsQuery, useCancelWithdrawalMutation } from '@/store/walletApi'

const WithdrawalHistory = () => {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<string | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null)

  const { data, isLoading, isError, refetch } = useGetMyWithdrawalsQuery({
    page,
    limit: 20,
    status: statusFilter || undefined,
  })

  const [cancelWithdrawal, { isLoading: isCancelling }] = useCancelWithdrawalMutation()

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

  const handleCancelWithdrawal = async () => {
    if (!selectedWithdrawal) return

    try {
      await cancelWithdrawal(selectedWithdrawal).unwrap()
      setMessage({ type: 'success', text: 'Withdrawal request cancelled successfully!' })
      setShowCancelModal(false)
      setSelectedWithdrawal(null)
      refetch()
    } catch (err: any) {
      setMessage({ type: 'danger', text: err?.data?.message || 'Failed to cancel withdrawal' })
    }
  }

  if (isLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading withdrawal history...</p>
      </Container>
    )
  }

  if (isError) {
    return (
      <Container className="text-center py-5">
        <p className="text-danger">Failed to load withdrawal history</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </Container>
    )
  }

  const withdrawals = data?.data || []
  const meta = data?.meta

  return (
    <Container>
      {message && (
        <Alert variant={message.type} dismissible onClose={() => setMessage(null)} className="mb-4">
          {message.text}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <Row className="align-items-center">
            <Col>
              <CardTitle as="h5" className="mb-0">Withdrawal History</CardTitle>
            </Col>
            <Col md={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
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
          {withdrawals.length > 0 ? (
            <>
              <Table responsive hover>
                <thead className="table-light">
                  <tr>
                    <th>Request Date</th>
                    <th>Amount</th>
                    <th>Bank Details</th>
                    <th>Status</th>
                    <th>Processed Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((withdrawal) => (
                    <tr key={withdrawal._id}>
                      <td>{formatDate(withdrawal.createdAt)}</td>
                      <td className="fw-bold">{formatCurrency(withdrawal.amount)}</td>
                      <td>
                        <small>
                          {withdrawal.bankDetails.bankName}<br />
                          A/C: ****{withdrawal.bankDetails.accountNumber?.slice(-4)}<br />
                          IFSC: {withdrawal.bankDetails.ifscCode}
                        </small>
                      </td>
                      <td>{getStatusBadge(withdrawal.status)}</td>
                      <td>
                        {withdrawal.processedAt ? formatDate(withdrawal.processedAt) : '-'}
                        {withdrawal.failureReason && (
                          <small className="d-block text-danger">{withdrawal.failureReason}</small>
                        )}
                      </td>
                      <td>
                        {withdrawal.status === 'pending' && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => {
                              setSelectedWithdrawal(withdrawal._id)
                              setShowCancelModal(true)
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                        {withdrawal.gatewayTransactionId && (
                          <small className="d-block text-muted mt-1">
                            Txn: {withdrawal.gatewayTransactionId}
                          </small>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <small className="text-muted">
                    Showing {(page - 1) * 20 + 1} - {Math.min(page * 20, meta.total)} of {meta.total}
                  </small>
                  <Pagination className="mb-0">
                    <Pagination.First onClick={() => setPage(1)} disabled={page === 1} />
                    <Pagination.Prev onClick={() => setPage(page - 1)} disabled={page === 1} />
                    {[...Array(Math.min(5, meta.totalPages))].map((_, i) => {
                      const pageNum = Math.max(1, Math.min(page - 2, meta.totalPages - 4)) + i
                      if (pageNum > meta.totalPages) return null
                      return (
                        <Pagination.Item
                          key={pageNum}
                          active={pageNum === page}
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum}
                        </Pagination.Item>
                      )
                    })}
                    <Pagination.Next onClick={() => setPage(page + 1)} disabled={page === meta.totalPages} />
                    <Pagination.Last onClick={() => setPage(meta.totalPages)} disabled={page === meta.totalPages} />
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-inbox fs-1 text-muted"></i>
              <p className="text-muted mt-2">No withdrawal requests found</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Cancel Confirmation Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Withdrawal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to cancel this withdrawal request?</p>
          <p className="text-muted small">
            The amount will be refunded to your wallet balance immediately.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            No, Keep It
          </Button>
          <Button variant="danger" onClick={handleCancelWithdrawal} disabled={isCancelling}>
            {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default WithdrawalHistory
