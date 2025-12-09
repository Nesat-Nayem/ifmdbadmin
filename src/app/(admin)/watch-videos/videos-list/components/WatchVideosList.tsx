'use client'

import React, { useState } from 'react'
import { Card, CardBody, Table, Button, Spinner, Badge, Form, Row, Col, Modal } from 'react-bootstrap'
import Link from 'next/link'
import Image from 'next/image'
import { useGetWatchVideosQuery, useDeleteWatchVideoMutation } from '@/store/watchVideosApi'
import { FaEdit, FaTrash, FaEye, FaPlus, FaPlay, FaCrown } from 'react-icons/fa'

// Format duration from seconds
const formatDuration = (seconds: number) => {
  if (!seconds) return "N/A"
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hrs > 0) return `${hrs}h ${mins}m`
  return `${mins}m`
}

const WatchVideosList = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [videoTypeFilter, setVideoTypeFilter] = useState('')
  const [deleteModal, setDeleteModal] = useState({ show: false, id: '', title: '' })

  const { data, isLoading, isError, refetch } = useGetWatchVideosQuery({
    page,
    limit: 10,
    search,
    status: statusFilter,
    videoType: videoTypeFilter,
  })

  const [deleteVideo, { isLoading: isDeleting }] = useDeleteWatchVideoMutation()

  const videos = data?.data || []
  const meta = data?.meta || { total: 0, totalPages: 1 }

  const handleDelete = async () => {
    try {
      await deleteVideo(deleteModal.id).unwrap()
      setDeleteModal({ show: false, id: '', title: '' })
      refetch()
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge bg="success">Published</Badge>
      case 'draft':
        return <Badge bg="warning">Draft</Badge>
      case 'archived':
        return <Badge bg="secondary">Archived</Badge>
      default:
        return <Badge bg="info">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardBody className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading videos...</p>
        </CardBody>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardBody className="text-center py-5 text-danger">
          Error loading videos. Please try again.
          <Button variant="outline-primary" className="ms-2" onClick={() => refetch()}>
            Retry
          </Button>
        </CardBody>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardBody>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">Watch Videos ({meta.total})</h4>
            <Link href="/watch-videos/videos-add">
              <Button variant="primary">
                <FaPlus className="me-2" /> Add New Video
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <Row className="mb-4">
            <Col md={4}>
              <Form.Control
                type="text"
                placeholder="Search videos..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </Col>
            <Col md={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={videoTypeFilter}
                onChange={(e) => {
                  setVideoTypeFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">All Types</option>
                <option value="single">Single Video</option>
                <option value="series">Series</option>
              </Form.Select>
            </Col>
          </Row>

          {/* Table */}
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th style={{ width: '80px' }}>Thumbnail</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Channel</th>
                  <th>Price</th>
                  <th>Duration</th>
                  <th>Views</th>
                  <th>Status</th>
                  <th style={{ width: '150px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-4">
                      No videos found
                    </td>
                  </tr>
                ) : (
                  videos.map((video: any) => (
                    <tr key={video._id}>
                      <td>
                        <div className="position-relative" style={{ width: 70, height: 45 }}>
                          <Image
                            src={video.thumbnailUrl || video.posterUrl || '/assets/images/placeholder.png'}
                            alt={video.title}
                            fill
                            className="rounded object-fit-cover"
                          />
                        </div>
                      </td>
                      <td>
                        <div className="fw-medium">{video.title}</div>
                        <small className="text-muted">
                          {video.genres?.slice(0, 2).join(', ')}
                        </small>
                      </td>
                      <td>
                        <Badge bg={video.videoType === 'series' ? 'purple' : 'info'}>
                          {video.videoType === 'series' ? 'Series' : 'Movie'}
                        </Badge>
                        {video.videoType === 'series' && video.totalEpisodes > 0 && (
                          <small className="d-block text-muted">{video.totalEpisodes} episodes</small>
                        )}
                      </td>
                      <td>
                        <small>{video.channelId?.name || 'N/A'}</small>
                      </td>
                      <td>
                        {video.isFree ? (
                          <Badge bg="success">Free</Badge>
                        ) : (
                          <span className="text-warning">
                            <FaCrown className="me-1" />
                            ₹{video.defaultPrice}
                          </span>
                        )}
                      </td>
                      <td>{formatDuration(video.duration)}</td>
                      <td>{video.viewCount?.toLocaleString() || 0}</td>
                      <td>{getStatusBadge(video.status)}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <Link href={`/watch-videos/${video._id}`}>
                            <Button size="sm" variant="outline-info" title="View">
                              <FaEye />
                            </Button>
                          </Link>
                          <Link href={`/watch-videos/videos-edit/${video._id}`}>
                            <Button size="sm" variant="outline-primary" title="Edit">
                              <FaEdit />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            title="Delete"
                            onClick={() => setDeleteModal({ show: true, id: video._id, title: video.title })}
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

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <span className="text-muted">
                Page {page} of {meta.totalPages}
              </span>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={page === meta.totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={deleteModal.show} onHide={() => setDeleteModal({ show: false, id: '', title: '' })}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{deleteModal.title}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteModal({ show: false, id: '', title: '' })}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? <Spinner size="sm" /> : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default WatchVideosList
