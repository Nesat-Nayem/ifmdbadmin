'use client'

import { useCreateEventsMutation } from '@/store/eventsApi'
import { useGetEventCategoriesQuery, IEventCategory } from '@/store/eventCategoryApi'
import { useUploadSingleMutation } from '@/store/uploadApi'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Container, Row, Spinner, Toast, ToastContainer, ProgressBar } from 'react-bootstrap'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import Image from 'next/image'
import CloudflareVideoUploader from '@/components/CloudflareVideoUploader'

// Seat Type Interface
interface ISeatType {
  name: string
  price: number
  totalSeats: number
  availableSeats: number
}

const schema = yup.object().shape({
  title: yup.string().required('Please enter title'),
  description: yup.string().required('Please enter description'),
  eventType: yup.string().required('Please select event type'),
  category: yup.string().required('Please select category'),
  categoryId: yup.string().optional(),
  eventLanguage: yup.string().required('Please select language'),
  startDate: yup.string().required('Start date required'),
  endDate: yup.string().required('End date required'),
  startTime: yup.string().required('Start time required'),
  endTime: yup.string().required('End time required'),
  status: yup.string().required('Status required'),
  venueName: yup.string().required('Venue name required'),
  address: yup.string().required('Address required'),
  city: yup.string().required('City required'),
  state: yup.string().required('State required'),
  postalCode: yup.string().required('Postal code required'),
  latitude: yup.number().nullable(),
  longitude: yup.number().nullable(),
  ticketPrice: yup.number().typeError('Enter valid price').required('Ticket price required'),
  totalSeats: yup.number().typeError('Enter valid number').required('Total seats required'),
  availableSeats: yup.number().typeError('Enter valid number').required('Available seats required'),
  maxTicketsPerPerson: yup.number().typeError('Enter valid number').default(10),
  tagsInput: yup.string().required('Tags required'),
  homeSection: yup.string().oneOf(['', 'trending_events', 'celebrity_events', 'exclusive_invite_only', 'near_you']).optional(),
  isScheduled: yup.boolean().default(false),
  visibleFrom: yup.string().when('isScheduled', {
    is: true,
    then: (schema) => schema.required('Visible from date is required'),
    otherwise: (schema) => schema.optional().nullable(),
  }),
  visibleUntil: yup.string().when('isScheduled', {
    is: true,
    then: (schema) => schema.required('Visible until date is required'),
    otherwise: (schema) => schema.optional().nullable(),
  }),
  autoDeleteOnExpiry: yup.boolean().default(false),
  isGovernmentEvent: yup.boolean().default(false),
})

type FormValues = yup.InferType<typeof schema> & {
  posterImage?: string
  galleryImages?: string[]
  performers?: string[]
  organizers?: string[]
  tags?: string[]
  seatTypes?: ISeatType[]
  homeSection?: string
}

