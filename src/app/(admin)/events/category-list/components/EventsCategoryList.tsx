'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { Badge, Card, CardFooter, CardHeader, CardTitle, Col, Row, Toast, ToastContainer } from 'react-bootstrap'
import { useGetEventCategoriesQuery, useDeleteEventCategoryMutation, IEventCategory } from '@/store/eventCategoryApi'

const EventsCategoryList = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success')
  const [showToast, setShowToast] = useState(false)

  const { data: categories = [], isLoading, isError } = useGetEventCategoriesQuery()
  const [deleteEventCategory, { isLoading: isDeleting }] = useDeleteEventCategoryMutation()

  if (isLoading) return <div className="text-center py-5">Loading categories...</div>
  if (isError) return <div className="text-center py-5 text-danger">Error loading categories</div>

  // Filter categories by name
  const filteredCategories = categories.filter((cat: IEventCategory) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination
  const itemsPerPage = 10
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = filteredCategories.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const showMessage = (msg: string, type: 'success' | 'danger' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    try {
      await deleteEventCategory(id).unwrap()
      showMessage('Category deleted successfully!', 'success')
    } catch (error: any) {
      console.error('Delete failed:', error)
      showMessage(error?.data?.message || 'Failed to delete category', 'danger')
    }
  }

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
              <CardTitle as="h4" className="mb-0">
                Event Categories List
              </CardTitle>

              {/* Search */}
              <div className="d-flex align-items-center gap-2 ms-auto">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="form-control form-control-sm"
                  style={{ maxWidth: 200 }}
                />
              </div>

              <Link href="/events/category-add" className="btn btn-sm btn-primary">
                + Add Category
              </Link>
            </CardHeader>

            <div className="table-responsive">
              <table className="table align-middle mb-0 table-hover table-centered table-bordered">
                <thead className="bg-light-subtle">
                  <tr>
                    <th style={{ width: 20 }}>
                      <div className="form-check">
                        <input type="checkbox" className="form-check-input" id="checkAll" />
                      </div>
                    </th>
                    <th>Image</th>
                    <th>Category Name</th>
                    <th>Music Show</th>
                    <th>Comedy Show</th>
                    <th>Event Count</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((category: IEventCategory) => (
                    <tr key={category._id}>
                      <td>
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" />
                        </div>
                      </td>
                      <td>
                        <div className="rounded bg-light avatar-md d-flex align-items-center justify-content-center">
                          <Image
                            src={category.image || '/placeholder.png'}
                            alt={category.name}
                            width={60}
                            height={60}
                            className="rounded"
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                      </td>
                      <td className="fw-medium">{category.name}</td>
                      <td>
                        {category.isMusicShow ? (
                          <Badge bg="info">Yes</Badge>
                        ) : (
                          <Badge bg="secondary">No</Badge>
                        )}
                      </td>
                      <td>
                        {category.isComedyShow ? (
                          <Badge bg="warning">Yes</Badge>
                        ) : (
                          <Badge bg="secondary">No</Badge>
                        )}
                      </td>
                      <td>{category.eventCount || 0}</td>
                      <td>
                        <Badge bg={category.isActive ? 'success' : 'danger'}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link href={`/events/category-edit/${category._id}`} className="btn btn-soft-info btn-sm">
                            <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                          </Link>
                          <button
                            className="btn btn-soft-danger btn-sm"
                            onClick={() => handleDelete(category._id)}
                            disabled={isDeleting}
                          >
                            <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {currentItems.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-4">
                        No categories found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <CardFooter className="border-top">
              <nav aria-label="Page navigation">
                <ul className="pagination justify-content-end mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                      Previous
                    </button>
                  </li>

                  {Array.from({ length: totalPages }, (_, index) => (
                    <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => handlePageChange(index + 1)}>
                        {index + 1}
                      </button>
                    </li>
                  ))}

                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </CardFooter>
          </Card>
        </Col>
      </Row>

      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default EventsCategoryList
