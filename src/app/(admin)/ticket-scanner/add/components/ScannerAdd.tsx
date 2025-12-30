'use client'

import { useCreateScannerMutation } from '@/store/scannerApi'
import { useGetEventsQuery } from '@/store/eventsApi'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner, Toast, ToastContainer, Form } from 'react-bootstrap'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'

const schema = yup.object().shape({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  phone: yup.string().optional(),
  notes: yup.string().optional(),
})

type FormValues = yup.InferType<typeof schema>

const ScannerAdd = () => {
  const router = useRouter()
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success')
  const [showToast, setShowToast] = useState(false)

  // Fetch vendor's events
  const { data: eventsData = [], isLoading: eventsLoading } = useGetEventsQuery()
  const [createScanner, { isLoading: isCreating }] = useCreateScannerMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  })

  const showMessage = (msg: string, type: 'success' | 'danger' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const handleEventToggle = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    )
  }

  const onSubmit = async (data: FormValues) => {
    try {
      const result = await createScanner({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone || '',
        allowedEvents: selectedEvents,
        notes: data.notes || '',
      }).unwrap()

      if (result.success) {
        showMessage('Scanner access created successfully!', 'success')
        reset()
        setSelectedEvents([])
        setTimeout(() => {
          router.push('/ticket-scanner/list')
        }, 1500)
      } else {
        showMessage(result.message || 'Failed to create scanner access', 'danger')
      }
    } catch (error: any) {
      console.error('Create scanner error:', error)
      showMessage(error?.data?.message || 'Failed to create scanner access', 'danger')
    }
  }

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle as="h4" className="mb-0">
                Add Scanner Access
              </CardTitle>
              <Link href="/ticket-scanner/list" className="btn btn-sm btn-secondary">
                Back to List
              </Link>
            </CardHeader>
            <CardBody>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Row>
                  {/* Scanner Account Details */}
                  <Col md={6}>
                    <h5 className="mb-3">Account Details</h5>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter scanner name"
                        {...register('name')}
                        isInvalid={!!errors.name}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.name?.message}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter email address"
                        {...register('email')}
                        isInvalid={!!errors.email}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email?.message}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter phone number (optional)"
                        {...register('phone')}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Password <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter password"
                        {...register('password')}
                        isInvalid={!!errors.password}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.password?.message}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Confirm Password <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Confirm password"
                        {...register('confirmPassword')}
                        isInvalid={!!errors.confirmPassword}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.confirmPassword?.message}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Notes</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Add any notes about this scanner (optional)"
                        {...register('notes')}
                      />
                    </Form.Group>
                  </Col>

                  {/* Event Selection */}
                  <Col md={6}>
                    <h5 className="mb-3">Allowed Events</h5>
                    <p className="text-muted small mb-3">
                      Select which events this scanner can validate tickets for. 
                      Leave empty to allow all your events.
                    </p>

                    {eventsLoading ? (
                      <div className="text-center py-4">
                        <Spinner animation="border" size="sm" />
                        <span className="ms-2">Loading events...</span>
                      </div>
                    ) : eventsData.length === 0 ? (
                      <div className="alert alert-warning">
                        No events found. Create an event first to assign specific event access.
                      </div>
                    ) : (
                      <div className="border rounded p-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <Form.Check
                          type="checkbox"
                          id="all-events"
                          label={<strong>All Events (No Restriction)</strong>}
                          checked={selectedEvents.length === 0}
                          onChange={() => setSelectedEvents([])}
                          className="mb-2 pb-2 border-bottom"
                        />
                        {eventsData.map((event: any) => (
                          <Form.Check
                            key={event._id}
                            type="checkbox"
                            id={`event-${event._id}`}
                            label={
                              <div>
                                <span>{event.title}</span>
                                <br />
                                <small className="text-muted">
                                  {new Date(event.startDate).toLocaleDateString()}
                                </small>
                              </div>
                            }
                            checked={selectedEvents.includes(event._id)}
                            onChange={() => handleEventToggle(event._id)}
                            className="mb-2"
                          />
                        ))}
                      </div>
                    )}

                    {selectedEvents.length > 0 && (
                      <div className="mt-3">
                        <small className="text-info">
                          <i className="bi bi-info-circle me-1"></i>
                          {selectedEvents.length} event(s) selected
                        </small>
                      </div>
                    )}
                  </Col>
                </Row>

                <hr className="my-4" />

                <div className="d-flex justify-content-end gap-2">
                  <Button variant="secondary" type="button" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Creating...
                      </>
                    ) : (
                      'Create Scanner Access'
                    )}
                  </Button>
                </div>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default ScannerAdd
