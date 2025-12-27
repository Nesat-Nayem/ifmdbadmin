'use client'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useState } from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Toast, ToastContainer } from 'react-bootstrap'
import { Control, Controller, useForm } from 'react-hook-form'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCreateHomeBannerMutation } from '@/store/homeBannerApi'

type GeneralInformationCardProps = {
  control: Control<any>
  setImage: React.Dispatch<React.SetStateAction<File | null>>
}

const GeneralInformationCard = ({ control, setImage }: GeneralInformationCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Add Home Banner</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          {/* Title */}
          <Col lg={6}>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <Controller
                control={control}
                name="title"
                render={({ field }) => <input {...field} type="text" className="form-control" placeholder="Enter Title" />}
              />
            </div>
          </Col>

          {/* Banner Image */}
          <Col lg={6}>
            <div className="mb-3">
              <label className="form-label">Banner Image Size (256px * 62px)</label>
              <input type="file" className="form-control" onChange={(e) => setImage(e.target.files?.[0] || null)} />
            </div>
          </Col>

          {/* Order */}
          <Col lg={6}>
            <div className="mb-3">
              <label className="form-label">Order</label>
              <Controller
                control={control}
                name="order"
                render={({ field }) => <input {...field} type="number" className="form-control" placeholder="Enter order" />}
              />
            </div>
          </Col>

          {/* Status */}
          <Col lg={6}>
            <div className="mb-3">
              <label className="form-label">Status</label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <select
                    {...field}
                    className="form-control form-select"
                    onChange={(e) => field.onChange(e.target.value === 'true')}
                    value={field.value === true ? 'true' : field.value === false ? 'false' : ''}>
                    <option value="">Select Status</option>
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
  )
}

const HomeBannerAdd = () => {
  // ✅ Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  const [image, setImage] = React.useState<File | null>(null)
  const router = useRouter()

  const [createHomeBanner, { isLoading }] = useCreateHomeBannerMutation()
  console.log(createHomeBanner)
  const messageSchema = yup.object({
    title: yup.string().required('Please enter title'),
  })

  const { reset, handleSubmit, control } = useForm({
    resolver: yupResolver(messageSchema),
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
    formData.append('order', values.order || '')
    formData.append('status', values.status || '')
    formData.append('image', image)

    try {
      await createHomeBanner(formData).unwrap()
      showMessage('Banner Created successfully!', 'success')
      setTimeout(() => {
        router.push('/home-banner') // ✅ update path if needed
      }, 2000)
      reset()
      setImage(null)
    } catch (err: any) {
      console.error('Error:', err)
      showMessage(err?.data?.message || 'Failed to Create Banner', 'error')
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

export default HomeBannerAdd
