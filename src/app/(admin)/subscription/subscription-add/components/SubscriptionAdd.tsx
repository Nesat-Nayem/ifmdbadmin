'use client'

import { useCreateSubscriptionPlanMutation } from '@/store/subscriptionPlanApi'
import { yupResolver } from '@hookform/resolvers/yup'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Container, Row, Toast, ToastContainer } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'

// ✅ Validation Schema
const schema = yup.object({
  planName: yup.string().required('Plan name is required'),
  planCost: yup.number().typeError('Plan cost must be a number').required('Plan cost is required'),
  metaTitle: yup.string().required('Meta title is required'),
  metaTag: yup.string().required('Meta tag is required'),
  metaDescription: yup.string().required('Meta description is required'),
})

type FormValues = yup.InferType<typeof schema>

const SubscriptionAdd = () => {
  // ✅ Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success') // 👈 use danger instead of error
  const [showToast, setShowToast] = useState(false)

  const [createPlan, { isLoading }] = useCreateSubscriptionPlanMutation()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  })

  const showMessage = (msg: string, type: 'success' | 'danger' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const onSubmit = async (values: FormValues) => {
    // collect checked includes
    const includes = Array.from(document.querySelectorAll<HTMLInputElement>('input[name="planInclude"]:checked')).map((el) => el.value)

    const payload = {
      planName: values.planName,
      planCost: values.planCost,
      planInclude: includes,
      metaTitle: values.metaTitle,
      metaTag: values.metaTag.split(',').map((t) => t.trim()),
      metaDescription: values.metaDescription,
      isDeleted: false,
    }

    try {
      await createPlan(payload).unwrap()
      showMessage('Plan created successfully!')
      reset()
      router.push('/subscription/subscription-list')
    } catch (err: any) {
      console.error('Error creating plan:', err)
      showMessage(err?.data?.message || 'Failed to create plan')
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Container>
          {/* Basic Details */}
          <Card>
            <CardHeader>
              <CardTitle as="h4">Create Plan</CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                <Col lg={6}>
                  <label htmlFor="planName" className="form-label">
                    Plan Name
                  </label>
                  <input type="text" id="planName" {...register('planName')} className="form-control" />
                  {errors.planName && <small className="text-danger">{errors.planName.message}</small>}
                </Col>
                <Col lg={6}>
                  <label htmlFor="planCost" className="form-label">
                    Plan Cost
                  </label>
                  <input type="number" id="planCost" {...register('planCost')} className="form-control" />
                  {errors.planCost && <small className="text-danger">{errors.planCost.message}</small>}
                </Col>
              </Row>
            </CardBody>
          </Card>

          {/* Plan Includes */}
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center gap-1">
              <CardTitle as="h4" className="flex-grow-1">
                Plan Includes
              </CardTitle>
              <Link href="/subscription/includes-add" className="btn btn-sm btn-success">
                + Add Includes
              </Link>
            </CardHeader>
            <CardBody>
              <Row>
                {[
                  'Unlimited Movie Downloads',
                  'Access to Exclusive Content',
                  '4K Ultra HD Streaming',
                  'Multi-Device Support',
                  'Ad-Free Experience',
                  'Offline Viewing',
                  'Early Access to New Releases',
                  'Parental Controls',
                  'Multi-Language Subtitles',
                  'Priority Customer Support',
                ].map((label, idx) => (
                  <Col md={6} key={idx}>
                    <div className="form-check mb-3">
                      <input className="form-check-input" type="checkbox" id={`plan-${idx}`} name="planInclude" value={label} />
                      <label className="form-check-label" htmlFor={`plan-${idx}`}>
                        {label}
                      </label>
                    </div>
                  </Col>
                ))}
              </Row>
            </CardBody>
          </Card>

          {/* SEO Section */}
          <Card>
            <CardHeader>
              <CardTitle as="h4">SEO Details</CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                <Col lg={6}>
                  <label htmlFor="metaTitle" className="form-label">
                    Meta Title
                  </label>
                  <input type="text" id="metaTitle" {...register('metaTitle')} className="form-control" />
                  {errors.metaTitle && <small className="text-danger">{errors.metaTitle.message}</small>}
                </Col>
                <Col lg={6}>
                  <label htmlFor="metaTag" className="form-label">
                    Meta Tag (comma separated)
                  </label>
                  <input type="text" id="metaTag" {...register('metaTag')} className="form-control" />
                  {errors.metaTag && <small className="text-danger">{errors.metaTag.message}</small>}
                </Col>
                <Col lg={12}>
                  <div className="mb-3">
                    <label htmlFor="metaDescription" className="form-label">
                      Meta Description
                    </label>
                    <textarea className="form-control bg-light-subtle" id="metaDescription" rows={7} {...register('metaDescription')} />
                    {errors.metaDescription && <small className="text-danger">{errors.metaDescription.message}</small>}
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>

          {/* Save Button */}
          <div className="p-3 bg-light mb-3 rounded">
            <Row className="justify-content-end g-2">
              <Col lg={2}>
                <Button variant="success" type="submit" disabled={isLoading} className="w-100">
                  {isLoading ? 'Saving...' : 'Save'}
                </Button>
              </Col>
            </Row>
          </div>
        </Container>
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

export default SubscriptionAdd
