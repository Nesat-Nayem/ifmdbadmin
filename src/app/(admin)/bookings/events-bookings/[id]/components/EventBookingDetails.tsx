'use client'

import React from 'react'
import { useGetEventBookingByIdQuery } from '@/store/eventsApi'
import { Card, CardBody, CardHeader, CardTitle, Col, Container, Row, Spinner, Badge, Button } from 'react-bootstrap'
import { useRouter } from 'next/navigation'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

const EventBookingDetails = ({ id }: { id: string }) => {
  const router = useRouter()
  const { data: booking, isLoading, isError } = useGetEventBookingByIdQuery(id)

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  if (isError || !booking) {
    return (
      <div className="text-center text-danger py-5">
        <IconifyIcon icon="solar:danger-triangle-bold" className="fs-1 mb-2" />
        <p>Error loading booking details or booking not found.</p>
        <Button variant="primary" onClick={() => router.push('/bookings/events-bookings')}>
          Back to List
        </Button>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      confirmed: 'success',
      pending: 'warning',
      cancelled: 'danger',
      expired: 'secondary',
      completed: 'success',
      failed: 'danger',
      refunded: 'info',
    }
    return <Badge bg={variants[status] || 'secondary'}>{status.toUpperCase()}</Badge>
  }

  return (
    <Container className="py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="mb-1">Booking Details</h4>
          <p className="text-muted mb-0">Reference: <span className="text-primary fw-bold">{booking.bookingReference}</span></p>
        </div>
        <Button variant="outline-secondary" onClick={() => router.push('/bookings/events-bookings')}>
          <IconifyIcon icon="solar:arrow-left-broken" className="me-1" /> Back to List
        </Button>
      </div>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h5">Event Information</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="d-flex gap-3">
                {booking.eventId?.posterImage && (
                  <img 
                    src={booking.eventId.posterImage} 
                    alt={booking.eventId.title} 
                    className="rounded"
                    style={{ width: 120, height: 160, objectFit: 'cover' }}
                  />
                )}
                <div>
                  <h5 className="mb-2 text-primary">{booking.eventId?.title || 'N/A'}</h5>
                  <p className="mb-1">
                    <IconifyIcon icon="solar:calendar-broken" className="me-2 text-muted" />
                    {booking.eventId?.startDate ? new Date(booking.eventId.startDate).toLocaleDateString('en-GB', {
                      day: '2-digit', month: 'long', year: 'numeric'
                    }) : 'N/A'} at {booking.eventId?.startTime || 'N/A'}
                  </p>
                  <p className="mb-1">
                    <IconifyIcon icon="solar:map-point-broken" className="me-2 text-muted" />
                    {booking.eventId?.location?.venueName}, {booking.eventId?.location?.city}
                  </p>
                  <p className="mb-0">
                    <IconifyIcon icon="solar:ticket-broken" className="me-2 text-muted" />
                    {booking.seatType} - {booking.quantity} Ticket(s)
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle as="h5">Customer Details</CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                <Col md={6} className="mb-3">
                  <label className="text-muted small d-block">Full Name</label>
                  <span className="fw-medium">{booking.customerDetails?.name || 'N/A'}</span>
                </Col>
                <Col md={6} className="mb-3">
                  <label className="text-muted small d-block">Email Address</label>
                  <span className="fw-medium">{booking.customerDetails?.email || 'N/A'}</span>
                </Col>
                <Col md={6} className="mb-3">
                  <label className="text-muted small d-block">Phone Number</label>
                  <span className="fw-medium">{booking.customerDetails?.phone || 'N/A'}</span>
                </Col>
                <Col md={6} className="mb-3">
                  <label className="text-muted small d-block">User ID</label>
                  <span className="fw-medium">{booking.userId?._id || booking.userId || 'Guest'}</span>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle as="h5">Booking Status</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Booking Status:</span>
                {getStatusBadge(booking.bookingStatus)}
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span>Payment Status:</span>
                {getStatusBadge(booking.paymentStatus)}
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>Booked At:</span>
                <span className="text-muted small">
                  {new Date(booking.bookedAt).toLocaleString()}
                </span>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle as="h5">Payment Summary</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Unit Price</span>
                <span>₹{booking.unitPrice?.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Quantity</span>
                <span>x {booking.quantity}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Subtotal</span>
                <span>₹{booking.totalAmount?.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Booking Fee</span>
                <span>₹{booking.bookingFee?.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Tax</span>
                <span>₹{booking.taxAmount?.toLocaleString()}</span>
              </div>
              {booking.discountAmount > 0 && (
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>Discount</span>
                  <span>- ₹{booking.discountAmount?.toLocaleString()}</span>
                </div>
              )}
              <hr />
              <div className="d-flex justify-content-between mb-0 fw-bold fs-5">
                <span>Total Amount</span>
                <span className="text-primary">₹{booking.finalAmount?.toLocaleString()}</span>
              </div>
              {booking.transactionId && (
                <div className="mt-3 p-2 bg-light rounded small">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Transaction ID:</span>
                    <span className="text-break ms-2">{booking.transactionId}</span>
                  </div>
                  <div className="d-flex justify-content-between mt-1">
                    <span className="text-muted">Method:</span>
                    <span>{booking.paymentMethod?.toUpperCase()}</span>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default EventBookingDetails
