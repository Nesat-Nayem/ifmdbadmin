'use client'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect, useState } from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useGetAdvertiseByIdQuery, useUpdateAdvertiseMutation } from '@/store/advertiseApi'
import Image from 'next/image'

type FormValues = {
  link: string
  status: string
  image?: File
}

const messageSchema = yup.object().shape({
  link: yup.string().url('Must be a valid URL').required('Link is required'),
  status: yup.string().required('Please select status'),
})

const GeneralInformationCard = ({
  control,
  imagePreview,
  setImagePreview,
}: {
  control: any
  imagePreview: string | null
  setImagePreview: React.Dispatch<React.SetStateAction<string | null>>
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Edit Advertise</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          {/* Upload Advertise */}
          <Col lg={6}>
            <div className="mb-3">
              <label htmlFor="image" className="form-label">
                Upload Advertise
              </label>
              <Controller
                name="image"
                control={control}
                render={({ field: { onChange } }) => (
                  <input
                    type="file"
                    className="form-control"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      onChange(file)
                      if (file) {
                        setImagePreview(URL.createObjectURL(file))
                      }
                    }}
                  />
                )}
              />
              {imagePreview && (
                <Image
                  width={100}
                  height={100}
                  src={imagePreview}
                  alt="Preview"
                  className="mt-2 img-fluid"
                  style={{ maxWidth: '200px', borderRadius: 6 }}
                />
              )}
            </div>
          </Col>

          {/* URL */}
          <Col lg={6}>
            <div className="mb-3">
              <label htmlFor="url" className="form-label">
                Link
              </label>
              <Controller
                name="link"
                control={control}
                render={({ field }) => <input type="url" className="form-control" placeholder="Enter URL" {...field} />}
              />
            </div>
          </Col>

          {/* Status */}
          <Col lg={6}>
            <label htmlFor="status" className="form-label">
              Status
            </label>
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

const AdvertiseEdit = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success')
  const [showToast, setShowToast] = useState(false)

  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const router = useRouter()
  const params = useParams()
  const advertiseId = typeof params?.id === 'string' ? params.id : undefined

  const { data: advertise, isFetching, isError } = useGetAdvertiseByIdQuery(advertiseId!, { skip: !advertiseId })

  const [updateAdvertise, { isLoading }] = useUpdateAdvertiseMutation()

  const { reset, handleSubmit, control } = useForm<FormValues>({
    resolver: yupResolver(messageSchema),
    defaultValues: {
      link: '',
      status: '',
      image: undefined,
    },
  })
  // populate form when data arrives

  useEffect(() => {
    if (advertise) {
      reset({
        link: advertise.link || '',
        status: (advertise.status as 'active' | 'inactive') || 'inactive',
        image: undefined,
      })
      // ✅ set preview from API if exists
      if (typeof advertise.image === 'string') {
        setImagePreview(advertise.image)
      } else {
        setImagePreview(null)
      }
    }
  }, [advertise, reset])

  const showMessage = (msg: string, type: 'success' | 'danger' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const onSubmit = async (values: FormValues) => {
    if (!advertiseId) return

    const formData = new FormData()
    formData.append('link', values.link)
    formData.append('status', values.status)
    if (values.image) formData.append('image', values.image)

    try {
      await updateAdvertise({ id: advertiseId, data: formData }).unwrap()
      showMessage('Advertise updated successfully!', 'success')
      setTimeout(() => {
        router.push('/advertise/advertise-list')
      }, 1500)
    } catch (err: any) {
      console.error('Update Error:', err)
      showMessage(err?.data?.message || 'Failed to update Advertise', 'danger')
    }
  }

  if (!advertiseId) return <div className="text-danger">Invalid Advertise ID</div>
  if (isFetching)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    )
  if (isError) return <div className="text-danger">Failed to load Advertise data.</div>

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <GeneralInformationCard control={control} imagePreview={imagePreview} setImagePreview={setImagePreview} />

        <div className="p-3 bg-light mb-3 rounded">
          <Row className="justify-content-end g-2">
            <Col lg={2}>
              <Button variant="success" type="submit" className="w-100" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Update'}
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

export default AdvertiseEdit
