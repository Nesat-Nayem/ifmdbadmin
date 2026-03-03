'use client'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useState } from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Toast, ToastContainer } from 'react-bootstrap'
import { Control, Controller, useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useCreateHomeBannerMutation, BannerType, BannerPlatform, BANNER_TYPE_LABELS, BANNER_TYPE_IMAGE_SIZES } from '@/store/homeBannerApi'

type GeneralInformationCardProps = {
  control: Control<any>
  setImage: React.Dispatch<React.SetStateAction<File | null>>
  watchBannerType: BannerType
  watchPlatform: BannerPlatform
}

const GeneralInformationCard = ({ control, setImage, watchBannerType, watchPlatform }: GeneralInformationCardProps) => {
  const imageSizeHint =
    watchBannerType && watchPlatform && watchPlatform !== 'both'
      ? BANNER_TYPE_IMAGE_SIZES[watchBannerType]?.[watchPlatform as 'web' | 'mobile']
      : watchBannerType
        ? `Web: ${BANNER_TYPE_IMAGE_SIZES[watchBannerType]?.web} / Mobile: ${BANNER_TYPE_IMAGE_SIZES[watchBannerType]?.mobile}`
        : null

  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Add Banner</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          {/* Banner Type */}
          <Col lg={6}>
            <div className="mb-3">
              <label className="form-label">Banner Page <span className="text-danger">*</span></label>
              <Controller
                control={control}
                name="bannerType"
                render={({ field, fieldState }) => (
                  <>
                    <select {...field} className={`form-control form-select ${fieldState.error ? 'is-invalid' : ''}`}>
                      <option value="">Select Page</option>
                      {(Object.keys(BANNER_TYPE_LABELS) as BannerType[]).map((type) => (
                        <option key={type} value={type}>{BANNER_TYPE_LABELS[type]}</option>
                      ))}
                    </select>
                    {fieldState.error && <div className="invalid-feedback">{fieldState.error.message}</div>}
                  </>
                )}
              />
            </div>
          </Col>

          {/* Platform */}
          <Col lg={6}>
            <div className="mb-3">
              <label className="form-label">Platform <span className="text-danger">*</span></label>
              <Controller
                control={control}
                name="platform"
                render={({ field, fieldState }) => (
                  <>
                    <select {...field} className={`form-control form-select ${fieldState.error ? 'is-invalid' : ''}`}>
                      <option value="">Select Platform</option>
                      <option value="web">Web</option>
                      <option value="mobile">Mobile</option>
                      <option value="both">Both</option>
                    </select>
                    {fieldState.error && <div className="invalid-feedback">{fieldState.error.message}</div>}
                  </>
                )}
              />
            </div>
          </Col>

          {/* Title */}
          <Col lg={6}>
            <div className="mb-3">
              <label className="form-label">Title <span className="text-danger">*</span></label>
              <Controller
                control={control}
                name="title"
                render={({ field, fieldState }) => (
                  <>
                    <input {...field} type="text" className={`form-control ${fieldState.error ? 'is-invalid' : ''}`} placeholder="Enter Title" />
                    {fieldState.error && <div className="invalid-feedback">{fieldState.error.message}</div>}
                  </>
                )}
              />
            </div>
          </Col>

          {/* Banner Image */}
          <Col lg={6}>
            <div className="mb-3">
              <label className="form-label">
                Banner Image <span className="text-danger">*</span>
                {imageSizeHint && (
                  <span className="ms-2 text-muted fw-normal" style={{ fontSize: '0.78rem' }}>
                    Recommended: {imageSizeHint}
                  </span>
                )}
              </label>
              <input type="file" accept="image/*" className="form-control" onChange={(e) => setImage(e.target.files?.[0] || null)} />
            </div>
          </Col>

          {/* Order */}
          <Col lg={6}>
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
          <Col lg={6}>
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

  const messageSchema = yup.object({
    title: yup.string().required('Please enter title'),
    bannerType: yup.string().required('Please select a banner page'),
    platform: yup.string().required('Please select a platform'),
  })

  const { reset, handleSubmit, control, watch } = useForm<any>({
    resolver: yupResolver(messageSchema),
    defaultValues: {
      title: '',
      bannerType: '',
      platform: '',
      order: undefined,
      isActive: true,
    },
  })

  const watchBannerType = watch('bannerType') as BannerType
  const watchPlatform = watch('platform') as BannerPlatform

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
    formData.append('bannerType', values.bannerType)
    formData.append('platform', values.platform)
    formData.append('isActive', String(values.isActive ?? true))
    if (values.order !== undefined && values.order !== '') formData.append('order', String(values.order))
    formData.append('image', image)

    try {
      await createHomeBanner(formData).unwrap()
      showMessage('Banner Created successfully!', 'success')
      setTimeout(() => {
        router.push('/home-banner')
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
        <GeneralInformationCard control={control} setImage={setImage} watchBannerType={watchBannerType} watchPlatform={watchPlatform} />

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
