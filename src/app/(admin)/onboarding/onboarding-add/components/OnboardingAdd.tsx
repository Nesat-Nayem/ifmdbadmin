'use client'
import ChoicesFormInput from '@/components/form/ChoicesFormInput'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useState } from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Toast, ToastContainer } from 'react-bootstrap'
import { Control, useForm, Controller } from 'react-hook-form'
import Link from 'next/link'
import { useCreateOnBoardingsMutation } from '@/store/onBoardingApi'
import { useRouter } from 'next/navigation'

type FormValues = {
  title: string
  subtitle: string
  status: string
  meta: string
  metaTag: string
  description2: string
}

type controlType = {
  control: Control<FormValues>
  setImage?: React.Dispatch<React.SetStateAction<File | null>>
}

const GeneralInformationCard = ({ control, setImage }: controlType) => {
  return (
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
              <TextFormInput control={control} name="subtitle" label="Sub Title" placeholder="Enter Sub-Title" />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <label className="form-label">Banner</label>
              <input type="file" className="form-control" onChange={(e) => setImage && setImage(e.target.files?.[0] || null)} />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <label className="form-label">Status</label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <select {...field} className="form-control form-select" data-choices data-placeholder="Select Status">
                    <option value="">Select Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
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

const MetaOptionsCard = ({ control }: controlType) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Meta Options</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="meta" label="Meta Title" placeholder="Enter Title" />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} type="text" name="metaTag" label="Meta Tag Keyword" placeholder="Enter word" />
            </div>
          </Col>
          <Col lg={12}>
            <div className="mb-0">
              <TextAreaFormInput rows={4} control={control} name="description2" label="Description" placeholder="Type description" />
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

const OnboardingAdd = () => {
  // ✅ Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  const [image, setImage] = useState<File | null>(null)
  const [createOnBoardings, { isLoading }] = useCreateOnBoardingsMutation()
  const router = useRouter()

  const messageSchema = yup.object({
    title: yup.string().required('Please enter title'),
    subtitle: yup.string().required('Please enter sub title'),
    description2: yup.string().required('Please enter description'),
    meta: yup.string().required('Please enter meta title'),
    metaTag: yup.string().required('Please enter meta tag'),
    status: yup.string().required('Please select status'),
  })

  const { reset, handleSubmit, control } = useForm<FormValues>({
    resolver: yupResolver(messageSchema),
    defaultValues: {
      title: '',
      subtitle: '', // ✅ add this
      status: '',
      meta: '',
      metaTag: '',
      description2: '',
    },
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
    formData.append('title', values.title)
    formData.append('subtitle', values.subtitle)
    formData.append('status', values.status)
    formData.append('metaTitle', values.meta)
    formData.append('metaKeywords', values.metaTag)
    formData.append('metaDescription', values.description2)
    formData.append('image', image)

    try {
      await createOnBoardings(formData).unwrap()
      showMessage('Onboarding created successfully!', 'success')
      setTimeout(() => {
        router.push('/onboarding/onboarding-list')
      }, 5000)
      reset()
      setImage(null)
    } catch (err: any) {
      console.error('Error:', err)
      showMessage(err?.data?.message || 'Failed to Create Onboarding', 'error')
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <GeneralInformationCard control={control} setImage={setImage} />
        <MetaOptionsCard control={control} />
        <div className="p-3 bg-light mb-3 rounded">
          <Row className="justify-content-end g-2">
            <Col lg={2}>
              <Button type="submit" variant="success" className="w-100" disabled={isLoading}>
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

export default OnboardingAdd
