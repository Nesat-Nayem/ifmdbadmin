'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardBody, CardHeader, CardTitle, Form, Button, Row, Col, Spinner, Toast, ToastContainer, Tab, Tabs, Badge } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { FaSave, FaArrowLeft } from 'react-icons/fa'
import { 
  useGetWatchVideoByIdQuery, 
  useUpdateWatchVideoMutation, 
  useGetWatchVideoCategoriesQuery, 
  useGetChannelsQuery 
} from '@/store/watchVideosApi'
import { useUploadSingleMutation } from '@/store/uploadApi'
import CloudflareVideoUploader from '@/components/CloudflareVideoUploader'

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  description: yup.string().optional(),
  channelId: yup.string().required('Channel is required'),
  videoType: yup.string().oneOf(['single', 'series']).required(),
  category: yup.string().optional(),
  duration: yup.number().min(0).optional(),
  releaseDate: yup.string().optional(),
  ageRating: yup.string().optional(),
  status: yup.string().oneOf(['draft', 'published', 'archived']).optional(),
  isFeatured: yup.boolean().optional(),
  isFree: yup.boolean().optional(),
  defaultPrice: yup.number().min(0).optional(),
  rentalDays: yup.number().min(0).optional(),
})

type FormValues = yup.InferType<typeof schema>

interface VideoEditProps {
  videoId: string
}