const EventsAdd = () => {
  const [poster, setPoster] = useState<File | null>(null)
  const [galleryImages, setGalleryImages] = useState<File[]>([])
  const [videoUrl, setVideoUrl] = useState('')
  const [cloudflareVideoUid, setCloudflareVideoUid] = useState('')
  const router = useRouter()

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  // Upload loading states
  const [isUploadingPoster, setIsUploadingPoster] = useState(false)
  const [isUploadingGallery, setIsUploadingGallery] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState('')

  // Seat Types state
  const [seatTypes, setSeatTypes] = useState<ISeatType[]>([
    { name: 'Normal', price: 0, totalSeats: 0, availableSeats: 0 }
  ])

  // Fetch event categories
  const { data: eventCategories = [], isLoading: categoriesLoading } = useGetEventCategoriesQuery()
  const [uploadSingle] = useUploadSingleMutation()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      eventLanguage: 'English',
      maxTicketsPerPerson: 10,
      homeSection: '',
      isGovernmentEvent: false,
    }
  })

  // Watch category to auto-set categoryId
  const selectedCategory = watch('category')

  // Add seat type
  const addSeatType = () => {
    setSeatTypes([...seatTypes, { name: '', price: 0, totalSeats: 0, availableSeats: 0 }])
  }

  // Remove seat type
  const removeSeatType = (index: number) => {
    if (seatTypes.length > 1) {
      setSeatTypes(seatTypes.filter((_, i) => i !== index))
    }
  }

  // Handle seat type change
  const handleSeatTypeChange = (index: number, field: keyof ISeatType, value: string | number) => {
    setSeatTypes(prev => {
      const updated = [...prev]
      if (field === 'name') {
        updated[index] = { ...updated[index], [field]: value as string }
      } else {
        updated[index] = { ...updated[index], [field]: Number(value) }
        // Auto-set availableSeats to totalSeats for new entries
        if (field === 'totalSeats') {
          updated[index].availableSeats = Number(value)
        }
      }
      return updated
    })
  }

  // Performers
  const [performers, setPerformers] = useState([{ name: '', type: '', bio: '', image: null }])

  const addPerformer = () => {
    setPerformers([...performers, { name: '', type: '', bio: '', image: null }])
  }

  const handleChange = (index: number, field: keyof (typeof performers)[number], value: any) => {
    setPerformers((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  // organizers
  const [organizers, setOrganizers] = useState([{ name: '', email: '', phone: '', logo: null }])

  // add organizer
  const addOrganizers = () => {
    setOrganizers((prev) => [...prev, { name: '', email: '', phone: '', logo: null }])
  }

  // handle organizer change
  const handleChangeOrganizers = (index: number, field: keyof (typeof organizers)[number], value: any) => {
    setOrganizers((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const [createEvents, { isLoading }] = useCreateEventsMutation()

  // ✅ Toast trigger
  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const onSubmit = async (values: FormValues) => {
    try {
      setUploadProgress(0)
      
      // Upload poster image first
      let posterImageUrl = ''
      if (poster) {
        setIsUploadingPoster(true)
        setUploadStatus('Uploading poster image...')
        setUploadProgress(10)
        try {
          posterImageUrl = await uploadSingle(poster).unwrap()
        } catch (uploadErr) {
          console.warn('Poster upload failed, using blob URL')
          posterImageUrl = URL.createObjectURL(poster)
        }
        setIsUploadingPoster(false)
        setUploadProgress(30)
      }

      // Upload gallery images
      const galleryImageUrls: string[] = []
      if (galleryImages.length > 0) {
        setIsUploadingGallery(true)
        const progressPerImage = 40 / galleryImages.length
        
        for (let i = 0; i < galleryImages.length; i++) {
          setUploadStatus(`Uploading gallery image ${i + 1} of ${galleryImages.length}...`)
          try {
            const url = await uploadSingle(galleryImages[i]).unwrap()
            galleryImageUrls.push(url)
          } catch (uploadErr) {
            galleryImageUrls.push(URL.createObjectURL(galleryImages[i]))
          }
          setUploadProgress(30 + (i + 1) * progressPerImage)
        }
        setIsUploadingGallery(false)
      }

      setUploadProgress(70)
      setUploadStatus('Creating event...')

      // Find categoryId from selected category name
      const selectedCat = eventCategories.find((cat: IEventCategory) => cat.name === values.category)

      // Filter out empty seat types
      const validSeatTypes = seatTypes.filter(st => st.name.trim() !== '' && st.totalSeats > 0)

      const payload = {
        ...values,
        categoryId: selectedCat?._id || undefined,
        location: {
          venueName: values.venueName,
          address: values.address,
          city: values.city,
          state: values.state,
          postalCode: values.postalCode,
          latitude: values.latitude || 0,
          longitude: values.longitude || 0,
        },
        posterImage: posterImageUrl,
        videoUrl: videoUrl,
        cloudflareVideoUid: cloudflareVideoUid,
        galleryImages: galleryImageUrls,
        seatTypes: validSeatTypes,
        performers: performers.filter(p => p.name.trim() !== '').map((p) => ({
          name: p.name,
          type: p.type,
          bio: p.bio,
          image: p.image ? URL.createObjectURL(p.image) : '',
        })),
        organizers: organizers.filter(o => o.name.trim() !== '').map((o) => ({
          name: o.name,
          email: o.email,
          phone: o.phone,
          logo: o.logo ? URL.createObjectURL(o.logo) : '',
        })),
        tags: values.tagsInput
          .split(',')
          .map((t: string) => t.trim())
          .filter((t: string) => t.length > 0),
        isActive: true,
        homeSection: values.homeSection || '',
        isGovernmentEvent: values.isGovernmentEvent || false, // Government events have fixed 10% platform fee
        // Visibility Schedule
        isScheduled: values.isScheduled,
        visibleFrom: values.isScheduled && values.visibleFrom ? new Date(values.visibleFrom).toISOString() : null,
        visibleUntil: values.isScheduled && values.visibleUntil ? new Date(values.visibleUntil).toISOString() : null,
        autoDeleteOnExpiry: values.isScheduled ? values.autoDeleteOnExpiry : false,
      }

      setUploadProgress(90)
      await createEvents(payload).unwrap()

      setUploadProgress(100)
      setUploadStatus('')
      showMessage('Event added successfully!', 'success')
      reset()
      setPoster(null)
      setGalleryImages([])
      setVideoUrl('')
      setCloudflareVideoUid('')
      setSeatTypes([{ name: 'Normal', price: 0, totalSeats: 0, availableSeats: 0 }])
      
      setTimeout(() => {
        router.push('/events/events-list')
      }, 2000)
    } catch (err) {
      console.error('Error:', err)
      setUploadStatus('')
      setUploadProgress(0)
      showMessage('Failed to add Event', 'error')
    }
  }

  // Check if any upload is in progress
  const isUploading = isUploadingPoster || isUploadingGallery || isLoading

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Container>
          {/* Basic Details */}
          <Card>
            <CardHeader>
              <CardTitle as="h4">Basic Details</CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                <Col lg={6}>
                  <label className="form-label">Event Name</label>
                  <input type="text" {...register('title')} className="form-control" />
                  {errors.title && <small className="text-danger">{errors.title.message}</small>}
                </Col>

                {/* Poster Upload */}
                <Col lg={6}>
                  <label className="form-label">Upload Poster *</label>
                  <input type="file" className="form-control" accept="image/*" onChange={(e) => setPoster(e.target.files?.[0] || null)} required />
                </Col>

                {/* Event Video Upload */}
                <Col lg={12} className="mt-3">
                  <Card className="border-2 border-dashed">
                    <CardBody>
                      <h6 className="mb-3">🎬 Event Video Upload (Cloudflare Stream)</h6>
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
                        uploadType="trailer"
                        existingUid={cloudflareVideoUid}
                      />
                    </CardBody>
                  </Card>
                </Col>

                <Col lg={12} className="mt-3">
                  <label className="form-label">Description</label>
                  <textarea {...register('description')} className="form-control" rows={3} />
                  {errors.description && <small className="text-danger">{errors.description.message}</small>}
                </Col>

                {/* Event Type */}
                <Col lg={6} className="mt-3">
                  <label className="form-label">Event Type *</label>
                  <select {...register('eventType')} className="form-select">
                    <option value="">-- Select --</option>
                    <option value="comedy">Comedy</option>
                    <option value="music">Music</option>
                    <option value="concert">Concert</option>
                    <option value="theater">Theater</option>
                    <option value="sports">Sports</option>
                    <option value="conference">Conference</option>
                    <option value="workshop">Workshop</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.eventType && <small className="text-danger">{errors.eventType.message}</small>}
                </Col>

                <Col lg={6} className="mt-3">
                  <label className="form-label">Category *</label>
                  <select {...register('category')} className="form-select">
                    <option value="">-- Select Category --</option>
                    {categoriesLoading ? (
                      <option disabled>Loading categories...</option>
                    ) : (
                      eventCategories.map((cat: IEventCategory) => (
                        <option key={cat._id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))
                    )}
                  </select>
                  {errors.category && <small className="text-danger">{errors.category.message}</small>}
                </Col>

                <Col lg={6} className="mt-3">
                  <label className="form-label">Language *</label>
                  <select {...register('eventLanguage')} className="form-select">
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Malayalam">Malayalam</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Kannada">Kannada</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Gujarati">Gujarati</option>
                    <option value="Punjabi">Punjabi</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.eventLanguage && <small className="text-danger">{errors.eventLanguage.message}</small>}
                </Col>

                {/* Dates and Times */}
                <Col lg={3} className="mt-3">
                  <label className="form-label">Start Date</label>
                  <input type="date" {...register('startDate')} className="form-control" />
                  {errors.startDate && <small className="text-danger">{errors.startDate.message}</small>}
                </Col>
                <Col lg={3} className="mt-3">
                  <label className="form-label">End Date</label>
                  <input type="date" {...register('endDate')} className="form-control" />
                  {errors.endDate && <small className="text-danger">{errors.endDate.message}</small>}
                </Col>
                <Col lg={3} className="mt-3">
                  <label className="form-label">Start Time</label>
                  <input type="time" {...register('startTime')} className="form-control" />
                  {errors.startTime && <small className="text-danger">{errors.startTime.message}</small>}
                </Col>
                <Col lg={3} className="mt-3">
                  <label className="form-label">End Time</label>
                  <input type="time" {...register('endTime')} className="form-control" />
                  {errors.endTime && <small className="text-danger">{errors.endTime.message}</small>}
                </Col>

                {/* Status */}
                <Col lg={6} className="mt-3">
                  <label className="form-label">Status *</label>
                  <select {...register('status')} className="form-select">
                    <option value="">-- Select --</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  {errors.status && <small className="text-danger">{errors.status.message}</small>}
                </Col>

                {/* Government Event Option */}
                <Col lg={6} className="mt-3">
                  <div className="form-check form-switch p-3 border rounded bg-light">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="isGovernmentEvent"
                      {...register('isGovernmentEvent')}
                    />
                    <label className="form-check-label fw-bold" htmlFor="isGovernmentEvent">
                      🏛️ Government Event
                    </label>
                    <small className="d-block text-muted mt-1">
                      Government events have a fixed 10% platform fee instead of the standard rate.
                    </small>
                    {watch('isGovernmentEvent') && (
                      <span className="badge bg-success mt-2">✓ Fixed 10% Platform Fee Applied</span>
                    )}
                  </div>
                </Col>

                {/* Home Section */}
                <Col lg={6} className="mt-3">
                  <label className="form-label">Home Page Section</label>
                  <select {...register('homeSection')} className="form-select">
                    <option value="">-- Not Featured on Home --</option>
                    <option value="trending_events">Trending Events</option>
                    <option value="celebrity_events">Celebrity Events</option>
                    <option value="exclusive_invite_only">Exclusive / Invite Only</option>
                    <option value="near_you">Near You</option>
                  </select>
                  <small className="text-muted">Select a section to feature this event on the home page</small>
                </Col>

                {/* Visibility Schedule Section */}
                <Col lg={12} className="mt-4">
                  <Card className="border-warning">
                    <CardHeader className="bg-warning bg-opacity-10 d-flex align-items-center justify-content-between">
                      <div>
                        <h6 className="mb-0">📅 Visibility Schedule (Time-Limited Event)</h6>
                        <small className="text-muted">Set when this event should be visible and when it expires</small>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="isScheduled"
                          {...register('isScheduled')}
                        />
                        <label className="form-check-label" htmlFor="isScheduled">Enable Schedule</label>
                      </div>
                    </CardHeader>
                    {watch('isScheduled') && (
                      <CardBody>
                        <Row className="g-3">
                          <Col md={4}>
                            <label className="form-label">📆 Visible From</label>
                            <input
                              type="datetime-local"
                              className={`form-control ${errors.visibleFrom ? 'is-invalid' : ''}`}
                              {...register('visibleFrom')}
                            />
                            {errors.visibleFrom && <div className="invalid-feedback">{errors.visibleFrom.message}</div>}
                            <small className="text-muted d-block mt-1">Event becomes visible from this date/time</small>
                          </Col>
                          <Col md={4}>
                            <label className="form-label">📆 Visible Until (Expiry)</label>
                            <input
                              type="datetime-local"
                              className={`form-control ${errors.visibleUntil ? 'is-invalid' : ''}`}
                              {...register('visibleUntil')}
                              min={watch('visibleFrom') || undefined}
                            />
                            {errors.visibleUntil && <div className="invalid-feedback">{errors.visibleUntil.message}</div>}
                            <small className="text-muted d-block mt-1">Event expires and becomes hidden after this date/time</small>
                          </Col>
                          <Col md={4}>
                            <div className="form-check mt-4 pt-2">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id="autoDeleteOnExpiry"
                                {...register('autoDeleteOnExpiry')}
                              />
                              <label className="form-check-label text-danger fw-medium" htmlFor="autoDeleteOnExpiry">
                                🗑️ Auto-delete on expiry
                              </label>
                              <small className="text-danger d-block mt-1">Warning: Event will be permanently deleted after expiry</small>
                            </div>
                          </Col>
                          {watch('visibleFrom') && watch('visibleUntil') && (
                            <Col md={12}>
                              <div className="alert alert-info mb-0">
                                <strong>Schedule Preview:</strong> This event will be visible from{' '}
                                <span className="badge bg-success">{new Date(watch('visibleFrom')!).toLocaleString()}</span> to{' '}
                                <span className="badge bg-danger">{new Date(watch('visibleUntil')!).toLocaleString()}</span>
                                {watch('autoDeleteOnExpiry') && (
                                  <span className="text-danger ms-2 fw-bold">
                                    (Will be auto-deleted after expiry)
                                  </span>
                                )}
                              </div>
                            </Col>
                          )}
                        </Row>
                      </CardBody>
                    )}
                  </Card>
                </Col>
              </Row>
            </CardBody>
          </Card>

          {/* Location */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle as="h4">Location</CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                <Col lg={6}>
                  <label className="form-label">Venue Name</label>
                  <input type="text" {...register('venueName')} className="form-control" />
                  {errors.venueName && <small className="text-danger">{errors.venueName.message}</small>}
                </Col>
                <Col lg={6}>
                  <label className="form-label">Address</label>
                  <input type="text" {...register('address')} className="form-control" />
                  {errors.address && <small className="text-danger">{errors.address.message}</small>}
                </Col>
                <Col lg={4} className="mt-3">
                  <label className="form-label">City</label>
                  <input type="text" {...register('city')} className="form-control" />
                  {errors.city && <small className="text-danger">{errors.city.message}</small>}
                </Col>
                <Col lg={4} className="mt-3">
                  <label className="form-label">State</label>
                  <input type="text" {...register('state')} className="form-control" />
                  {errors.state && <small className="text-danger">{errors.state.message}</small>}
                </Col>
                <Col lg={4} className="mt-3">
                  <label className="form-label">Postal Code</label>
                  <input type="text" {...register('postalCode')} className="form-control" />
                  {errors.postalCode && <small className="text-danger">{errors.postalCode.message}</small>}
                </Col>
              </Row>
            </CardBody>
          </Card>

          {/* Tickets */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle as="h4">Tickets</CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                <Col lg={3}>
                  <label className="form-label">Base Ticket Price *</label>
                  <input type="number" {...register('ticketPrice')} className="form-control" placeholder="0" />
                  {errors.ticketPrice && <small className="text-danger">{errors.ticketPrice.message}</small>}
                </Col>
                <Col lg={3}>
                  <label className="form-label">Total Seats *</label>
                  <input type="number" {...register('totalSeats')} className="form-control" placeholder="100" />
                  {errors.totalSeats && <small className="text-danger">{errors.totalSeats.message}</small>}
                </Col>
                <Col lg={3}>
                  <label className="form-label">Available Seats *</label>
                  <input type="number" {...register('availableSeats')} className="form-control" placeholder="100" />
                  {errors.availableSeats && <small className="text-danger">{errors.availableSeats.message}</small>}
                </Col>
                <Col lg={3}>
                  <label className="form-label">Max Tickets/Person</label>
                  <input type="number" {...register('maxTicketsPerPerson')} className="form-control" defaultValue={10} />
                  {errors.maxTicketsPerPerson && <small className="text-danger">{errors.maxTicketsPerPerson.message}</small>}
                </Col>
              </Row>
            </CardBody>
          </Card>

          {/* Seat Types */}
          <Card className="mt-4">
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle as="h4">Seat Types (VIP, VVIP, Normal, etc.)</CardTitle>
              <button type="button" className="btn btn-sm btn-outline-primary" onClick={addSeatType}>
                + Add Seat Type
              </button>
            </CardHeader>
            <CardBody>
              <p className="text-muted mb-3">
                <small>Configure different seat types with their prices. Leave empty if you only have one ticket price.</small>
              </p>
              {seatTypes.map((seatType, index) => (
                <Row key={`seatType-${index}`} className="align-items-end mb-3">
                  <Col lg={3}>
                    <label className="form-label">Seat Type Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={seatType.name}
                      onChange={(e) => handleSeatTypeChange(index, 'name', e.target.value)}
                      placeholder="e.g. VIP, VVIP, Normal"
                    />
                  </Col>
                  <Col lg={2}>
                    <label className="form-label">Price</label>
                    <input
                      type="number"
                      className="form-control"
                      value={seatType.price}
                      onChange={(e) => handleSeatTypeChange(index, 'price', e.target.value)}
                      placeholder="0"
                    />
                  </Col>
                  <Col lg={2}>
                    <label className="form-label">Total Seats</label>
                    <input
                      type="number"
                      className="form-control"
                      value={seatType.totalSeats}
                      onChange={(e) => handleSeatTypeChange(index, 'totalSeats', e.target.value)}
                      placeholder="0"
                    />
                  </Col>
                  <Col lg={2}>
                    <label className="form-label">Available Seats</label>
                    <input
                      type="number"
                      className="form-control"
                      value={seatType.availableSeats}
                      onChange={(e) => handleSeatTypeChange(index, 'availableSeats', e.target.value)}
                      placeholder="0"
                    />
                  </Col>
                  <Col lg={1}>
                    {seatTypes.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-outline-danger w-100"
                        onClick={() => removeSeatType(index)}
                      >
                        ✕
                      </button>
                    )}
                  </Col>
                </Row>
              ))}
            </CardBody>
          </Card>

          {/* Gallery */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle as="h4">Upload Gallery</CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                <Col lg={12}>
                  <label className="form-label">Upload Gallery Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="form-control"
                    onChange={(e) => {
                      if (e.target.files) {
                        const files = Array.from(e.target.files)
                        setGalleryImages((prev: File[]) => [...prev, ...files])
                      }
                    }}
                  />
                </Col>
              </Row>

              {/* Preview */}
              <Row className="mt-3">
                {galleryImages.map((file: File, index: number) => (
                  <Col lg={3} md={4} sm={6} xs={12} key={index} className="mb-3">
                    <div className="position-relative border rounded p-2">
                      <Image
                        width={500}
                        height={500}
                        src={URL.createObjectURL(file)}
                        alt={`gallery-${index}`}
                        className="img-fluid rounded"
                        style={{ height: '150px', objectFit: 'cover', width: '100%' }}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                        onClick={() => setGalleryImages((prev: File[]) => prev.filter((_, i) => i !== index))}>
                        ✕
                      </button>
                    </div>
                  </Col>
                ))}
              </Row>
            </CardBody>
          </Card>

          {/* Tags */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle as="h4">Tags</CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                <Col lg={6}>
                  <label className="form-label">Tags (comma separated)</label>
                  <input type="text" className="form-control" {...register('tagsInput')} placeholder="e.g. music, festival, comedy" />
                  {errors.tagsInput && <small className="text-danger">{errors.tagsInput.message}</small>}
                </Col>
              </Row>
            </CardBody>
          </Card>

          {/* Performers */}
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle as="h4">Performers Details</CardTitle>
              <button type="button" className="btn btn-sm btn-outline-primary" onClick={addPerformer}>
                +
              </button>
            </CardHeader>

            <CardBody>
              {performers.map((performer, index) => (
                <Row key={`performer-${index}`} className="align-items-end mb-3">
                  {/* Performer Name */}
                  <Col lg={3}>
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={performer.name}
                      onChange={(e) => handleChange(index, 'name', e.target.value)}
                      placeholder="Enter performer's name"
                    />
                  </Col>

                  {/* Performer Type */}
                  <Col lg={2}>
                    <label className="form-label">Type</label>
                    <select className="form-select" value={performer.type} onChange={(e) => handleChange(index, 'type', e.target.value)}>
                      <option value="">Select</option>
                      <option value="artist">Artist</option>
                      <option value="comedian">Comedian</option>
                      <option value="band">Band</option>
                      <option value="speaker">Speaker</option>
                      <option value="other">Other</option>
                    </select>
                  </Col>

                  {/* Performer Bio */}
                  <Col lg={4}>
                    <label className="form-label">Bio</label>
                    <textarea
                      className="form-control"
                      rows={1}
                      value={performer.bio}
                      onChange={(e) => handleChange(index, 'bio', e.target.value)}
                      placeholder="Enter short bio"
                    />
                  </Col>

                  {/* Performer Image */}
                  <Col lg={2}>
                    <label className="form-label">Image</label>
                    <input type="file" className="form-control" onChange={(e) => handleChange(index, 'image', e.target.files?.[0] || null)} />
                  </Col>

                  {/* Remove Button */}
                  <Col lg={1}>
                    {performers.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-outline-danger w-100"
                        onClick={() => {
                          const updated = [...performers]
                          updated.splice(index, 1)
                          setPerformers(updated)
                        }}>
                        ✕
                      </button>
                    )}
                  </Col>
                </Row>
              ))}
            </CardBody>
          </Card>

          {/* Organizers */}
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle as="h4">Organizers Details</CardTitle>
              <button type="button" className="btn btn-sm btn-outline-primary" onClick={addOrganizers}>
                +
              </button>
            </CardHeader>

            <CardBody>
              {organizers.map((organizer, index) => (
                <Row key={`organizer-${index}`} className="align-items-end mb-3">
                  {/* Organizer Name */}
                  <Col lg={3}>
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={organizer.name}
                      onChange={(e) => handleChangeOrganizers(index, 'name', e.target.value)}
                      placeholder="Enter organizer's name"
                    />
                  </Col>

                  {/* Organizer Email */}
                  <Col lg={3}>
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={organizer.email}
                      onChange={(e) => handleChangeOrganizers(index, 'email', e.target.value)}
                      placeholder="Enter email"
                    />
                  </Col>

                  {/* Organizer Phone */}
                  <Col lg={3}>
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={organizer.phone}
                      onChange={(e) => handleChangeOrganizers(index, 'phone', e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </Col>

                  {/* Organizer Logo */}
                  <Col lg={2}>
                    <label className="form-label">Logo</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) => handleChangeOrganizers(index, 'logo', e.target.files?.[0] || null)}
                    />
                  </Col>

                  {/* Remove Button */}
                  <Col lg={1}>
                    {organizers.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-outline-danger w-100"
                        onClick={() => {
                          const updated = [...organizers]
                          updated.splice(index, 1)
                          setOrganizers(updated)
                        }}>
                        ✕
                      </button>
                    )}
                  </Col>
                </Row>
              ))}
            </CardBody>
          </Card>
        </Container>

        {/* Submit Actions */}
        <div className="p-3 bg-light mb-3 rounded mt-4">
          {/* Upload Progress */}
          {isUploading && (
            <Row className="mb-3">
              <Col lg={12}>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Spinner animation="border" size="sm" variant="primary" />
                  <span className="text-muted">{uploadStatus || 'Processing...'}</span>
                </div>
                <ProgressBar 
                  now={uploadProgress} 
                  label={`${Math.round(uploadProgress)}%`}
                  variant={uploadProgress === 100 ? 'success' : 'primary'}
                  animated={uploadProgress < 100}
                />
              </Col>
            </Row>
          )}
          
          <Row className="justify-content-end g-2">
            <Col lg={2}>
              <Button 
                type="button" 
                variant="secondary" 
                className="w-100"
                onClick={() => router.push('/events/events-list')}
                disabled={isUploading}
              >
                Cancel
              </Button>
            </Col>
            <Col lg={2}>
              <Button type="submit" variant="success" className="w-100" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    {uploadStatus || 'Saving...'}
                  </>
                ) : (
                  'Create Event'
                )}
              </Button>
            </Col>
          </Row>
        </div>
      </form>

      {/* ✅ Toast Notification */}
      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant === 'success' ? 'success' : 'danger'}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default EventsAdd
