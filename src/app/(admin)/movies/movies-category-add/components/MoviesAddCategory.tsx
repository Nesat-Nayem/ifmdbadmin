'use client'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useState } from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Toast, ToastContainer } from 'react-bootstrap'
import { Control, Controller, useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useCreateMovieCategoryMutation } from '@/store/movieCategory'

type FormValues = {
  title: string
  status: string
}

type GeneralInformationCardProps = {
  control: Control<FormValues>
}

const GeneralInformationCard = ({ control }: GeneralInformationCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Add Movie Category</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          {/* Title */}
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} name="title" label="Category Name" placeholder="Enter Name" />
            </div>
          </Col>

          {/* Status */}
          <Col lg={6}>
            <label className="form-label">Status</label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <select className="form-control form-select" {...field}>
                  <option value="">Select Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              )}
            />
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

const MoviesAddCategory = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success')
  const [showToast, setShowToast] = useState(false)

  const router = useRouter()
  const [createCategory, { isLoading }] = useCreateMovieCategoryMutation()

  const messageSchema = yup.object({
    title: yup.string().required('Please enter title'),
    status: yup.string().required('Please select status'),
  })

  const { reset, handleSubmit, control } = useForm<FormValues>({
    resolver: yupResolver(messageSchema),
    defaultValues: { title: '', status: '' },
  })

  const showMessage = (msg: string, type: 'success' | 'danger' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = { ...values, status: values.status?.toLowerCase() }
      await createCategory(payload).unwrap() // ✅ send JSON not FormData
      showMessage('Category created successfully!', 'success')
      setTimeout(() => {
        router.push('/movies/movies-category-list')
      }, 2000)
      reset()
    } catch (err: any) {
      console.error('Error:', err)
      showMessage(err?.data?.message || 'Failed to create category', 'danger')
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <GeneralInformationCard control={control} />

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

      {/* ✅ Toast */}
      <ToastContainer className="p-3" position="top-end" style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default MoviesAddCategory
