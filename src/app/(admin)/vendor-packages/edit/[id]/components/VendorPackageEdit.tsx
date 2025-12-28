'use client'

import { useGetVendorPackageByIdQuery, useUpdateVendorPackageMutation } from '@/store/vendorApi'
import { yupResolver } from '@hookform/resolvers/yup'
import { useRouter } from 'next/navigation'
import React, { useState, useMemo, useEffect } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Container, Row, Toast, ToastContainer, Form, Spinner } from 'react-bootstrap'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { FaTrash } from 'react-icons/fa'
import COUNTRIES, { ICountry } from '@/data/countries'

interface ICountryPricing {
  countryCode: string
  countryName: string
  currency: string
  price: number
  isActive: boolean
}

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

const VendorPackageEdit = ({ id }: { id: string }) => {
  const router = useRouter()
  const { data: pkg, isLoading: isFetching, isError } = useGetVendorPackageByIdQuery(id)
  const [updatePackage, { isLoading: isUpdating }] = useUpdateVendorPackageMutation()

  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success')
  const [showToast, setShowToast] = useState(false)
  const [features, setFeatures] = useState<string[]>([])
  const [featureInput, setFeatureInput] = useState('')
  const [countryPricing, setCountryPricing] = useState<ICountryPricing[]>([])
  const [countrySearch, setCountrySearch] = useState('')

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    if (pkg) {
      reset({
        name: pkg.name,
        description: pkg.description,
        price: pkg.price,
        duration: pkg.duration,
        durationType: pkg.durationType,
        isPopular: pkg.isPopular,
        isActive: pkg.isActive,
        sortOrder: pkg.sortOrder,
      })
      setFeatures(pkg.features || [])
      setCountryPricing((pkg as any).countryPricing || [])
    }
  }, [pkg, reset])

  const filteredCountries = useMemo(() => {
    if (!countrySearch) return []
    const lowerSearch = countrySearch.toLowerCase()
    return COUNTRIES.filter(
      (c) =>
        (c.name.toLowerCase().includes(lowerSearch) ||
          c.code.toLowerCase().includes(lowerSearch) ||
          c.currency.toLowerCase().includes(lowerSearch)) &&
        !countryPricing.some((cp) => cp.countryCode === c.code)
    )
  }, [countrySearch, countryPricing])

  const addCountryPricing = (country: ICountry) => {
    if (countryPricing.some((cp) => cp.countryCode === country.code)) return
    setCountryPricing([
      ...countryPricing,
      {
        countryCode: country.code,
        countryName: country.name,
        currency: country.currency,
        price: 0,
        isActive: true,
      },
    ])
    setCountrySearch('')
  }

  const updateCountryPricingField = (index: number, field: keyof ICountryPricing, value: any) => {
    const updated = [...countryPricing]
    updated[index] = { ...updated[index], [field]: value }
    setCountryPricing(updated)
  }

  const removeCountryPricing = (index: number) => {
    setCountryPricing(countryPricing.filter((_, i) => i !== index))
  }

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
      countryPricing,
    }

    try {
      await updatePackage({ id, data: payload }).unwrap()
      showMessage('Package updated successfully!')
      setTimeout(() => {
        router.push('/vendor-packages/list')
      }, 1500)
    } catch (err: any) {
      console.error('Error updating package:', err)
      showMessage(err?.data?.message || 'Failed to update package', 'danger')
    }
  }

  if (isFetching) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading package details...</p>
      </Container>
    )
  }

  if (isError || !pkg) {
    return (
      <Container className="text-center py-5">
        <p className="text-danger">Failed to load package details or package not found.</p>
        <Button onClick={() => router.push('/vendor-packages/list')}>Back to List</Button>
      </Container>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Container>
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h4 className="mb-0">Edit Film Trade Package</h4>
            <Button variant="outline-secondary" onClick={() => router.push('/vendor-packages/list')}>
              Back to List
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle as="h4">📦 Package Details</CardTitle>
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

          {/* Country-wise Pricing Card */}
          <Card>
            <CardHeader>
              <CardTitle as="h4">🌍 Country-wise Pricing</CardTitle>
            </CardHeader>
            <CardBody>
              <p className="text-muted mb-3">Set different prices for different countries. If a country is not listed, the default price (above) will be used.</p>
              
              <div className="mb-3 position-relative">
                <Form.Control
                  placeholder="Search country to add pricing..."
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                />
                {countrySearch && (
                  <div className="position-absolute w-100 bg-white border rounded shadow-sm" style={{ zIndex: 1000, maxHeight: 300, overflowY: 'auto' }}>
                    {filteredCountries.length === 0 ? (
                      <div className="p-3 text-muted text-center">No countries found</div>
                    ) : (
                      filteredCountries.slice(0, 20).map((country) => (
                        <div
                          key={country.code}
                          className="p-2 d-flex align-items-center gap-2 border-bottom"
                          style={{ cursor: 'pointer' }}
                          onClick={() => addCountryPricing(country)}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <span style={{ fontSize: '1.5rem' }}>{country.flag}</span>
                          <div>
                            <strong>{country.name}</strong>
                            <small className="text-muted d-block">{country.code} • {country.currency} ({country.currencySymbol})</small>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {countryPricing.map((cp, index) => {
                const countryData = COUNTRIES.find((c) => c.code === cp.countryCode)
                return (
                  <Row key={index} className="mb-2 align-items-center py-2 border-bottom">
                    <Col md={4}>
                      <div className="d-flex align-items-center gap-2">
                        <span style={{ fontSize: '1.3rem' }}>{countryData?.flag || '🏳️'}</span>
                        <div>
                          <strong>{cp.countryName}</strong>
                          <small className="text-muted d-block">{cp.countryCode} • {cp.currency}</small>
                        </div>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="input-group input-group-sm">
                        <span className="input-group-text">{countryData?.currencySymbol || cp.currency}</span>
                        <Form.Control
                          type="number"
                          placeholder="Price"
                          value={cp.price}
                          onChange={(e) => updateCountryPricingField(index, 'price', Number(e.target.value))}
                          size="sm"
                        />
                      </div>
                    </Col>
                    <Col md={3}>
                      <Form.Check
                        type="switch"
                        label="Active"
                        checked={cp.isActive}
                        onChange={(e) => updateCountryPricingField(index, 'isActive', e.target.checked)}
                      />
                    </Col>
                    <Col md={2}>
                      <Button size="sm" variant="outline-danger" onClick={() => removeCountryPricing(index)}>
                        <FaTrash />
                      </Button>
                    </Col>
                  </Row>
                )
              })}
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
              </div>
            </CardBody>
          </Card>

          <div className="p-3 bg-light mb-3 rounded">
            <Row className="justify-content-end g-2">
              <Col lg={2}>
                <Button variant="primary" type="submit" disabled={isUpdating} className="w-100">
                  {isUpdating ? 'Updating...' : 'Update Package'}
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

export default VendorPackageEdit
