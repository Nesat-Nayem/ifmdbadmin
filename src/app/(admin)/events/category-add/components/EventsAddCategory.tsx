'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Form, Row, Toast, ToastContainer } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import Image from 'next/image'
import { useCreateEventCategoryMutation } from '@/store/eventCategoryApi'

const schema = yup.object({
  name: yup.string().required('Please enter category name'),
  isMusicShow: yup.boolean().default(false),
  isComedyShow: yup.boolean().default(false),
  isActive: yup.boolean().default(true),
})

type FormValues = yup.InferType<typeof schema>

const EventsAddCategory = () => {
  const router = useRouter()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  
  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success')
  const [showToast, setShowToast] = useState(false)

  const [createEventCategory, { isLoading }] = useCreateEventCategoryMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      isMusicShow: false,
      isComedyShow: false,
      isActive: true,
    },
  })

  const showMessage = (msg: string, type: 'success' | 'danger' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const onSubmit = async (values: FormValues) => {
    try {
      if (!imageFile) {
        showMessage('Please upload a category image', 'danger')
        return
      }

      const formData = new FormData()
      formData.append('name', values.name)
      formData.append('image', imageFile)
      formData.append('isMusicShow', String(values.isMusicShow))
      formData.append('isComedyShow', String(values.isComedyShow))
      formData.append('isActive', String(values.isActive))

      await createEventCategory(formData).unwrap()

      showMessage('Event category created successfully!', 'success')
      reset()
      setImageFile(null)
      setImagePreview('')
      
      setTimeout(() => {
        router.push('/events/category-list')
      }, 2000)
    } catch (err: any) {
      console.error('Error:', err)
      showMessage(err?.data?.message || 'Failed to create event category', 'danger')
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle as="h4">Add Event Category</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              {/* Category Name */}
              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Category Name *</label>
                  <input
                    type="text"
                    {...register('name')}
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    placeholder="Enter category name"
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                </div>
              </Col>

              {/* Category Image */}
              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Category Image *</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={120}
                        height={80}
                        className="rounded"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </div>
              </Col>

              {/* Is Music Show Checkbox */}
              <Col lg={4}>
                <div className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="isMusicShow"
                    label="Music Show Category"
                    {...register('isMusicShow')}
                  />
                  <small className="text-muted">Check if this category belongs to music shows</small>
                </div>
              </Col>

              {/* Is Comedy Show Checkbox */}
              <Col lg={4}>
                <div className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="isComedyShow"
                    label="Comedy Show Category"
                    {...register('isComedyShow')}
                  />
                  <small className="text-muted">Check if this category belongs to comedy shows</small>
                </div>
              </Col>

              {/* Is Active Checkbox */}
              <Col lg={4}>
                <div className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="isActive"
                    label="Active"
                    {...register('isActive')}
                    defaultChecked
                  />
                  <small className="text-muted">Uncheck to deactivate this category</small>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>

        <div className="p-3 bg-light mb-3 rounded">
          <Row className="justify-content-end g-2">
            <Col lg={2}>
              <Button type="submit" variant="success" className="w-100" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Category'}
              </Button>
            </Col>
          </Row>
        </div>
      </form>

      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default EventsAddCategory
