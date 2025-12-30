'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import React, { useState } from 'react'
import { Card, CardFooter, CardHeader, CardTitle, Col, Row, Badge, Form } from 'react-bootstrap'
import { useGetScanLogsQuery, useGetScannerAccountsQuery } from '@/store/scannerApi'
import { useGetEventsQuery } from '@/store/eventsApi'

const ScanLogs = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [filterScanner, setFilterScanner] = useState('')
  const [filterEvent, setFilterEvent] = useState('')
  const [filterResult, setFilterResult] = useState('')

  const { data: response, isLoading, isError } = useGetScanLogsQuery({
    page: currentPage,
    limit: 20,
    scannerId: filterScanner || undefined,
    eventId: filterEvent || undefined,
    scanResult: filterResult || undefined,
  })

  const { data: scannersResponse } = useGetScannerAccountsQuery({ limit: 100 })
  const { data: eventsData = [] } = useGetEventsQuery()

  const logs = response?.data || []
  const pagination = response?.pagination || { page: 1, pages: 1, total: 0 }
  const scanners = scannersResponse?.data || []

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.pages) {
      setCurrentPage(page)
    }
  }

  const getResultBadge = (result: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      valid: { bg: 'success', text: 'Valid' },
      invalid: { bg: 'danger', text: 'Invalid' },
      already_used: { bg: 'warning', text: 'Already Used' },
      not_found: { bg: 'secondary', text: 'Not Found' },
      wrong_event: { bg: 'danger', text: 'Wrong Event' },
      expired: { bg: 'dark', text: 'Expired' },
    }
    const badge = badges[result] || { bg: 'secondary', text: result }
    return <Badge bg={badge.bg}>{badge.text}</Badge>
  }

  const getResultIcon = (result: string) => {
    const icons: Record<string, { icon: string; color: string }> = {
      valid: { icon: 'solar:check-circle-bold', color: 'text-success' },
      invalid: { icon: 'solar:close-circle-bold', color: 'text-danger' },
      already_used: { icon: 'solar:danger-triangle-bold', color: 'text-warning' },
      not_found: { icon: 'solar:question-circle-bold', color: 'text-secondary' },
      wrong_event: { icon: 'solar:shield-cross-bold', color: 'text-danger' },
      expired: { icon: 'solar:clock-circle-bold', color: 'text-dark' },
    }
    const iconData = icons[result] || { icon: 'solar:info-circle-bold', color: 'text-secondary' }
    return <IconifyIcon icon={iconData.icon} className={`fs-4 ${iconData.color}`} />
  }

  if (isLoading) return <div className="text-center py-5">Loading...</div>
  if (isError) return <div className="alert alert-danger">Error loading scan logs</div>

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
              <CardTitle as="h4" className="mb-0">
                Scan Logs
                <Badge bg="primary" className="ms-2">{pagination.total} total</Badge>
              </CardTitle>

              <div className="d-flex align-items-center gap-2 flex-wrap">
                <Form.Select
                  size="sm"
                  value={filterScanner}
                  onChange={(e) => {
                    setFilterScanner(e.target.value)
                    setCurrentPage(1)
                  }}
                  style={{ width: 'auto', minWidth: 150 }}
                >
                  <option value="">All Scanners</option>
                  {scanners.map((s: any) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </Form.Select>

                <Form.Select
                  size="sm"
                  value={filterEvent}
                  onChange={(e) => {
                    setFilterEvent(e.target.value)
                    setCurrentPage(1)
                  }}
                  style={{ width: 'auto', minWidth: 150 }}
                >
                  <option value="">All Events</option>
                  {eventsData.map((e: any) => (
                    <option key={e._id} value={e._id}>{e.title}</option>
                  ))}
                </Form.Select>

                <Form.Select
                  size="sm"
                  value={filterResult}
                  onChange={(e) => {
                    setFilterResult(e.target.value)
                    setCurrentPage(1)
                  }}
                  style={{ width: 'auto', minWidth: 130 }}
                >
                  <option value="">All Results</option>
                  <option value="valid">Valid</option>
                  <option value="invalid">Invalid</option>
                  <option value="already_used">Already Used</option>
                  <option value="not_found">Not Found</option>
                  <option value="wrong_event">Wrong Event</option>
                  <option value="expired">Expired</option>
                </Form.Select>

                {(filterScanner || filterEvent || filterResult) && (
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => {
                      setFilterScanner('')
                      setFilterEvent('')
                      setFilterResult('')
                      setCurrentPage(1)
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </CardHeader>

            <div className="table-responsive">
              <table className="table align-middle mb-0 table-hover table-centered table-bordered">
                <thead className="bg-light-subtle">
                  <tr>
                    <th style={{ width: 50 }}></th>
                    <th>Booking Reference</th>
                    <th>Scanner</th>
                    <th>Event</th>
                    <th>Customer</th>
                    <th>Result</th>
                    <th>Scanned At</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log: any) => (
                    <tr key={log._id}>
                      <td className="text-center">
                        {getResultIcon(log.scanResult)}
                      </td>
                      <td>
                        <code className="text-primary">{log.bookingReference}</code>
                      </td>
                      <td>
                        {typeof log.scannerId === 'object' ? (
                          <div>
                            <strong>{log.scannerId.name}</strong>
                            <br />
                            <small className="text-muted">{log.scannerId.email}</small>
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        {typeof log.eventId === 'object' && log.eventId ? (
                          <span>{log.eventId.title}</span>
                        ) : log.ticketDetails?.eventName ? (
                          <span>{log.ticketDetails.eventName}</span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        {log.ticketDetails?.customerName ? (
                          <div>
                            <span>{log.ticketDetails.customerName}</span>
                            {log.ticketDetails.quantity && (
                              <Badge bg="light" text="dark" className="ms-2">
                                x{log.ticketDetails.quantity}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        {getResultBadge(log.scanResult)}
                        {log.scanMessage && (
                          <div>
                            <small className="text-muted">{log.scanMessage}</small>
                          </div>
                        )}
                      </td>
                      <td>
                        <div>
                          {new Date(log.scannedAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        <small className="text-muted">
                          {new Date(log.scannedAt).toLocaleTimeString()}
                        </small>
                      </td>
                    </tr>
                  ))}

                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-4">
                        <IconifyIcon icon="solar:document-text-broken" className="fs-1 text-muted mb-2 d-block" />
                        <p className="mb-0 text-muted">No scan logs found</p>
                        {(filterScanner || filterEvent || filterResult) && (
                          <small className="text-muted">Try adjusting your filters</small>
                        )}
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
                    {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                      const pageNum = currentPage <= 3 
                        ? i + 1 
                        : currentPage + i - 2
                      if (pageNum > pagination.pages || pageNum < 1) return null
                      return (
                        <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => handlePageChange(pageNum)}>
                            {pageNum}
                          </button>
                        </li>
                      )
                    })}
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

      {/* Stats Summary */}
      <Row className="mt-4">
        <Col md={3}>
          <Card className="border-success">
            <Card.Body className="text-center">
              <IconifyIcon icon="solar:check-circle-bold" className="fs-1 text-success" />
              <h4 className="mt-2 mb-0">Valid Scans</h4>
              <p className="text-muted mb-0">
                {logs.filter((l: any) => l.scanResult === 'valid').length} today
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-warning">
            <Card.Body className="text-center">
              <IconifyIcon icon="solar:danger-triangle-bold" className="fs-1 text-warning" />
              <h4 className="mt-2 mb-0">Already Used</h4>
              <p className="text-muted mb-0">
                {logs.filter((l: any) => l.scanResult === 'already_used').length} attempts
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-danger">
            <Card.Body className="text-center">
              <IconifyIcon icon="solar:close-circle-bold" className="fs-1 text-danger" />
              <h4 className="mt-2 mb-0">Invalid</h4>
              <p className="text-muted mb-0">
                {logs.filter((l: any) => ['invalid', 'wrong_event', 'not_found'].includes(l.scanResult)).length} rejected
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-primary">
            <Card.Body className="text-center">
              <IconifyIcon icon="solar:chart-bold" className="fs-1 text-primary" />
              <h4 className="mt-2 mb-0">Total Scans</h4>
              <p className="text-muted mb-0">
                {pagination.total} records
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default ScanLogs
