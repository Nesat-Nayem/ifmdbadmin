'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useDeleteMovieCategoryMutation, useGetMovieCategoriesQuery } from '@/store/movieCategory'
import Link from 'next/link'
import React, { useState } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  Col,
  Row,
  Spinner,
  Toast,
  ToastContainer,
} from 'react-bootstrap'

const MoviesCategoryList = () => {
  // ✅ Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  const { data: categoryData = [], isLoading, isError } = useGetMovieCategoriesQuery()
  const [deleteCategory, { isLoading: isDeleteLoading }] = useDeleteMovieCategoryMutation()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  // ✅ Toast trigger
  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  // ✅ Delete handler
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    setDeletingId(id)
    try {
      await deleteCategory(id).unwrap()
      showMessage('Category deleted successfully!', 'success')
    } catch (error: any) {
      console.error('Delete failed:', error)
      showMessage(error?.data?.message || 'Failed to delete Category', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center gap-1">
              <CardTitle as={'h4'} className="flex-grow-1">
                Movies Categories List
              </CardTitle>
              <Link href="/movies/movies-category-add" className="btn btn-sm btn-primary">
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
                      <th>Categories Name</th>
                      {/* <th>Status</th> */}
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading && (
                      <tr>
                        <td colSpan={3} className="text-center py-4">
                          <Spinner size="sm" animation="border" className="me-2" /> Loading categories...
                        </td>
                      </tr>
                    )}
                    {isError && !isLoading && (
                      <tr>
                        <td colSpan={3} className="text-center py-4 text-danger">
                          Failed to load categories
                        </td>
                      </tr>
                    )}
                    {!isLoading && !isError && categoryData.length === 0 && (
                      <tr>
                        <td colSpan={3} className="text-center py-4">
                          No categories found
                        </td>
                      </tr>
                    )}
                    {!isLoading && !isError && categoryData.map((category: any, index: number) => (
                      <tr key={index}>
                        <td>
                          <div className="form-check">
                            <input type="checkbox" className="form-check-input" id="customCheck2" />
                            <label className="form-check-label" htmlFor="customCheck2" />
                          </div>
                        </td>
                        <td>{category.title}</td>
                        {/* <td className={`fw-medium text-success`}>Active</td> */}
                        <td>
                          <div className="d-flex gap-2">
                            <Link href={`/movies/movies-category-edit/${category._id}`} className="btn btn-soft-info btn-sm">
                              <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                            </Link>
                            <button
                              type="button"
                              className="btn btn-soft-danger btn-sm"
                              onClick={() => handleDelete(category._id)}
                              disabled={isDeleteLoading && deletingId === category._id}
                            >
                              {isDeleteLoading && deletingId === category._id ? (
                                <Spinner size="sm" animation="border" className="me-1" />
                              ) : (
                                <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                              )}
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

export default MoviesCategoryList
