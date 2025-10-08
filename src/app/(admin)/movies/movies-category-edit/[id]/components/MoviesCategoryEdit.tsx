'use client'

import React, { useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useGetMovieCategoryByIdQuery, useUpdateMovieCategoryMutation } from '@/store/movieCategory'

interface Props {
  id: string
}

const MoviesCategoryEdit: React.FC<Props> = ({ id }) => {
  const router = useRouter()
  const { data, isLoading, isError } = useGetMovieCategoryByIdQuery(id)
  const [updateCategory, { isLoading: isUpdating }] = useUpdateMovieCategoryMutation()

  const [title, setTitle] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive' | ''>('')

  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success')
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    if (data) {
      setTitle(data.title || '')
      setStatus((data.status as any) || '')
    }
  }, [data])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateCategory({ id, data: { title: title.trim(), status: status?.toLowerCase() } }).unwrap()
      setToastMessage('Category updated successfully!')
      setToastVariant('success')
      setShowToast(true)
      setTimeout(() => router.push('/movies/movies-category-list'), 1200)
    } catch (err: any) {
      setToastMessage(err?.data?.message || 'Failed to update category')
      setToastVariant('danger')
      setShowToast(true)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <CardTitle as={'h4'}>Edit Movie Category</CardTitle>
          <Link href="/movies/movies-category-list" className="btn btn-light btn-sm">
            Back to List
          </Link>
        </CardHeader>
        <CardBody>
          {isLoading && (
            <div className="d-flex align-items-center gap-2 text-muted">
              <Spinner size="sm" animation="border" /> Loading...
            </div>
          )}
          {isError && !isLoading && <div className="text-danger">Failed to load category</div>}
          {!isLoading && !isError && (
            <form onSubmit={onSubmit}>
              <Row className="g-3">
                <Col lg={6}>
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter title"
                      required
                    />
                  </div>
                </Col>
                <Col lg={6}>
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value as any)} required>
                      <option value="">Select Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </Col>
              </Row>
              <Row className="justify-content-end g-2">
                <Col lg={2}>
                  <Button type="submit" className="w-100" variant="success" disabled={isUpdating}>
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Col>
              </Row>
            </form>
          )}
        </CardBody>
      </Card>

      <ToastContainer className="p-3" position="top-end" style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default MoviesCategoryEdit
