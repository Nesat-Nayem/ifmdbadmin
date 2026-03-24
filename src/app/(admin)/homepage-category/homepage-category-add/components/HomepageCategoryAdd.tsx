'use client'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useState } from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Toast, ToastContainer } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useCreateHomepageCategoryMutation } from '@/store/homepageCategoryApi'

const HomepageCategoryAdd = () => {
  // ✅ Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  const [image, setImage] = React.useState<File | null>(null)
  const router = useRouter()

  const [createHomepageCategory, { isLoading }] = useCreateHomepageCategoryMutation()

  const messageSchema = yup.object({
    title: yup.string().required('Please enter title'),
    link: yup.string().default(''),
  })

  const { reset, handleSubmit, control } = useForm<any>({
    resolver: yupResolver(messageSchema),
    defaultValues: {
      title: '',
      link: '',
      order: undefined,
      isActive: true,
    },
  })

  // ✅ Toast trigger
  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const onSubmit = async (values: any) => {
    if (!image) {
      alert('Please upload an image.')
      return
    }

    const formData = new FormData()
    formData.append('title', values.title)
    formData.append('link', values.link || '')
    formData.append('isActive', String(values.isActive ?? true))
    if (values.order !== undefined && values.order !== '') formData.append('order', String(values.order))
    formData.append('image', image)

    try {
      await createHomepageCategory(formData).unwrap()
      showMessage('Category created successfully!', 'success')
      setTimeout(() => {
        router.push('/homepage-category')
      }, 2000)
      reset()
      setImage(null)
    } catch (err: any) {
      console.error('Error:', err)
      showMessage(err?.data?.message || 'Failed to create category', 'error')
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle as={'h4'}>Add Homepage Category</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              {/* Title */}
              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Title <span className="text-danger">*</span></label>
                  <Controller
                    control={control}
                    name="title"
                    render={({ field, fieldState }) => (
                      <>
                        <input {...field} type="text" className={`form-control ${fieldState.error ? 'is-invalid' : ''}`} placeholder="e.g. MUSIC" />
                        {fieldState.error && <div className="invalid-feedback">{fieldState.error.message}</div>}
                      </>
                    )}
                  />
                </div>
              </Col>

              {/* Link */}
              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Link <span className="text-muted fw-normal" style={{ fontSize: '0.78rem' }}>(URL path on click)</span></label>
                  <Controller
                    control={control}
                    name="link"
                    render={({ field }) => (
                      <input {...field} type="text" className="form-control" placeholder="e.g. /events?category=music" />
                    )}
                  />
                </div>
              </Col>

              {/* Category Image */}
              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">
                    Category Image <span className="text-danger">*</span>
                    <span className="ms-2 text-muted fw-normal" style={{ fontSize: '0.78rem' }}>
                      Recommended: 200 × 200 px
                    </span>
                  </label>
                  <input type="file" accept="image/*" className="form-control" onChange={(e) => setImage(e.target.files?.[0] || null)} />
                </div>
              </Col>

              {/* Order */}
              <Col lg={3}>
                <div className="mb-3">
                  <label className="form-label">Order <span className="text-muted fw-normal" style={{ fontSize: '0.78rem' }}>(lower = first)</span></label>
                  <Controller
                    control={control}
                    name="order"
                    render={({ field }) => <input {...field} type="number" className="form-control" placeholder="Enter order" />}
                  />
                </div>
              </Col>

              {/* Status */}
              <Col lg={3}>
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <Controller
                    control={control}
                    name="isActive"
                    render={({ field }) => (
                      <select
                        {...field}
                        className="form-control form-select"
                        onChange={(e) => field.onChange(e.target.value === 'true')}
                        value={field.value === true ? 'true' : field.value === false ? 'false' : 'true'}>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    )}
                  />
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>

        <div className="p-3 bg-light mb-3 rounded">
          <Row className="justify-content-end g-2">
            <Col lg={2}>
              <Button variant="success" type="submit" className="w-100" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </Col>
          </Row>
        </div>
      </form>

      {/* ✅ Toast Notification */}
      <ToastContainer className="p-3" position="top-end" style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default HomepageCategoryAdd