const VideoEdit: React.FC<VideoEditProps> = ({ videoId }) => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('basic')

  // Toast state
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success')

  // Media states
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [posterFile, setPosterFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [trailerUrl, setTrailerUrl] = useState('')
  const [cloudflareVideoUid, setCloudflareVideoUid] = useState('')
  const [cloudflareTrailerUid, setCloudflareTrailerUid] = useState('')

  // Fetch video data
  const { data, isLoading: isLoadingVideo, isError } = useGetWatchVideoByIdQuery(videoId)
  const video = data as any

  // Fetch data
  const { data: categories = [] } = useGetWatchVideoCategoriesQuery()
  const { data: channelsData } = useGetChannelsQuery({ limit: 100 })
  const channels = channelsData?.data || []

  // Mutations
  const [updateVideo, { isLoading: isUpdating }] = useUpdateWatchVideoMutation()
  const [uploadSingle] = useUploadSingleMutation()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  })

  // Populate form when video data is loaded
  useEffect(() => {
    if (video) {
      reset({
        title: video.title,
        description: video.description,
        channelId: video.channelId?._id || video.channelId,
        videoType: video.videoType,
        category: video.category,
        duration: video.duration,
        releaseDate: video.releaseDate ? new Date(video.releaseDate).toISOString().split('T')[0] : '',
        ageRating: video.ageRating,
        status: video.status,
        isFeatured: video.isFeatured,
        isFree: video.isFree,
        defaultPrice: video.defaultPrice,
        rentalDays: video.rentalDays,
      })

      // Set media URLs
      setVideoUrl(video.videoUrl || '')
      setTrailerUrl(video.trailerUrl || '')
    }
  }, [video, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      let thumbnailUrl = video?.thumbnailUrl || ''
      let posterUrl = video?.posterUrl || ''

      // Upload new images if selected
      if (thumbnailFile) {
        try {
          thumbnailUrl = await uploadSingle(thumbnailFile).unwrap()
        } catch {
          thumbnailUrl = URL.createObjectURL(thumbnailFile)
        }
      }

      if (posterFile) {
        try {
          posterUrl = await uploadSingle(posterFile).unwrap()
        } catch {
          posterUrl = URL.createObjectURL(posterFile)
        }
      }

      const updateData: any = {
        ...values,
        thumbnailUrl: thumbnailUrl || video?.thumbnailUrl,
        posterUrl: posterUrl || video?.posterUrl,
        videoUrl: videoUrl || video?.videoUrl,
        trailerUrl: trailerUrl || video?.trailerUrl,
      }

      await updateVideo({ id: videoId, ...updateData }).unwrap()

      setToastMessage('Video updated successfully!')
      setToastVariant('success')
      setShowToast(true)

      setTimeout(() => {
        router.push('/watch-videos/videos-list')
      }, 1500)
    } catch (error: any) {
      setToastMessage(error?.data?.message || 'Failed to update video')
      setToastVariant('danger')
      setShowToast(true)
    }
  }

  if (isLoadingVideo) {
    return (
      <Card>
        <CardBody className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading video data...</p>
        </CardBody>
      </Card>
    )
  }

  if (isError || !video) {
    return (
      <Card>
        <CardBody className="text-center py-5 text-danger">
          <p>Failed to load video data.</p>
          <Button variant="outline-primary" onClick={() => router.back()}>Go Back</Button>
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

      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button variant="outline-secondary" onClick={() => router.back()}>
          <FaArrowLeft className="me-2" /> Back
        </Button>
        <Badge bg={video.status === 'published' ? 'success' : video.status === 'draft' ? 'warning' : 'secondary'}>
          {video.status?.toUpperCase()}
        </Badge>
      </div>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Edit Video: {video.title}</CardTitle>
          </CardHeader>
          <CardBody>
            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'basic')} className="mb-4">
              {/* Basic Info Tab */}
              <Tab eventKey="basic" title="Basic Info">
                <Row className="g-3">
                  <Col md={8}>
                    <Form.Group>
                      <Form.Label>Video Title *</Form.Label>
                      <Form.Control
                        {...register('title')}
                        isInvalid={!!errors.title}
                        placeholder="Enter video title"
                      />
                      <Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Video Type *</Form.Label>
                      <Form.Select {...register('videoType')}>
                        <option value="single">Movie / Single Video</option>
                        <option value="series">Series</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Description</Form.Label>
                      <Form.Control as="textarea" rows={4} {...register('description')} placeholder="Video description" />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Channel *</Form.Label>
                      <Form.Select {...register('channelId')} isInvalid={!!errors.channelId}>
                        <option value="">Select Channel</option>
                        {channels.map((ch: any) => (
                          <option key={ch._id} value={ch._id}>{ch.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Category</Form.Label>
                      <Form.Select {...register('category')}>
                        <option value="">Select Category</option>
                        {categories.map((cat: any) => (
                          <option key={cat._id} value={cat.name}>{cat.name}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Duration (seconds)</Form.Label>
                      <Form.Control type="number" {...register('duration')} min="0" />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Release Date</Form.Label>
                      <Form.Control type="date" {...register('releaseDate')} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Age Rating</Form.Label>
                      <Form.Select {...register('ageRating')}>
                        <option value="U">U - Universal</option>
                        <option value="UA">UA - Parental Guidance</option>
                        <option value="A">A - Adults Only</option>
                        <option value="S">S - Restricted</option>
                        <option value="PG">PG</option>
                        <option value="PG-13">PG-13</option>
                        <option value="R">R</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Status</Form.Label>
                      <Form.Select {...register('status')}>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
              </Tab>

              {/* Media Tab */}
              <Tab eventKey="media" title="Media">
                <Row className="g-3">
                  {/* Main Video Upload */}
                  <Col md={12}>
                    <Card className="border-2 border-dashed">
                      <CardBody>
                        <h6 className="mb-3">📽️ Main Video (Cloudflare Stream)</h6>
                        {videoUrl && (
                          <div className="mb-3 p-2 bg-light rounded">
                            <small className="text-success">✅ Current video: {videoUrl.substring(0, 60)}...</small>
                          </div>
                        )}
                        <CloudflareVideoUploader
                          onUploadComplete={(uid: string, url: string) => {
                            setVideoUrl(url)
                            setCloudflareVideoUid(uid)
                          }}
                          uploadType="main"
                          existingUid={cloudflareVideoUid}
                        />
                      </CardBody>
                    </Card>
                  </Col>

                  {/* Trailer Upload */}
                  <Col md={12}>
                    <Card className="border-2 border-dashed">
                      <CardBody>
                        <h6 className="mb-3">🎬 Trailer (Cloudflare Stream)</h6>
                        {trailerUrl && (
                          <div className="mb-3 p-2 bg-light rounded">
                            <small className="text-success">✅ Current trailer: {trailerUrl.substring(0, 60)}...</small>
                          </div>
                        )}
                        <CloudflareVideoUploader
                          onUploadComplete={(uid: string, url: string) => {
                            setTrailerUrl(url)
                            setCloudflareTrailerUid(uid)
                          }}
                          uploadType="trailer"
                          existingUid={cloudflareTrailerUid}
                        />
                      </CardBody>
                    </Card>
                  </Col>

                  {/* Images */}
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Thumbnail Image</Form.Label>
                      {video.thumbnailUrl && (
                        <div className="mb-2">
                          <img src={video.thumbnailUrl} alt="Current thumbnail" className="img-thumbnail" style={{ maxHeight: 80 }} />
                        </div>
                      )}
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e: any) => setThumbnailFile(e.target.files?.[0] || null)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Poster Image</Form.Label>
                      {video.posterUrl && (
                        <div className="mb-2">
                          <img src={video.posterUrl} alt="Current poster" className="img-thumbnail" style={{ maxHeight: 80 }} />
                        </div>
                      )}
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e: any) => setPosterFile(e.target.files?.[0] || null)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Tab>

              {/* Pricing Tab */}
              <Tab eventKey="pricing" title="Pricing">
                <Row className="g-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Check type="switch" label="Free Video" {...register('isFree')} />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Check type="switch" label="Featured Video" {...register('isFeatured')} />
                    </Form.Group>
                  </Col>
                  <Col md={4}></Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Default Price (INR)</Form.Label>
                      <Form.Control type="number" {...register('defaultPrice')} min="0" step="0.01" />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Rental Days</Form.Label>
                      <Form.Control type="number" {...register('rentalDays')} min="0" />
                    </Form.Group>
                  </Col>
                </Row>
              </Tab>
            </Tabs>

            {/* Submit Button */}
            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <Button variant="secondary" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={isUpdating}>
                {isUpdating ? (
                  <><Spinner size="sm" className="me-2" /> Updating...</>
                ) : (
                  <><FaSave className="me-2" /> Save Changes</>
                )}
              </Button>
            </div>
          </CardBody>
        </Card>
      </Form>
    </>
  )
}

export default VideoEdit
