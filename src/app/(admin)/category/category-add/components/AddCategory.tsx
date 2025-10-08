'use client'
import ChoicesFormInput from '@/components/form/ChoicesFormInput'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useState } from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Toast, ToastContainer } from 'react-bootstrap'
import { Control, Controller, useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useCreateCategoryMutation } from '@/store/categoryApi'

type FormValues = {
  title: string
  status: string
  description2?: string
  meta?: string
  metaTag?: string
}

type GeneralInformationCardProps = {
  control: Control<FormValues>
  setImage: React.Dispatch<React.SetStateAction<File | null>>
}

const GeneralInformationCard = ({ control, setImage }: GeneralInformationCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Add Category</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          {/* Icon upload */}
          <Col lg={4}>
            <div className="mb-3">
              <label htmlFor="icon" className="form-label">
                Icon
              </label>
              <input
                type="file"
                name="icon"
                className="form-control"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  setImage(file)
                }}
              />
            </div>
          </Col>

          {/* Title */}
          <Col lg={4}>
            <div className="mb-3">
              <TextFormInput control={control} name="title" label="Category Name" placeholder="Enter Name" />
            </div>
          </Col>

          {/* Status */}
          <Col lg={4}>
            <label className="form-label">Status</label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <select className="form-control form-select" data-choices data-choices-groups data-placeholder="Select Status" {...field}>
                  <option value="">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="InActive">InActive</option>
                </select>
              )}
            />
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

const AddCategory = () => {
  // ✅ Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success')
  const [showToast, setShowToast] = useState(false)

  const [image, setImage] = React.useState<File | null>(null)
  const router = useRouter()

  const [createCategory, { isLoading }] = useCreateCategoryMutation()

  const messageSchema = yup.object({
    title: yup.string().required('Please enter title'),
    status: yup.string().required('Please select status'),
    description2: yup.string().optional(),
    meta: yup.string().optional(),
    metaTag: yup.string().optional(),
  })

  const { reset, handleSubmit, control } = useForm<FormValues>({
    resolver: yupResolver(messageSchema),
    defaultValues: { title: '', status: '' },
  })

  // ✅ Toast trigger
  const showMessage = (msg: string, type: 'success' | 'danger' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const onSubmit = async (values: FormValues) => {
    if (!image) {
      alert('Please upload an image.')
      return
    }

    const formData = new FormData()
    formData.append('title', values.title)
    formData.append('status', values.status)
    formData.append('image', image)

    try {
      await createCategory(formData).unwrap()
      showMessage('Category created successfully!', 'success')
      setTimeout(() => {
        router.push('/category/category-list')
      }, 2000)
      reset()
      setImage(null)
    } catch (err: any) {
      console.error('Error:', err)
      showMessage(err?.data?.message || 'Failed to create category', 'danger')
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <GeneralInformationCard control={control} setImage={setImage} />

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

export default AddCategory
