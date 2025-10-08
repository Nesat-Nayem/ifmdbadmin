'use client'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useState } from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Toast, ToastContainer } from 'react-bootstrap'
import { Control, Controller, Resolver, useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useCreateAdvertiseMutation } from '@/store/advertiseApi'

type FormValues = {
  link: string
  status: 'active' | 'inactive'
  image: FileList
}

type GeneralInformationCardProps = {
  control: Control<FormValues>
  setImage: React.Dispatch<React.SetStateAction<File | null>>
  errors: any
}

const GeneralInformationCard = ({ control, setImage, errors }: GeneralInformationCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Add Advertise</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          {/* ✅ File Upload */}
          <Col lg={6}>
            <div className="mb-3">
              <label className="form-label">Upload Advertise</label>
              <Controller
                name="image"
                control={control}
                render={({ field }) => (
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setImage(e.target.files[0])
                        field.onChange(e.target.files) // store FileList in RHF
                      }
                    }}
                  />
                )}
              />
              {errors.image && <p className="text-danger">{errors.image.message}</p>}
            </div>
          </Col>

          {/* ✅ URL Input */}
          <Col lg={6}>
            <div className="mb-3">
              <label className="form-label">Link</label>
              <Controller
                name="link"
                control={control}
                render={({ field }) => <input type="url" className="form-control" placeholder="https://example.com" {...field} />}
              />
              {errors.link && <p className="text-danger">{errors.link.message}</p>}
            </div>
          </Col>

          {/* ✅ Status Dropdown */}
          <Col lg={6}>
            <label className="form-label">Status</label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <select className="form-select" {...field}>
                  <option value="">Select Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              )}
            />
            {errors.status && <p className="text-danger">{errors.status.message}</p>}
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

const AdvertiseAdd = () => {
  // ✅ Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  const [image, setImage] = useState<File | null>(null)
  const router = useRouter()
  const [createAdvertise, { isLoading }] = useCreateAdvertiseMutation()

  // ✅ Validation Schema
  const schema = yup.object({
    link: yup.string().url('Must be a valid URL').required('Link is required'),
    status: yup.string().oneOf(['active', 'inactive']).required('Status is required'),
    image: yup.mixed<FileList>().test('required', 'Image is required', (value) => value && value.length > 0),
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema) as Resolver<FormValues, any>,
  })

  // ✅ Toast trigger
  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
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
    formData.append('link', values.link) // ✅ fixed
    formData.append('status', values.status)
    formData.append('image', image)

    try {
      await createAdvertise(formData).unwrap()
      showMessage('Advertise Created successfully!', 'success')
      setTimeout(() => {
        router.push('/advertise/advertise-list')
      }, 2000)
      reset()
      setImage(null)
    } catch (err: any) {
      console.error('Error:', err)
      showMessage(err?.data?.message || 'Failed to Create Advertise', 'error')
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <GeneralInformationCard control={control} setImage={setImage} errors={errors} />

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

export default AdvertiseAdd
