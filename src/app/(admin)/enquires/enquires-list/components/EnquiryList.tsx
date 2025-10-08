'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useDelteEnquiryMutation, useGetEnquiryQuery } from '@/store/enquiryApi'
import React, { useState } from 'react'
import { Card, CardBody, CardFooter, CardHeader, CardTitle, Toast, ToastContainer } from 'react-bootstrap'

const EnquiryList = () => {
  const [currentPage, setCurrentPage] = useState(1)

  // ✅ Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  const { data = [], isLoading, isError } = useGetEnquiryQuery()
  const [deleteEnquiry, { isLoading: isDeleteLoading }] = useDelteEnquiryMutation()

  if (isLoading) return <p>Loading enquiries...</p>
  if (isError) return <p>Error loading enquiries...</p>

  // ✅ Toast trigger
  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  // ✅ Delete handler
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this enquiry?')) return
    try {
      await deleteEnquiry(id).unwrap()
      showMessage('Enquiry deleted successfully!', 'success')
    } catch (error: any) {
      console.error('Delete failed:', error)
      showMessage(error?.data?.message || 'Failed to delete enquiry', 'error')
    }
  }

  // ✅ Pagination
  const itemsPerPage = 5
  const totalPages = Math.ceil(data.length / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = data.slice(startIndex, startIndex + itemsPerPage)

  // ✅ Page change handler
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center gap-1">
          <CardTitle as={'h4'} className="flex-grow-1">
            All Enquiries List
          </CardTitle>
        </CardHeader>
        <CardBody>
          <div>
            <div className="table-responsive">
              <table className="table align-middle mb-0 table-hover table-centered table-bordered">
                <thead className="bg-light-subtle">
                  <tr>
                    <th style={{ textWrap: 'nowrap' }}>Name</th>
                    <th style={{ textWrap: 'nowrap' }}>Email</th>
                    <th style={{ textWrap: 'nowrap' }}>Phone</th>
                    <th style={{ textWrap: 'nowrap' }}>Purpose</th>
                    <th style={{ textWrap: 'nowrap' }}>Message</th>
                    <th style={{ textWrap: 'nowrap' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((item: any) => (
                      <tr key={item._id}>
                        <td style={{ textWrap: 'nowrap' }}>{item.name}</td>
                        <td style={{ textWrap: 'nowrap' }}>{item.email}</td>
                        <td style={{ textWrap: 'nowrap' }}>{item.phone}</td>
                        <td>{item.purpose}</td>
                        <td>{item.message}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-soft-danger btn-sm"
                            disabled={isDeleteLoading}
                            onClick={() => handleDelete(item._id)}>
                            <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center">
                        No enquiries found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardBody>

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

      {/* ✅ Toast Notification */}
      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant === 'success' ? 'success' : 'danger'}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default EnquiryList
