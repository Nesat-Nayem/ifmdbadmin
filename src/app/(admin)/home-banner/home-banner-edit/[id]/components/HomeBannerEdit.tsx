'use client'

import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect, useState } from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap'
import { Control, Controller, useForm } from 'react-hook-form'
import { useParams, useRouter } from 'next/navigation'
import { useGetHomeBannerByIdQuery, useUpdateHomeBannerMutation, BannerType, BannerPlatform, BANNER_TYPE_LABELS, BANNER_TYPE_IMAGE_SIZES } from '@/store/homeBannerApi'
import Image from 'next/image'

type FormValues = {
  title: string
  bannerType: BannerType
  platform: BannerPlatform
  order?: number
  isActive: boolean
  image?: File
}

type ControlType = {
  control: Control<FormValues>
  imagePreview: string | null
  setImagePreview: React.Dispatch<React.SetStateAction<string | null>>
  banner?: any
  watchBannerType: BannerType
  watchPlatform: BannerPlatform
}

const GeneralInformationCard = ({ control, imagePreview, setImagePreview, banner, watchBannerType, watchPlatform }: ControlType) => {
  const imageSizeHint =
    watchBannerType && watchPlatform && watchPlatform !== 'both'
      ? BANNER_TYPE_IMAGE_SIZES[watchBannerType]?.[watchPlatform as 'web' | 'mobile']
      : watchBannerType
        ? `Web: ${BANNER_TYPE_IMAGE_SIZES[watchBannerType]?.web} / Mobile: ${BANNER_TYPE_IMAGE_SIZES[watchBannerType]?.mobile}`
        : null

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h4">Edit Banner</CardTitle>
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
                Banner Image
                {imageSizeHint && (
                  <span className="ms-2 text-muted fw-normal" style={{ fontSize: '0.78rem' }}>
                    Recommended: {imageSizeHint}
                  </span>
                )}
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
                          width={50}
                          height={50}
                          src={imagePreview}
                          alt="preview"
                          style={{ maxHeight: 150, borderRadius: 8, width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ) : banner?.image ? (
                      <div className="mt-2">
                        <Image
                          src={banner.image}
                          width={100}
                          height={100}
                          alt="banner"
                          style={{ maxHeight: 150, borderRadius: 8, width: '50px', height: '50px', objectFit: 'cover' }}
                        />
                      </div>
                    ) : null}
                  </>
                )}
              />
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
  )
}

const HomeBannerEdit = () => {
  // ✅ Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  const router = useRouter()
  const params = useParams()

  const bannerId = typeof params?.id === 'string' ? params.id : undefined
  const { data: banner, isFetching, isError } = useGetHomeBannerByIdQuery(bannerId!, { skip: !bannerId })

  const [updateHomeBanner, { isLoading }] = useUpdateHomeBannerMutation()
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const messageSchema = yup.object({
    title: yup.string().required('Please enter title'),
    bannerType: yup.string().required('Please select a banner page'),
    platform: yup.string().required('Please select a platform'),
  })

  const { reset, handleSubmit, control, watch } = useForm<FormValues>({
    resolver: yupResolver(messageSchema) as any,
    defaultValues: {
      title: '',
      bannerType: 'home',
      platform: 'both',
      order: undefined,
      isActive: true,
      image: undefined,
    },
  })

  const watchBannerType = watch('bannerType')
  const watchPlatform = watch('platform')

  // populate form when banner data arrives
  useEffect(() => {
    if (banner) {
      reset({
        title: banner.title ?? '',
        bannerType: banner.bannerType ?? 'home',
        platform: banner.platform ?? 'both',
        order: banner.order,
        isActive: banner.isActive ?? true,
        image: undefined,
      })
      setImagePreview(null)
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
    formData.append('bannerType', values.bannerType)
    formData.append('platform', values.platform)
    formData.append('isActive', String(values.isActive))
    if (values.order !== undefined) formData.append('order', values.order.toString())
    if (values.image) formData.append('image', values.image)

    try {
      await updateHomeBanner({ id: bannerId, data: formData }).unwrap()
      showMessage('Banner Updated successfully!', 'success')
      setTimeout(() => {
        router.push('/home-banner')
      }, 1500)
    } catch (err: any) {
      console.error('Update Error:', err)
      showMessage(err?.data?.message || 'Failed to Updated Banner', 'error')
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
        <GeneralInformationCard
          control={control}
          imagePreview={imagePreview}
          setImagePreview={setImagePreview}
          banner={banner}
          watchBannerType={watchBannerType}
          watchPlatform={watchPlatform}
        />

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

export default HomeBannerEdit
