'use client'

import { useGetSubscriptionPlanByIdQuery, useGetSubscriptionPlansQuery, useUpdateSubscriptionPlanMutation } from '@/store/subscriptionPlanApi'
import { yupResolver } from '@hookform/resolvers/yup'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Container, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'

// ✅ Validation schema
const schema = yup.object().shape({
  planName: yup.string().required('Plan name is required'),
  planCost: yup.number().typeError('Cost must be a number').required('Plan cost is required'),
  planInclude: yup.array().of(yup.string()).min(1, 'Select at least one feature'),
  metaTitle: yup.string().required('Meta title is required'),
  metaTag: yup.string().required('Meta tag is required'),
  metaDescription: yup.string().required('Meta description is required'),
})

type FormValues = yup.InferType<typeof schema>

const SubscriptionEdit = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success')
  const [showToast, setShowToast] = useState(false)

  const router = useRouter()
  const params = useParams()
  const planId = typeof params?.id === 'string' ? params.id : undefined

  // ✅ fetch one plan
  const {
    data: subscriptionPlan,
    isFetching,
    isError,
  } = useGetSubscriptionPlanByIdQuery(planId!, {
    skip: !planId,
  })

  const [updatePlan, { isLoading }] = useUpdateSubscriptionPlanMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  })

  // ✅ reset form when API data arrives
  useEffect(() => {
    if (subscriptionPlan) {
      reset({
        planName: subscriptionPlan.planName,
        planCost: subscriptionPlan.planCost,
        planInclude: subscriptionPlan.planInclude || [],
        metaTitle: subscriptionPlan.metaTitle,
        metaTag: subscriptionPlan.metaTag?.join(', ') || '',
        metaDescription: subscriptionPlan.metaDescription,
      })
    }
  }, [subscriptionPlan, reset])

  const onSubmit = async (values: FormValues) => {
    if (!planId) return

    try {
      await updatePlan({
        id: planId,
        data: {
          ...values,
          planInclude: values.planInclude?.filter((item) => item !== undefined),
          metaTag: values.metaTag.split(',').map((tag) => tag.trim()),
        },
      }).unwrap()

      setToastMessage('Plan updated successfully!')
      setToastVariant('success')
      setShowToast(true)

      setTimeout(() => {
        router.push('/subscription/subscription-list')
      }, 1500)
    } catch (err: any) {
      console.error('Update Error:', err)
      setToastMessage(err?.data?.message || 'Failed to update plan')
      setToastVariant('danger')
      setShowToast(true)
    }
  }

  if (!planId) return <div className="text-danger">Invalid Plan ID</div>
  if (isFetching)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    )
  if (isError) return <div className="text-danger">Failed to load plan data.</div>

  const planFeatures = [
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
  ]

  return (
    <>
      <Container>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Plan Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle as="h4">Edit Plan</CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                <Col lg={6}>
                  <label className="form-label">Plan Name</label>
                  <input type="text" className="form-control" {...register('planName')} />
                  <small className="text-danger">{errors.planName?.message}</small>
                </Col>
                <Col lg={6}>
                  <label className="form-label">Plan Cost</label>
                  <input type="number" className="form-control" {...register('planCost')} />
                  <small className="text-danger">{errors.planCost?.message}</small>
                </Col>
              </Row>
            </CardBody>
          </Card>

          {/* Plan Includes */}
          <Card>
            <CardHeader>
              <CardTitle as="h4">Plan Includes</CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                {planFeatures.map((label, idx) => (
                  <Col md={6} key={idx}>
                    <div className="form-check mb-3">
                      <input type="checkbox" value={label} className="form-check-input" id={`feature-${idx}`} {...register('planInclude')} />
                      <label className="form-check-label" htmlFor={`feature-${idx}`}>
                        {label}
                      </label>
                    </div>
                  </Col>
                ))}
                <small className="text-danger">{errors.planInclude?.message}</small>
              </Row>
            </CardBody>
          </Card>

          {/* SEO Details */}
          <Card>
            <CardHeader>
              <CardTitle as="h4">SEO Details</CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                <Col lg={6}>
                  <label className="form-label">Meta Title</label>
                  <input type="text" className="form-control" {...register('metaTitle')} />
                  <small className="text-danger">{errors.metaTitle?.message}</small>
                </Col>
                <Col lg={6}>
                  <label className="form-label">Meta Tag (comma separated)</label>
                  <input type="text" className="form-control" {...register('metaTag')} />
                  <small className="text-danger">{errors.metaTag?.message}</small>
                </Col>
                <Col lg={12}>
                  <label className="form-label">Meta Description</label>
                  <textarea className="form-control" rows={5} {...register('metaDescription')} />
                  <small className="text-danger">{errors.metaDescription?.message}</small>
                </Col>
              </Row>
            </CardBody>
          </Card>

          {/* Actions */}
          <div className="p-3 bg-light mb-3 rounded">
            <Row className="justify-content-end g-2">
              <Col lg={2}>
                <Button variant="success" type="submit" className="w-100" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update'}
                </Button>
              </Col>
            </Row>
          </div>
        </form>
      </Container>

      {/* ✅ Toast Notification */}
      <ToastContainer className="p-3" position="top-end" style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default SubscriptionEdit
