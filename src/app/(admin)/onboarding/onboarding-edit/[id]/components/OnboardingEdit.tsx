'use client'
import ChoicesFormInput from '@/components/form/ChoicesFormInput'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect, useState } from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap'
import { Control, Controller, useForm } from 'react-hook-form'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useGetOnboardingByIdQuery, useUpdateOnBoardingsMutation } from '@/store/onBoardingApi'
import Image from 'next/image'

type FormValues = {
  title: string
  subtitle?: string
  status: string
  image?: File
  metaTitle: string
  metaDescription: string
  metaTags: string
}

type ControlType = {
  control: Control<FormValues>
  imagePreview: string | null
  setImagePreview: React.Dispatch<React.SetStateAction<string | null>>
  banner?: any
}

const GeneralInformationCard = ({ control, imagePreview, setImagePreview }: ControlType) => (
  <Card>
    <CardHeader>
      <CardTitle as={'h4'}>Basic Information</CardTitle>
    </CardHeader>
    <CardBody>
      <Row>
        <Col lg={6}>
          <div className="mb-3">
            <TextFormInput control={control} name="title" label="Title" placeholder="Enter Title" />
          </div>
        </Col>
        <Col lg={6}>
          <div className="mb-3">
            <TextFormInput control={control} name="subtitle" label="Subtitle" placeholder="Enter Subtitle" />
          </div>
        </Col>
        <Col lg={6}>
          <div className="mb-3">
            <Controller
              name="image"
              control={control}
              render={({ field: { onChange } }) => (
                <>
                  <label className="form-label">Banner</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        onChange(file)
                        setImagePreview(URL.createObjectURL(file))
                      }
                    }}
                  />
                  {imagePreview && <Image width={120} height={120} src={imagePreview} alt="Preview" className="mt-2" style={{ width: '120px' }} />}
                </>
              )}
            />
          </div>
        </Col>
        <Col lg={6}>
          <div className="mb-3">
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <>
                  <label className="form-label">Status</label>
                  <select {...field} className="form-control form-select">
                    <option value="">Select Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </>
              )}
            />
          </div>
        </Col>
      </Row>
    </CardBody>
  </Card>
)

const MetaOptionsCard = ({ control }: { control: Control<FormValues> }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Meta Options</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="metaTitle" label="Meta Title" placeholder="Enter Title" />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="metaTags" label="Meta Tags" placeholder="Enter tags" />
            </div>
          </Col>
          <Col lg={12}>
            <div className="mb-0">
              <TextAreaFormInput rows={4} control={control} name="metaDescription" label="Meta Description" placeholder="Type description" />
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

const OnboardingEdit = () => {
  // ✅ Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  const router = useRouter()
  const params = useParams()

  const bannerId = typeof params?.id === 'string' ? params.id : undefined
  const { data: banner, isFetching, isError } = useGetOnboardingByIdQuery(bannerId!, { skip: !bannerId })

  const [updateHomeBanner, { isLoading }] = useUpdateOnBoardingsMutation()
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const messageSchema = yup.object({
    title: yup.string().required('Please enter title'),
    metaTitle: yup.string().required('Please enter meta title'),
    metaTags: yup.string().required('Please enter meta tags (comma separated)'),
    metaDescription: yup.string().required('Please enter description'),
    status: yup.string().required('Please select status'),
  })

  const { reset, handleSubmit, control } = useForm<FormValues>({
    resolver: yupResolver(messageSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      status: '',
      image: undefined,
      metaTitle: '',
      metaDescription: '',
      metaTags: '',
    },
  })

  useEffect(() => {
    if (banner) {
      reset({
        title: banner.title,
        subtitle: banner.subtitle,
        status: banner.status,
        image: undefined,
        metaTitle: banner.metaTitle,
        metaDescription: banner.metaDescription,
        metaTags: banner.metaTags.join(','),
      })
      setImagePreview(banner.image || null)
    }
  }, [banner, reset])

  // ✅ Toast trigger
  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const onSubmit = async (values: FormValues) => {
    if (!bannerId) return

    const formData = new FormData()
    formData.append('title', values.title)
    formData.append('subtitle', values.subtitle || '')
    formData.append('status', values.status)
    formData.append('metaTitle', values.metaTitle)
    formData.append('metaDescription', values.metaDescription)
    formData.append('metaTags', JSON.stringify(values.metaTags))
    if (values.image) formData.append('image', values.image)

    try {
      await updateHomeBanner({ id: bannerId, data: formData }).unwrap()
      showMessage('Onboarding Updated successfully!', 'success')
      setTimeout(() => {
        router.push('/onboarding/onboarding-list')
      }, 1500)
    } catch (err: any) {
      console.error('Update Error:', err)

      showMessage(err?.data?.message || 'Failed to Updated Onboarding', 'error')
    }
  }

  if (!bannerId) return <div className="text-danger">Invalid Home Banner ID</div>
  if (isFetching)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    )
  if (isError) return <div className="text-danger">Failed to load banner data.</div>

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <GeneralInformationCard control={control} imagePreview={imagePreview} setImagePreview={setImagePreview} banner={banner} />
        <MetaOptionsCard control={control} />
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

export default OnboardingEdit
