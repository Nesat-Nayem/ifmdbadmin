'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardBody, CardHeader, CardTitle, Form, Button, Row, Col, Spinner, Toast, ToastContainer } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { FaSave } from 'react-icons/fa'
import { useCreateWatchVideoCategoryMutation, useGetWatchVideoCategoriesQuery } from '@/store/watchVideosApi'
import { useUploadSingleMutation } from '@/store/uploadApi'

const schema = yup.object().shape({
  name: yup.string().required('Category name is required'),
  description: yup.string().optional(),
  order: yup.number().min(0).default(0),
  isActive: yup.boolean().default(true),
})

type FormValues = yup.InferType<typeof schema>

const CategoryAdd = () => {
  const router = useRouter()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [iconFile, setIconFile] = useState<File | null>(null)

  const { data: categories = [] } = useGetWatchVideoCategoriesQuery()
  const [createCategory, { isLoading }] = useCreateWatchVideoCategoryMutation()
  const [uploadSingle] = useUploadSingleMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      order: 0,
      isActive: true,
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      let imageUrl = ''
      let iconUrl = ''

      if (imageFile) {
        try {
          imageUrl = await uploadSingle(imageFile).unwrap()
        } catch {
          imageUrl = URL.createObjectURL(imageFile)
        }
      }

      if (iconFile) {
        try {
          iconUrl = await uploadSingle(iconFile).unwrap()
        } catch {
          iconUrl = URL.createObjectURL(iconFile)
        }
      }

      // Build payload - only include non-empty values
      const payload: any = {
        name: values.name,
        order: values.order || 0,
        isActive: values.isActive ?? true,
      }
      
      // Only add optional fields if they have values
      if (values.description) payload.description = values.description
      if (imageUrl) payload.imageUrl = imageUrl
      if (iconUrl) payload.iconUrl = iconUrl
      
      // Get parentId from form if selected
      const parentIdValue = (values as any).parentId
      if (parentIdValue && parentIdValue !== '') {
        payload.parentId = parentIdValue
      }

      await createCategory(payload).unwrap()

      setToastMessage('Category created successfully!')
      setToastVariant('success')
      setShowToast(true)

      setTimeout(() => {
        router.push('/watch-videos/category-list')
      }, 1500)
    } catch (error: any) {
      setToastMessage(error?.data?.message || 'Failed to create category')
      setToastVariant('danger')
      setShowToast(true)
    }
  }

  return (
    <>
      <ToastContainer position="top-end" className="p-3">
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide bg={toastVariant}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Add Video Category</CardTitle>
          </CardHeader>
          <CardBody>
            <Row className="g-3">
              <Col md={8}>
                <Form.Group>
                  <Form.Label>Category Name *</Form.Label>
                  <Form.Control 
                    {...register('name')} 
                    isInvalid={!!errors.name} 
                    placeholder="Enter category name" 
                  />
                  <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Display Order</Form.Label>
                  <Form.Control type="number" {...register('order')} min="0" />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control as="textarea" rows={3} {...register('description')} placeholder="Category description" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Category Image</Form.Label>
                  <Form.Control 
                    type="file" 
                    accept="image/*"
                    onChange={(e: any) => setImageFile(e.target.files?.[0] || null)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Category Icon</Form.Label>
                  <Form.Control 
                    type="file" 
                    accept="image/*"
                    onChange={(e: any) => setIconFile(e.target.files?.[0] || null)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Parent Category (Optional)</Form.Label>
                  <Form.Select {...register('parentId' as any)}>
                    <option value="">None (Top Level)</option>
                    {categories.map((cat: any) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mt-4">
                  <Form.Check type="switch" label="Active" {...register('isActive')} defaultChecked />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={isLoading}>
                {isLoading ? <Spinner size="sm" /> : <><FaSave className="me-2" /> Save Category</>}
              </Button>
            </div>
          </CardBody>
        </Card>
      </Form>
    </>
  )
}

export default CategoryAdd
