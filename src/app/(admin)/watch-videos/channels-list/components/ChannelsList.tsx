'use client'

import React, { useState } from 'react'
import { Card, CardBody, Table, Button, Spinner, Badge, Modal, Form, Row, Col, Toast, ToastContainer } from 'react-bootstrap'
import Image from 'next/image'
import { useGetChannelsQuery, useCreateChannelMutation, useDeleteChannelMutation } from '@/store/watchVideosApi'
import { useUploadSingleMutation } from '@/store/uploadApi'
import { FaEdit, FaTrash, FaPlus, FaCheck, FaUsers, FaEye } from 'react-icons/fa'

const ChannelsList = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [deleteModal, setDeleteModal] = useState({ show: false, id: '', name: '' })
  const [createModal, setCreateModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success')

  // Form state
  const [newChannel, setNewChannel] = useState({
    name: '',
    description: '',
    isVerified: false,
    isActive: true,
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)

  const { data, isLoading, isError, refetch } = useGetChannelsQuery({ page, limit: 10, search })
  const channels = data?.data || []
  const meta = data?.meta || { total: 0, totalPages: 1 }

  const [createChannel, { isLoading: isCreating }] = useCreateChannelMutation()
  const [deleteChannel, { isLoading: isDeleting }] = useDeleteChannelMutation()
  const [uploadSingle] = useUploadSingleMutation()

  const handleDelete = async () => {
    try {
      await deleteChannel(deleteModal.id).unwrap()
      setDeleteModal({ show: false, id: '', name: '' })
      setToastMessage('Channel deleted successfully!')
      setToastVariant('success')
      setShowToast(true)
      refetch()
    } catch (error) {
      setToastMessage('Failed to delete channel')
      setToastVariant('danger')
      setShowToast(true)
    }
  }

  const handleCreate = async () => {
    try {
      let logoUrl = ''
      let bannerUrl = ''

      if (logoFile) {
        try { logoUrl = await uploadSingle(logoFile).unwrap() } 
        catch { logoUrl = URL.createObjectURL(logoFile) }
      }
      if (bannerFile) {
        try { bannerUrl = await uploadSingle(bannerFile).unwrap() }
        catch { bannerUrl = URL.createObjectURL(bannerFile) }
      }

      const user = JSON.parse(localStorage.getItem('user') || '{}')
      
      await createChannel({
        ...newChannel,
        logoUrl,
        bannerUrl,
        ownerId: user._id,
        ownerType: user.role === 'admin' ? 'admin' : 'vendor',
      }).unwrap()

      setCreateModal(false)
      setNewChannel({ name: '', description: '', isVerified: false, isActive: true })
      setLogoFile(null)
      setBannerFile(null)
      setToastMessage('Channel created successfully!')
      setToastVariant('success')
      setShowToast(true)
      refetch()
    } catch (error: any) {
      setToastMessage(error?.data?.message || 'Failed to create channel')
      setToastVariant('danger')
      setShowToast(true)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardBody className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading channels...</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <>
      <ToastContainer position="top-end" className="p-3">
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide bg={toastVariant}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">Video Channels ({meta.total})</h4>
            <Button variant="primary" onClick={() => setCreateModal(true)}>
              <FaPlus className="me-2" /> Create Channel
            </Button>
          </div>

          <Row className="mb-4">
            <Col md={4}>
              <Form.Control
                type="text"
                placeholder="Search channels..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
            </Col>
          </Row>

          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th style={{ width: '60px' }}>Logo</th>
                  <th>Name</th>
                  <th>Owner</th>
                  <th>Subscribers</th>
                  <th>Views</th>
                  <th>Status</th>
                  <th style={{ width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {channels.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-4">No channels found</td></tr>
                ) : (
                  channels.map((channel: any) => (
                    <tr key={channel._id}>
                      <td>
                        {channel.logoUrl ? (
                          <Image src={channel.logoUrl} alt={channel.name} width={50} height={50} className="rounded-circle object-fit-cover" />
                        ) : (
                          <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 50, height: 50 }}>
                            <span className="text-white">{channel.name?.charAt(0)}</span>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <span className="fw-medium">{channel.name}</span>
                          {channel.isVerified && <FaCheck className="text-primary" title="Verified" />}
                        </div>
                        <small className="text-muted">{channel.description?.substring(0, 50)}...</small>
                      </td>
                      <td>
                        <Badge bg={channel.ownerType === 'admin' ? 'info' : 'secondary'}>
                          {channel.ownerType}
                        </Badge>
                      </td>
                      <td>
                        <span className="d-flex align-items-center gap-1">
                          <FaUsers className="text-muted" />
                          {channel.subscriberCount?.toLocaleString() || 0}
                        </span>
                      </td>
                      <td>
                        <span className="d-flex align-items-center gap-1">
                          <FaEye className="text-muted" />
                          {channel.totalViews?.toLocaleString() || 0}
                        </span>
                      </td>
                      <td>
                        <Badge bg={channel.isActive ? 'success' : 'secondary'}>
                          {channel.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button size="sm" variant="outline-primary"><FaEdit /></Button>
                          <Button 
                            size="sm" 
                            variant="outline-danger"
                            onClick={() => setDeleteModal({ show: true, id: channel._id, name: channel.name })}
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          {meta.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <span className="text-muted">Page {page} of {meta.totalPages}</span>
              <div className="d-flex gap-2">
                <Button variant="outline-secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <Button variant="outline-secondary" size="sm" disabled={page === meta.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Create Channel Modal */}
      <Modal show={createModal} onHide={() => setCreateModal(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>Create New Channel</Modal.Title></Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label>Channel Name *</Form.Label>
                <Form.Control 
                  value={newChannel.name}
                  onChange={(e) => setNewChannel({...newChannel, name: e.target.value})}
                  placeholder="Enter channel name"
                />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control 
                  as="textarea"
                  rows={3}
                  value={newChannel.description}
                  onChange={(e) => setNewChannel({...newChannel, description: e.target.value})}
                  placeholder="Channel description"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Channel Logo</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={(e: any) => setLogoFile(e.target.files?.[0] || null)} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Channel Banner</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={(e: any) => setBannerFile(e.target.files?.[0] || null)} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Check type="switch" label="Verified Channel" checked={newChannel.isVerified} onChange={(e) => setNewChannel({...newChannel, isVerified: e.target.checked})} />
            </Col>
            <Col md={6}>
              <Form.Check type="switch" label="Active" checked={newChannel.isActive} onChange={(e) => setNewChannel({...newChannel, isActive: e.target.checked})} />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setCreateModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleCreate} disabled={isCreating || !newChannel.name}>
            {isCreating ? <Spinner size="sm" /> : 'Create Channel'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={deleteModal.show} onHide={() => setDeleteModal({ show: false, id: '', name: '' })}>
        <Modal.Header closeButton><Modal.Title>Confirm Delete</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to delete <strong>{deleteModal.name}</strong>?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteModal({ show: false, id: '', name: '' })}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? <Spinner size="sm" /> : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default ChannelsList
