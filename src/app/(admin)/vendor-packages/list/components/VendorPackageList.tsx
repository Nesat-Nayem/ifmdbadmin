'use client'

import { useGetVendorPackagesQuery, useDeleteVendorPackageMutation, IVendorPackage } from '@/store/vendorApi'
import Link from 'next/link'
import React, { useState } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Container, Row, Toast, ToastContainer, Badge, Modal, Spinner } from 'react-bootstrap'

const VendorPackageList = () => {
  const { data: packages = [], isLoading, isError, refetch } = useGetVendorPackagesQuery()
  const [deletePackage, { isLoading: isDeleting }] = useDeleteVendorPackageMutation()
  
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success')
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; pkg: IVendorPackage | null }>({ show: false, pkg: null })

  const showMessage = (msg: string, type: 'success' | 'danger' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const handleDelete = async () => {
    if (!deleteModal.pkg) return
    try {
      await deletePackage(deleteModal.pkg._id).unwrap()
      showMessage('Package deleted successfully!')
      setDeleteModal({ show: false, pkg: null })
    } catch (err: any) {
      showMessage(err?.data?.message || 'Failed to delete package', 'danger')
    }
  }

  const formatDuration = (duration: number, type: string) => {
    return `${duration} ${type.charAt(0).toUpperCase() + type.slice(1)}`
  }

  if (isLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading packages...</p>
      </Container>
    )
  }

  if (isError) {
    return (
      <Container className="text-center py-5">
        <p className="text-danger">Failed to load packages</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </Container>
    )
  }

  return (
    <>
      <Container>
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center">
            <CardTitle as="h4">📦 Film Trade Packages</CardTitle>
            <Link href="/vendor-packages/add" className="btn btn-primary">
              + Add Package
            </Link>
          </CardHeader>
          <CardBody>
            {packages.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">No packages found. Create your first package!</p>
                <Link href="/vendor-packages/add" className="btn btn-outline-primary">
                  Create Package
                </Link>
              </div>
            ) : (
              <Row className="g-4">
                {packages.map((pkg) => (
                  <Col lg={4} md={6} key={pkg._id}>
                    <Card className={`h-100 ${pkg.isPopular ? 'border-primary border-2' : ''}`}>
                      <CardBody>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h5 className="mb-1">{pkg.name}</h5>
                            {pkg.isPopular && <Badge bg="primary">Popular</Badge>}
                          </div>
                          <Badge bg={pkg.isActive ? 'success' : 'secondary'}>
                            {pkg.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        
                        <h3 className="text-primary mb-2">₹{pkg.price.toLocaleString()}</h3>
                        <p className="text-muted small mb-3">
                          Duration: {formatDuration(pkg.duration, pkg.durationType)}
                        </p>
                        
                        {pkg.description && <p className="small text-muted mb-3">{pkg.description}</p>}
                        
                        <div className="mb-3">
                          <strong className="small">Features:</strong>
                          <ul className="small mb-0 mt-1">
                            {pkg.features.slice(0, 4).map((feature, idx) => (
                              <li key={idx}>✓ {feature}</li>
                            ))}
                            {pkg.features.length > 4 && (
                              <li className="text-muted">+{pkg.features.length - 4} more...</li>
                            )}
                          </ul>
                        </div>
                        
                        <div className="d-flex gap-2">
                          <Link href={`/vendor-packages/edit/${pkg._id}`} className="btn btn-sm btn-outline-primary flex-grow-1">
                            Edit
                          </Link>
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            onClick={() => setDeleteModal({ show: true, pkg })}
                          >
                            Delete
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </CardBody>
        </Card>
      </Container>

      {/* Delete Confirmation Modal */}
      <Modal show={deleteModal.show} onHide={() => setDeleteModal({ show: false, pkg: null })} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the <strong>{deleteModal.pkg?.name}</strong> package?
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteModal({ show: false, pkg: null })}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer className="p-3" position="top-end" style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default VendorPackageList
