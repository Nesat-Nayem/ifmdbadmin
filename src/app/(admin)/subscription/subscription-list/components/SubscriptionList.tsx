'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { getAllCategory } from '@/helpers/data'
import { useDeleteSubscriptionPlanMutation, useGetSubscriptionPlansQuery } from '@/store/subscriptionPlanApi'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  Toast,
  ToastContainer,
} from 'react-bootstrap'

const SubscriptionList = () => {
  // ✅ Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  const { data: subscriptionData = [], isLoading, isError } = useGetSubscriptionPlansQuery()

  console.log(subscriptionData || 'subscriptionData')

  const [deletePlan, { isLoading: isDeleting }] = useDeleteSubscriptionPlanMutation()

  // ✅ Toast trigger
  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  // ✅ Delete Subscription handler
  const handleDelete = async (id: string) => {
    try {
      await deletePlan(id).unwrap()
      showMessage('Subscription deleted successfully!', 'success')
    } catch (error) {
      console.error(error)
      showMessage('Failed to delete Subscription', 'error')
    }
  }
  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center gap-1">
              <CardTitle as={'h4'} className="flex-grow-1">
                All Subscription List
              </CardTitle>
              <Link href="/subscription/subscription-add" className="btn btn-sm btn-success">
                + Add Subscription
              </Link>
            </CardHeader>
            <div>
              <div className="table-responsive">
                <table className="table align-middle mb-0 table-hover table-centered">
                  <thead className="bg-light-subtle">
                    <tr>
                      <th style={{ width: 20 }}>
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" id="customCheck1" />
                          <label className="form-check-label" htmlFor="customCheck1" />
                        </div>
                      </th>
                      <th>Plan Name</th>
                      <th>Plan Cost</th>
                      <th>Plan Includes</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptionData.map((item: any) => (
                      <tr key={item._id}>
                        {/* Checkbox */}
                        <td>
                          <div className="form-check">
                            <input type="checkbox" className="form-check-input" id={`check-${item._id}`} />
                            <label className="form-check-label" htmlFor={`check-${item._id}`} />
                          </div>
                        </td>

                        {/* Plan Name */}
                        <td>{item.planName}</td>

                        {/* Plan Cost */}
                        <td>Rs.{item.planCost}</td>

                        {/* Plan Includes */}
                        <td>
                          <div>
                            <ul>
                              {item.planInclude?.map((include: string, idx: number) => (
                                <li key={idx}>{include}</li>
                              ))}
                            </ul>
                          </div>
                        </td>

                        {/* Actions */}
                        <td>
                          <div className="d-flex gap-2">
                            <Link href={`/subscription/subscription-edit/${item._id}`} className="btn btn-soft-info btn-sm">
                              <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                            </Link>
                            <button
                              type="button"
                              className="btn btn-soft-danger btn-sm"
                              onClick={() => handleDelete(item._id)} // ⚡ Add delete handler
                            >
                              <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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

export default SubscriptionList
