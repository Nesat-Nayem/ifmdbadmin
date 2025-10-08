'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, Col, Row, Toast, ToastContainer } from 'react-bootstrap'
import { IOnboarding, useDeleteOnBoardingsMutation, useGetOnboardingQuery } from '@/store/onBoardingApi'

const OnboardingList = () => {
  // ✅ Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  // store data fetch
  const { data: onboarding = [], isLoading, isError } = useGetOnboardingQuery()
  const [deleteOnboarding, { isLoading: isDeleting }] = useDeleteOnBoardingsMutation()
  console.log(onboarding)

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error loading Onboarding</div>

  // ✅ Toast trigger
  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  // delete handler
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Onboarding?')) return
    try {
      await deleteOnboarding(id).unwrap()
      showMessage('Onboarding deleted successfully!', 'success')
    } catch (error: any) {
      console.error('Delete failed:', error)
      showMessage(error?.data?.message || 'Failed to delete Onboarding', 'error')
    }
  }

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center gap-1">
              <CardTitle as={'h4'} className="flex-grow-1">
                All Onboarding List
              </CardTitle>
              <Link href="/onboarding/onboarding-add" className="btn btn-sm btn-success">
                + Add Onboarding
              </Link>
            </CardHeader>

            <div className="table-responsive">
              <table className="table align-middle mb-0 table-hover table-centered table-bordered">
                <thead className="bg-light-subtle">
                  <tr>
                    <th style={{ width: 20 }}>
                      <div className="form-check">
                        <input type="checkbox" className="form-check-input" id="customCheck1" />
                        <label className="form-check-label" htmlFor="customCheck1" />
                      </div>
                    </th>
                    <th>Banner</th>
                    <th>Title</th>
                    <th>Sub Title</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {onboarding.map((item: IOnboarding) => (
                    <tr key={item._id}>
                      <td>
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" id={`check-${item._id}`} />
                          <label className="form-check-label" htmlFor={`check-${item._id}`} />
                        </div>
                      </td>

                      {/* Banner */}
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded bg-light avatar-md d-flex align-items-center justify-content-center">
                            {item.image && (
                              <Image
                                src={item.image}
                                alt={item.title || 'Onboarding banner'}
                                width={80}
                                height={40}
                                className="rounded"
                                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                              />
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Title */}
                      <td>{item.title}</td>

                      {/* Sub Title */}
                      <td>{item.subtitle}</td>

                      {/* Status */}
                      <td>
                        <span className={`badge ${item.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                          {item.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="d-flex gap-2">
                          <Link href={`/onboarding/onboarding-edit/${item._id}`} className="btn btn-soft-info btn-sm">
                            <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                          </Link>
                          <button type="button" className="btn btn-soft-danger btn-sm" onClick={() => handleDelete(item._id)}>
                            <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {onboarding.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center">
                        No Items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ✅ Toast Notification */}
      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant === 'success' ? 'success' : 'danger'}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default OnboardingList
