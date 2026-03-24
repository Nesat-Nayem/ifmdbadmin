'use client'

import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect, useState } from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import { useParams, useRouter } from 'next/navigation'
import { useGetHomepageCategoryByIdQuery, useUpdateHomepageCategoryMutation } from '@/store/homepageCategoryApi'
import Image from 'next/image'

type FormValues = {
  title: string
  link: string
  order?: number
  isActive: boolean
  image?: File
}

const HomepageCategoryEdit = () => {
  // ✅ Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  const router = useRouter()
  const params = useParams()

  const categoryId = typeof params?.id === 'string' ? params.id : undefined
  const { data: category, isFetching, isError } = useGetHomepageCategoryByIdQuery(categoryId!, { skip: !categoryId })

  const [updateHomepageCategory, { isLoading }] = useUpdateHomepageCategoryMutation()
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const messageSchema = yup.object({
    title: yup.string().required('Please enter title'),
    link: yup.string().default(''),
  })

  const { reset, handleSubmit, control } = useForm<FormValues>({
    resolver: yupResolver(messageSchema) as any,
    defaultValues: {
      title: '',
      link: '',
      order: undefined,
      isActive: true,
      image: undefined,
    },
  })

  // populate form when category data arrives
  useEffect(() => {
    if (category) {
      reset({
        title: category.title ?? '',
        link: category.link ?? '',
        order: category.order,
        isActive: category.isActive ?? true,
        image: undefined,
      })
      setImagePreview(null)
    }
  }, [category, reset])

  // ✅ Toast trigger
  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const onSubmit = async (values: FormValues) => {
    if (!categoryId) return

    const formData = new FormData()
    formData.append('title', values.title)
    formData.append('link', values.link || '')
    formData.append('isActive', String(values.isActive))
    if (values.order !== undefined) formData.append('order', values.order.toString())
    if (values.image) formData.append('image', values.image)

    try {
      await updateHomepageCategory({ id: categoryId, data: formData }).unwrap()
      showMessage('Category updated successfully!', 'success')
      setTimeout(() => {
        router.push('/homepage-category')
      }, 1500)
    } catch (err: any) {
      console.error('Update Error:', err)
      showMessage(err?.data?.message || 'Failed to update category', 'error')
    }
  }

  if (!categoryId) return <div className="text-danger">Invalid Category ID</div>
  if (isFetching)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    )
  if (isError) return <div className="text-danger">Failed to load category data.</div>

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle as="h4">Edit Homepage Category</CardTitle>
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
                    Category Image
                    <span className="ms-2 text-muted fw-normal" style={{ fontSize: '0.78rem' }}>
                      Recommended: 200 × 200 px
                    </span>
                  </label>
                  <Controller
                    control={control}
                    name="image"
                    render={({ field }) => (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          className="form-control"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            field.onChange(file)
                            if (file) setImagePreview(URL.createObjectURL(file))
                          }}
                        />

                        {/* Show Preview */}
                        {imagePreview ? (
                          <div className="mt-2">
                            <Image
                              width={60}
                              height={60}
                              src={imagePreview}
                              alt="preview"
                              style={{ maxHeight: 80, borderRadius: 8, width: '60px', height: '60px', objectFit: 'contain' }}
                            />
                          </div>
                        ) : category?.image ? (
                          <div className="mt-2">
                            <Image
                              src={category.image}
                              width={60}
                              height={60}
                              alt="category"
                              style={{ maxHeight: 80, borderRadius: 8, width: '60px', height: '60px', objectFit: 'contain' }}
                            />
                          </div>
                        ) : null}
                      </>
                    )}
                  />
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
                        value={field.value === true ? 'true' : 'false'}>
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
                {isLoading ? 'Saving...' : 'Save Changes'}
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

export default HomepageCategoryEdit
