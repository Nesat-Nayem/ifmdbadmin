'use client'

import { useCreateVendorPackageMutation } from '@/store/vendorApi'
import { yupResolver } from '@hookform/resolvers/yup'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Container, Row, Toast, ToastContainer, Form } from 'react-bootstrap'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'

const schema = yup.object({
  name: yup.string().required('Package name is required'),
  description: yup.string().default(''),
  price: yup.number().typeError('Price must be a number').min(0, 'Price must be positive').required('Price is required'),
  duration: yup.number().typeError('Duration must be a number').min(1, 'Duration must be at least 1').required('Duration is required'),
  durationType: yup.string().oneOf(['days', 'months', 'years']).default('months'),
  isPopular: yup.boolean().default(false),
  isActive: yup.boolean().default(true),
  sortOrder: yup.number().default(0),
})

type FormValues = yup.InferType<typeof schema>

const VendorPackageAdd = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success')
  const [showToast, setShowToast] = useState(false)
  const [features, setFeatures] = useState<string[]>([])
  const [featureInput, setFeatureInput] = useState('')

  const [createPackage, { isLoading }] = useCreateVendorPackageMutation()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      durationType: 'months',
      duration: 1,
      isPopular: false,
      isActive: true,
      sortOrder: 0,
    },
  })

  const showMessage = (msg: string, type: 'success' | 'danger' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const addFeature = () => {
    if (featureInput.trim()) {
      setFeatures([...features, featureInput.trim()])
      setFeatureInput('')
    }
  }

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  const onSubmit = async (values: FormValues) => {
    const payload = {
      ...values,
      features,
    }

    try {
      await createPackage(payload).unwrap()
      showMessage('Package created successfully!')
      reset()
      setFeatures([])
      router.push('/vendor-packages/list')
    } catch (err: any) {
      console.error('Error creating package:', err)
      showMessage(err?.data?.message || 'Failed to create package', 'danger')
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Container>
          <Card>
            <CardHeader>
              <CardTitle as="h4">📦 Film Trade Package Details</CardTitle>
            </CardHeader>
            <CardBody>
              <Row className="g-3">
                <Col lg={6}>
                  <label className="form-label">Package Name *</label>
                  <input type="text" {...register('name')} className="form-control" placeholder="e.g. Gold, Silver, Platinum" />
                  {errors.name && <small className="text-danger">{errors.name.message}</small>}
                </Col>
                <Col lg={6}>
                  <label className="form-label">Price (₹) *</label>
                  <input type="number" {...register('price')} className="form-control" placeholder="Enter price" />
                  {errors.price && <small className="text-danger">{errors.price.message}</small>}
                </Col>
                <Col lg={6}>
                  <label className="form-label">Duration *</label>
                  <input type="number" {...register('duration')} className="form-control" placeholder="Enter duration" />
                  {errors.duration && <small className="text-danger">{errors.duration.message}</small>}
                </Col>
                <Col lg={6}>
                  <label className="form-label">Duration Type</label>
                  <select {...register('durationType')} className="form-select">
                    <option value="days">Days</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </Col>
                <Col lg={12}>
                  <label className="form-label">Description</label>
                  <textarea {...register('description')} className="form-control" rows={3} placeholder="Package description..." />
                </Col>
                <Col lg={6}>
                  <label className="form-label">Sort Order</label>
                  <input type="number" {...register('sortOrder')} className="form-control" />
                </Col>
                <Col lg={3}>
                  <div className="form-check mt-4">
                    <Controller
                      control={control}
                      name="isPopular"
                      render={({ field }) => (
                        <input type="checkbox" className="form-check-input" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
                      )}
                    />
                    <label className="form-check-label">Mark as Popular</label>
                  </div>
                </Col>
                <Col lg={3}>
                  <div className="form-check mt-4">
                    <Controller
                      control={control}
                      name="isActive"
                      render={({ field }) => (
                        <input type="checkbox" className="form-check-input" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
                      )}
                    />
                    <label className="form-check-label">Is Active</label>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle as="h4">✨ Package Features</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="d-flex gap-2 mb-3">
                <input
                  type="text"
                  className="form-control"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="Add a feature..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addFeature()
                    }
                  }}
                />
                <Button variant="outline-primary" onClick={addFeature} type="button">
                  Add
                </Button>
              </div>
              <div className="d-flex flex-wrap gap-2">
                {features.map((feature, idx) => (
                  <span key={idx} className="badge bg-primary d-flex align-items-center gap-2 py-2 px-3">
                    {feature}
                    <button type="button" className="btn-close btn-close-white btn-sm" onClick={() => removeFeature(idx)} />
                  </span>
                ))}
                {features.length === 0 && <p className="text-muted">No features added yet. Add features that will be shown to vendors.</p>}
              </div>
            </CardBody>
          </Card>

          <div className="p-3 bg-light mb-3 rounded">
            <Row className="justify-content-end g-2">
              <Col lg={2}>
                <Button variant="success" type="submit" disabled={isLoading} className="w-100">
                  {isLoading ? 'Saving...' : 'Create Package'}
                </Button>
              </Col>
            </Row>
          </div>
        </Container>
      </form>

      <ToastContainer className="p-3" position="top-end" style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default VendorPackageAdd
