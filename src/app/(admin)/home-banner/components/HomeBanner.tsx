'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { Card, CardFooter, CardHeader, CardTitle, Col, Row, Toast, ToastContainer } from 'react-bootstrap'
import { useDeleteHomeBannerMutation, useGetHomeBannerQuery, IHomeBanner } from '@/store/homeBannerApi'

const HomeBanner = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  // ✅ Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  const { data: bannerData = [], isLoading, isError } = useGetHomeBannerQuery()
  const [deleteHomeBanner, { isLoading: isDeleteLoading }] = useDeleteHomeBannerMutation()

  console.log(bannerData)
  if (isLoading) return <p>Loading...</p>
  if (isError) return <p>Error loading banners...</p>

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
      await deleteHomeBanner(id).unwrap()
      showMessage('Banner deleted successfully!', 'success')
    } catch (error: any) {
      console.error('Delete failed:', error)
      showMessage(error?.data?.message || 'Failed to delete Banner', 'error')
    }
  }

  // ✅ Filter banners by title
  const filteredEvents = bannerData.filter((banner: IHomeBanner) => banner.title?.toLowerCase().includes(searchTerm.toLowerCase()))

  // ✅ Pagination
  const itemsPerPage = 5
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage) || 1
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = filteredEvents.slice(startIndex, startIndex + itemsPerPage)

  // ✅ Page change handler
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
            <CardHeader className="d-flex justify-content-between align-items-center gap-2 flex-wrap">
              <CardTitle as="h4" className="mb-0">
                Home Banners
              </CardTitle>

              {/* 🔍 Search */}
              <div className="d-flex align-items-center gap-2 ms-auto">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1) // reset to page 1 when searching
                  }}
                  className="form-control form-control-sm"
                  style={{ maxWidth: 200 }}
                />
              </div>

              <Link href="/home-banner/home-banner-add" className="btn btn-sm btn-success">
                + Add Banner
              </Link>
            </CardHeader>

            <div className="table-responsive">
              <table className="table align-middle mb-0 table-hover table-centered table-bordered">
                <thead className="bg-light-subtle">
                  <tr>
                    <th style={{ width: 20 }}>
                      <div className="form-check">
                        <input type="checkbox" className="form-check-input" />
                      </div>
                    </th>
                    <th>Banner</th>
                    <th>Title</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((banner: IHomeBanner) => (
                    <tr key={banner._id}>
                      <td>
                        <div className="form-check">
                          <input type="checkbox" className="form-check-input" id={`check-${banner._id}`} />
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded bg-light avatar-md d-flex align-items-center justify-content-center">
                            <Image
                              src={banner.image}
                              alt="banner"
                              width={80}
                              height={40}
                              className="rounded"
                              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>{banner.title}</td>
                      <td>{banner.order}</td>
                      <td>
                        <span className={`badge ${banner.isActive === true ? 'bg-success' : 'bg-danger'}`}>
                          {banner.isActive === true ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td>
                        <div className="d-flex gap-2">
                          <Link href={`/home-banner/home-banner-edit/${banner._id}`} className="btn btn-soft-info btn-sm">
                            <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                          </Link>
                          <button
                            type="button"
                            className="btn btn-soft-danger btn-sm"
                            onClick={() => handleDelete(banner._id)}
                            disabled={isDeleteLoading}>
                            <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {currentItems.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center">
                        No Banner found
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

export default HomeBanner
