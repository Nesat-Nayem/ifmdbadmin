'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardBody, Row, Col, Badge, Button, Spinner, Table } from 'react-bootstrap'
import Link from 'next/link'
import Image from 'next/image'
import { useGetWatchVideoByIdQuery } from '@/store/watchVideosApi'
import { 
  FaEdit, FaArrowLeft, FaPlay, FaClock, FaEye, FaStar, FaCalendar, 
  FaGlobe, FaTags, FaUsers, FaCrown, FaCheckCircle, FaTimesCircle 
} from 'react-icons/fa'

interface VideoDetailsProps {
  videoId: string
}

const VideoDetails: React.FC<VideoDetailsProps> = ({ videoId }) => {
  const router = useRouter()
  const { data, isLoading, isError, refetch } = useGetWatchVideoByIdQuery(videoId)
  const video = data as any // Cast to any for flexible field access

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00'
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`
    }
    return `${mins}m ${secs}s`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published': return <Badge bg="success">Published</Badge>
      case 'draft': return <Badge bg="warning">Draft</Badge>
      case 'archived': return <Badge bg="secondary">Archived</Badge>
      default: return <Badge bg="secondary">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardBody className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading video details...</p>
        </CardBody>
      </Card>
    )
  }

  if (isError || !video) {
    return (
      <Card>
        <CardBody className="text-center py-5 text-danger">
          <p>Failed to load video details.</p>
          <Button variant="outline-primary" onClick={() => refetch()}>Retry</Button>
          <Button variant="outline-secondary" className="ms-2" onClick={() => router.back()}>Go Back</Button>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="video-details">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button variant="outline-secondary" onClick={() => router.back()}>
          <FaArrowLeft className="me-2" /> Back
        </Button>
        <div className="d-flex gap-2">
          <Link href={`/watch-videos/videos-edit/${videoId}`}>
            <Button variant="primary">
              <FaEdit className="me-2" /> Edit Video
            </Button>
          </Link>
        </div>
      </div>

      <Row>
        {/* Main Content */}
        <Col lg={8}>
          {/* Video Preview */}
          <Card className="mb-4">
            <CardBody className="p-0">
              <div className="position-relative" style={{ aspectRatio: '16/9', background: '#000' }}>
                {video.videoUrl?.includes('cloudflarestream') ? (
                  <iframe
                    src={video.videoUrl}
                    style={{ border: 'none', width: '100%', height: '100%' }}
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                    allowFullScreen
                  />
                ) : video.thumbnailUrl || video.posterUrl ? (
                  <div className="w-100 h-100 d-flex align-items-center justify-content-center position-relative">
                    <Image
                      src={video.thumbnailUrl || video.posterUrl || '/assets/images/placeholder.png'}
                      alt={video.title}
                      fill
                      className="object-fit-cover"
                    />
                    <div className="position-absolute bg-dark bg-opacity-50 rounded-circle p-4" style={{ cursor: 'pointer' }}>
                      <FaPlay className="text-white" size={32} />
                    </div>
                  </div>
                ) : (
                  <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-secondary">
                    <FaPlay className="text-white" size={48} />
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Video Info */}
          <Card className="mb-4">
            <CardBody>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h3 className="mb-2">{video.title}</h3>
                  <div className="d-flex gap-2 flex-wrap">
                    {getStatusBadge(video.status)}
                    <Badge bg={video.videoType === 'series' ? 'info' : 'primary'}>
                      {video.videoType === 'series' ? 'Series' : 'Movie'}
                    </Badge>
                    {video.isFeatured && <Badge bg="warning"><FaStar /> Featured</Badge>}
                    {video.isFree ? (
                      <Badge bg="success">Free</Badge>
                    ) : (
                      <Badge bg="dark"><FaCrown /> Premium</Badge>
                    )}
                  </div>
                </div>
                <div className="text-end">
                  <h4 className="text-primary mb-0">
                    {video.isFree ? 'Free' : `₹${video.defaultPrice}`}
                  </h4>
                  {video.rentalPrice > 0 && (
                    <small className="text-muted">Rent: ₹{video.rentalPrice}</small>
                  )}
                </div>
              </div>

              <p className="text-muted">{video.description || 'No description available.'}</p>

              {/* Stats Row */}
              <Row className="g-3 mt-3">
                <Col xs={6} md={3}>
                  <div className="d-flex align-items-center gap-2">
                    <FaClock className="text-muted" />
                    <div>
                      <small className="text-muted d-block">Duration</small>
                      <strong>{formatDuration(video.duration)}</strong>
                    </div>
                  </div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="d-flex align-items-center gap-2">
                    <FaEye className="text-muted" />
                    <div>
                      <small className="text-muted d-block">Views</small>
                      <strong>{video.viewCount?.toLocaleString() || 0}</strong>
                    </div>
                  </div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="d-flex align-items-center gap-2">
                    <FaStar className="text-warning" />
                    <div>
                      <small className="text-muted d-block">Rating</small>
                      <strong>{video.averageRating?.toFixed(1) || 'N/A'}</strong>
                    </div>
                  </div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="d-flex align-items-center gap-2">
                    <FaCalendar className="text-muted" />
                    <div>
                      <small className="text-muted d-block">Release</small>
                      <strong>{formatDate(video.releaseDate)}</strong>
                    </div>
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>

          {/* Genres & Tags */}
          <Card className="mb-4">
            <CardBody>
              <h5 className="mb-3">Genres & Tags</h5>
              <Row className="g-3">
                <Col md={6}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <FaTags className="text-muted" />
                    <strong>Genres</strong>
                  </div>
                  <div className="d-flex flex-wrap gap-1">
                    {video.genres?.length > 0 ? (
                      video.genres.map((genre: string, idx: number) => (
                        <Badge key={idx} bg="primary" className="fw-normal">{genre}</Badge>
                      ))
                    ) : (
                      <span className="text-muted">No genres</span>
                    )}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <FaTags className="text-muted" />
                    <strong>Tags</strong>
                  </div>
                  <div className="d-flex flex-wrap gap-1">
                    {video.tags?.length > 0 ? (
                      video.tags.map((tag: string, idx: number) => (
                        <Badge key={idx} bg="secondary" className="fw-normal">{tag}</Badge>
                      ))
                    ) : (
                      <span className="text-muted">No tags</span>
                    )}
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>

          {/* Cast & Crew */}
          {(video.cast?.length > 0 || video.crew?.length > 0) && (
            <Card className="mb-4">
              <CardBody>
                <h5 className="mb-3"><FaUsers className="me-2" />Cast & Crew</h5>
                <Row className="g-4">
                  {video.cast?.length > 0 && (
                    <Col md={6}>
                      <h6>Cast</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {video.cast.map((person: any, idx: number) => (
                          <div key={idx} className="d-flex align-items-center gap-2 bg-light rounded-pill px-3 py-1">
                            {person.photoUrl && (
                              <Image src={person.photoUrl} alt={person.name} width={24} height={24} className="rounded-circle" />
                            )}
                            <span>{person.name}</span>
                            {person.character && <small className="text-muted">({person.character})</small>}
                          </div>
                        ))}
                      </div>
                    </Col>
                  )}
                  {video.crew?.length > 0 && (
                    <Col md={6}>
                      <h6>Crew</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {video.crew.map((person: any, idx: number) => (
                          <div key={idx} className="d-flex align-items-center gap-2 bg-light rounded-pill px-3 py-1">
                            <span>{person.name}</span>
                            <small className="text-muted">({person.role})</small>
                          </div>
                        ))}
                      </div>
                    </Col>
                  )}
                </Row>
              </CardBody>
            </Card>
          )}

          {/* Seasons & Episodes (for series) */}
          {video.videoType === 'series' && video.seasons?.length > 0 && (
            <Card className="mb-4">
              <CardBody>
                <h5 className="mb-3">Seasons & Episodes</h5>
                {video.seasons.map((season: any, sIdx: number) => (
                  <div key={sIdx} className="mb-4">
                    <h6 className="bg-light p-2 rounded">
                      Season {season.seasonNumber}: {season.title || `Season ${season.seasonNumber}`}
                    </h6>
                    <Table size="sm" className="mb-0">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Title</th>
                          <th>Duration</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {season.episodes?.map((ep: any, eIdx: number) => (
                          <tr key={eIdx}>
                            <td>{ep.episodeNumber}</td>
                            <td>{ep.title}</td>
                            <td>{formatDuration(ep.duration)}</td>
                            <td>
                              {ep.isActive ? (
                                <FaCheckCircle className="text-success" />
                              ) : (
                                <FaTimesCircle className="text-danger" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}
        </Col>

        {/* Sidebar */}
        <Col lg={4}>
          {/* Channel Info */}
          <Card className="mb-4">
            <CardBody>
              <h6 className="mb-3">Channel</h6>
              {video.channelId ? (
                <div className="d-flex align-items-center gap-3">
                  {video.channelId.logoUrl ? (
                    <Image
                      src={video.channelId.logoUrl}
                      alt={video.channelId.name}
                      width={50}
                      height={50}
                      className="rounded-circle"
                    />
                  ) : (
                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 50, height: 50 }}>
                      <span className="text-white fw-bold">{video.channelId.name?.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <strong>{video.channelId.name}</strong>
                    <small className="d-block text-muted">{video.channelId.subscriberCount?.toLocaleString() || 0} subscribers</small>
                  </div>
                </div>
              ) : (
                <span className="text-muted">No channel assigned</span>
              )}
            </CardBody>
          </Card>

          {/* Video Details */}
          <Card className="mb-4">
            <CardBody>
              <h6 className="mb-3">Details</h6>
              <Table size="sm" borderless className="mb-0">
                <tbody>
                  <tr>
                    <td className="text-muted">Category</td>
                    <td><strong>{video.category || video.categoryId?.name || 'N/A'}</strong></td>
                  </tr>
                  <tr>
                    <td className="text-muted">Age Rating</td>
                    <td><Badge bg="dark">{video.ageRating || 'N/A'}</Badge></td>
                  </tr>
                  <tr>
                    <td className="text-muted">Languages</td>
                    <td>
                      {video.languages?.length > 0 ? (
                        <div className="d-flex flex-wrap gap-1">
                          {video.languages.map((lang: string, idx: number) => (
                            <Badge key={idx} bg="outline-secondary" className="border">{lang}</Badge>
                          ))}
                        </div>
                      ) : 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted">Created</td>
                    <td>{formatDate(video.createdAt)}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Updated</td>
                    <td>{formatDate(video.updatedAt)}</td>
                  </tr>
                </tbody>
              </Table>
            </CardBody>
          </Card>

          {/* Country Pricing */}
          {video.countryPricing?.length > 0 && (
            <Card className="mb-4">
              <CardBody>
                <h6 className="mb-3"><FaGlobe className="me-2" />Country Pricing</h6>
                <Table size="sm" className="mb-0">
                  <thead>
                    <tr>
                      <th>Country</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {video.countryPricing.map((cp: any, idx: number) => (
                      <tr key={idx}>
                        <td>{cp.countryName}</td>
                        <td>{cp.currency} {cp.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          )}

          {/* Status Flags */}
          <Card>
            <CardBody>
              <h6 className="mb-3">Status</h6>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex justify-content-between align-items-center">
                  <span>Active</span>
                  {video.isActive ? (
                    <Badge bg="success"><FaCheckCircle className="me-1" />Yes</Badge>
                  ) : (
                    <Badge bg="danger"><FaTimesCircle className="me-1" />No</Badge>
                  )}
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span>Featured</span>
                  {video.isFeatured ? (
                    <Badge bg="success"><FaCheckCircle className="me-1" />Yes</Badge>
                  ) : (
                    <Badge bg="secondary"><FaTimesCircle className="me-1" />No</Badge>
                  )}
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span>Free</span>
                  {video.isFree ? (
                    <Badge bg="success"><FaCheckCircle className="me-1" />Yes</Badge>
                  ) : (
                    <Badge bg="secondary"><FaTimesCircle className="me-1" />No</Badge>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default VideoDetails
