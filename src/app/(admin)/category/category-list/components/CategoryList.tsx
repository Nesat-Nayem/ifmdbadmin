'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useDeleteCategoryMutation, useGetCategoriesQuery } from '@/store/categoryApi'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, Col, Row, Toast, ToastContainer } from 'react-bootstrap'

const CategoryList = () => {
  // ✅ Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  const { data: categoryData, isLoading, isError } = useGetCategoriesQuery()
  const [deleteCategory, { isLoading: isDeleteLoading }] = useDeleteCategoryMutation()

  // ✅ Toast trigger
  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  // ✅ Delete handler
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return
    try {
      await deleteCategory(id).unwrap()
      showMessage('Category deleted successfully!', 'success')
    } catch (error: any) {
      console.error('Delete failed:', error)
      showMessage(error?.data?.message || 'Failed to delete Category', 'error')
    }
  }

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center gap-1">
              <CardTitle as={'h4'} className="flex-grow-1">
                All Categories List
              </CardTitle>
              <Link href="/category/category-add" className="btn btn-sm btn-success">
                + Add Categories
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
                      <th>Categories</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryData?.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="form-check">
                            <input type="checkbox" className="form-check-input" id="customCheck2" />
                            <label className="form-check-label" htmlFor="customCheck2" />
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="rounded bg-light avatar-md d-flex align-items-center justify-content-center">
                              {item.image && <Image src={item.image} alt="product" className="avatar-md" width={40} height={40} />}
                            </div>
                            <p className="text-dark fw-medium fs-15 mb-0">{item.title}</p>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Link href={`/category/category-edit/${item._id}`} className="btn btn-soft-info btn-sm">
                              <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                            </Link>
                            <Link href="" className="btn btn-soft-danger btn-sm" onClick={() => handleDelete(item._id)}>
                              <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {categoryData?.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center">
                          No Banner found
                        </td>
                      </tr>
                    )}
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

export default CategoryList
