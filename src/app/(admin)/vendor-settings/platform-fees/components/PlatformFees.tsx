'use client'

import { useGetPlatformSettingsQuery, useUpdatePlatformSettingMutation } from '@/store/vendorApi'
import React, { useState, useEffect } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Container, Row, Toast, ToastContainer, Spinner, Form } from 'react-bootstrap'

const PlatformFees = () => {
  const { data: settings = [], isLoading, isError, refetch } = useGetPlatformSettingsQuery()
  const [updateSetting, { isLoading: isUpdating }] = useUpdatePlatformSettingMutation()
  
  const [eventFee, setEventFee] = useState<number>(20)
  const [movieWatchFee, setMovieWatchFee] = useState<number>(50)
  
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success')

  useEffect(() => {
    if (settings.length > 0) {
      const eventSetting = settings.find(s => s.key === 'event_platform_fee')
      const movieSetting = settings.find(s => s.key === 'movie_watch_platform_fee')
      if (eventSetting) setEventFee(eventSetting.value)
      if (movieSetting) setMovieWatchFee(movieSetting.value)
    }
  }, [settings])

  const showMessage = (msg: string, type: 'success' | 'danger' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const handleUpdateEventFee = async () => {
    try {
      await updateSetting({ key: 'event_platform_fee', value: eventFee }).unwrap()
      showMessage('Event platform fee updated successfully!')
    } catch (err: any) {
      showMessage(err?.data?.message || 'Failed to update', 'danger')
    }
  }

  const handleUpdateMovieFee = async () => {
    try {
      await updateSetting({ key: 'movie_watch_platform_fee', value: movieWatchFee }).unwrap()
      showMessage('Movie watch platform fee updated successfully!')
    } catch (err: any) {
      showMessage(err?.data?.message || 'Failed to update', 'danger')
    }
  }

  if (isLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading settings...</p>
      </Container>
    )
  }

  if (isError) {
    return (
      <Container className="text-center py-5">
        <p className="text-danger">Failed to load settings</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </Container>
    )
  }

  return (
    <>
      <Container>
        <Row className="g-4">
          {/* Event Platform Fee */}
          <Col lg={6}>
            <Card className="h-100">
              <CardHeader className="bg-warning bg-opacity-10">
                <CardTitle as="h5" className="mb-0">
                  🎭 Event Platform Fee
                </CardTitle>
              </CardHeader>
              <CardBody>
                <p className="text-muted mb-4">
                  Set the platform fee percentage for vendors who offer event services. 
                  This percentage will be deducted from each event ticket sale.
                </p>
                
                <div className="mb-4">
                  <label className="form-label fw-bold">Current Fee: {eventFee}%</label>
                  <div className="d-flex align-items-center gap-3">
                    <Form.Range
                      min={0}
                      max={100}
                      value={eventFee}
                      onChange={(e) => setEventFee(Number(e.target.value))}
                      className="flex-grow-1"
                    />
                    <div className="d-flex align-items-center gap-2" style={{ minWidth: 120 }}>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={eventFee}
                        onChange={(e) => setEventFee(Number(e.target.value))}
                        min={0}
                        max={100}
                        style={{ width: 70 }}
                      />
                      <span>%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-light p-3 rounded mb-4">
                  <small className="text-muted">
                    <strong>Example:</strong> If a vendor sells a ticket for ₹1000, 
                    the platform will deduct ₹{(1000 * eventFee / 100).toFixed(0)} and 
                    the vendor receives ₹{(1000 - (1000 * eventFee / 100)).toFixed(0)}.
                  </small>
                </div>

                <Button 
                  variant="warning" 
                  onClick={handleUpdateEventFee} 
                  disabled={isUpdating}
                  className="w-100"
                >
                  {isUpdating ? 'Saving...' : 'Update Event Fee'}
                </Button>
              </CardBody>
            </Card>
          </Col>

          {/* Movie Watch Platform Fee */}
          <Col lg={6}>
            <Card className="h-100">
              <CardHeader className="bg-info bg-opacity-10">
                <CardTitle as="h5" className="mb-0">
                  🎬 Movie Watch Platform Fee
                </CardTitle>
              </CardHeader>
              <CardBody>
                <p className="text-muted mb-4">
                  Set the platform fee percentage for vendors who offer movie streaming services.
                  This percentage will be deducted from each movie rental/purchase.
                </p>
                
                <div className="mb-4">
                  <label className="form-label fw-bold">Current Fee: {movieWatchFee}%</label>
                  <div className="d-flex align-items-center gap-3">
                    <Form.Range
                      min={0}
                      max={100}
                      value={movieWatchFee}
                      onChange={(e) => setMovieWatchFee(Number(e.target.value))}
                      className="flex-grow-1"
                    />
                    <div className="d-flex align-items-center gap-2" style={{ minWidth: 120 }}>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={movieWatchFee}
                        onChange={(e) => setMovieWatchFee(Number(e.target.value))}
                        min={0}
                        max={100}
                        style={{ width: 70 }}
                      />
                      <span>%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-light p-3 rounded mb-4">
                  <small className="text-muted">
                    <strong>Example:</strong> If a vendor sells a movie for ₹500, 
                    the platform will deduct ₹{(500 * movieWatchFee / 100).toFixed(0)} and 
                    the vendor receives ₹{(500 - (500 * movieWatchFee / 100)).toFixed(0)}.
                  </small>
                </div>

                <Button 
                  variant="info" 
                  onClick={handleUpdateMovieFee} 
                  disabled={isUpdating}
                  className="w-100 text-white"
                >
                  {isUpdating ? 'Saving...' : 'Update Movie Watch Fee'}
                </Button>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Info Card */}
        <Card className="mt-4 border-primary border-opacity-25">
          <CardBody>
            <h5 className="mb-3">ℹ️ About Platform Fees</h5>
            <Row>
              <Col md={4}>
                <div className="p-3 bg-light rounded">
                  <h6>🎬 Film Trade</h6>
                  <p className="small text-muted mb-0">
                    Film Trade vendors pay a <strong>one-time package fee</strong> (Gold, Silver, Platinum) 
                    with no ongoing platform fee.
                  </p>
                </div>
              </Col>
              <Col md={4}>
                <div className="p-3 bg-light rounded">
                  <h6>🎭 Events</h6>
                  <p className="small text-muted mb-0">
                    Event vendors pay <strong>{eventFee}% per transaction</strong>.
                    No upfront package cost.
                  </p>
                </div>
              </Col>
              <Col md={4}>
                <div className="p-3 bg-light rounded">
                  <h6>🎥 Movie Watch</h6>
                  <p className="small text-muted mb-0">
                    Movie streaming vendors pay <strong>{movieWatchFee}% per transaction</strong>.
                    No upfront package cost.
                  </p>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Container>

      <ToastContainer className="p-3" position="top-end" style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default PlatformFees
