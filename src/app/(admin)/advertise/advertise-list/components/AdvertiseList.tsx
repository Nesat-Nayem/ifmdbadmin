'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState, useMemo } from 'react'
import { Card, CardFooter, CardHeader, CardTitle, Col, Row, Toast, ToastContainer } from 'react-bootstrap'
import { useDeleteAdvertiseMutation, useGetAdvertiseQuery } from '@/store/advertiseApi'

const AdvertiseList = () => {
  const [currentPage, setCurrentPage] = useState(1)

  // ✅ Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  const { data: advertiseList = [], isLoading, isError } = useGetAdvertiseQuery()
  const [deleteAdvertise] = useDeleteAdvertiseMutation()

  console.log(advertiseList, 'advertiseList')
  // ✅ Toast trigger
  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  // ✅ Delete handler
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Advertise?')) return
    try {
      await deleteAdvertise(id).unwrap()
      showMessage('Advertise deleted successfully!', 'success')
    } catch (error: any) {
      console.error('Delete failed:', error)
      showMessage(error?.data?.message || 'Failed to delete Advertise', 'error')
    }
  }

  // ✅ Pagination
  const itemsPerPage = 5
  const totalPages = Math.ceil(advertiseList.length / itemsPerPage) || 1

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return advertiseList.slice(startIndex, startIndex + itemsPerPage)
  }, [advertiseList, currentPage])

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center gap-1">
              <CardTitle as={'h4'} className="flex-grow-1">
                All Advertise List
              </CardTitle>
              <Link href="/advertise/advertise-add" className="btn btn-sm btn-success">
                + Add Advertise
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
                    <th>Advertise</th>
                    <th>Link</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((items) => (
                      <tr key={items._id}>
                        <td>
                          <div className="form-check">
                            <input type="checkbox" className="form-check-input" />
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="rounded bg-light avatar-md d-flex align-items-center justify-content-center">
                              <Image width={50} height={50} src={items.image as string} alt="advertise" className="avatar-md" />
                            </div>
                          </div>
                        </td>
                        <td>{items.link}</td>
                        <td>
                          <span className={`badge badge-soft-${items.status.toLowerCase() === 'active' ? 'success' : 'danger'}`}>
                            {items.status.charAt(0).toUpperCase() + items.status.slice(1)}
                          </span>
                        </td>

                        <td>
                          <div className="d-flex gap-2">
                            <Link href={`/advertise/advertise-edit/${items._id}`} className="btn btn-soft-info btn-sm">
                              <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                            </Link>
                            <button className="btn btn-soft-danger btn-sm" onClick={() => handleDelete(items._id)}>
                              <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center">
                        No advertise found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ✅ Pagination */}
            <CardFooter className="border-top">
              <nav>
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

      {/* ✅ Toast Notification */}
      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant === 'success' ? 'success' : 'danger'}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default AdvertiseList
