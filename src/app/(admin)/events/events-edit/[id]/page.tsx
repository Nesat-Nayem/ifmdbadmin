'use client'

import { useGetEventsByIdQuery, useUpdateEventsMutation, IEvents, ISeatType } from '@/store/eventsApi'
import { useGetEventCategoriesQuery, IEventCategory } from '@/store/eventCategoryApi'
import { useUploadSingleMutation } from '@/store/uploadApi'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState, useRef } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Container, Row, Spinner, Toast, ToastContainer, ProgressBar } from 'react-bootstrap'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import Image from 'next/image'
import CloudflareVideoUploader from '@/components/CloudflareVideoUploader'

// Seat Type Interface
interface ILocalSeatType {
  name: string
  price: number
  totalSeats: number
  availableSeats: number
}

// Validation Schema
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
  latitude: yup.number().nullable().transform((value, originalValue) => originalValue === '' ? null : value),
  longitude: yup.number().nullable().transform((value, originalValue) => originalValue === '' ? null : value),
  ticketPrice: yup.number().typeError('Enter valid price').required('Ticket price required'),
  totalSeats: yup.number().typeError('Enter valid number').required('Total seats required'),
  availableSeats: yup.number().typeError('Enter valid number').required('Available seats required'),
  maxTicketsPerPerson: yup.number().typeError('Enter valid number').default(10),
  tagsInput: yup.string().optional(),
  homeSection: yup.string().oneOf(['', 'trending_events', 'celebrity_events', 'exclusive_invite_only', 'near_you']).optional(),
})

type FormValues = yup.InferType<typeof schema> & {
  posterImage?: string
  galleryImages?: string[]
  performers?: string[]
  organizers?: string[]
  tags?: string[]
  seatTypes?: ILocalSeatType[]
  homeSection?: string
}

const EventsEdit = () => {
  const router = useRouter()
  const params = useParams()
  const eventId = typeof params?.id === 'string' ? params.id : undefined
  const formRef = useRef<HTMLFormElement>(null)

  const [poster, setPoster] = useState<File | null>(null)
  const [galleryImages, setGalleryImages] = useState<File[]>([])
  const [existingPosterUrl, setExistingPosterUrl] = useState<string>('')
  const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>([])

  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success')
  const [showToast, setShowToast] = useState(false)
  const [posterPreview, setPosterPreview] = useState<string | null>(null)
  
  // Video state
  const [videoUrl, setVideoUrl] = useState('')
  const [cloudflareVideoUid, setCloudflareVideoUid] = useState('')

  // Upload loading states
  const [isUploadingPoster, setIsUploadingPoster] = useState(false)
  const [isUploadingGallery, setIsUploadingGallery] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState('')

  // Seat Types state
  const [seatTypes, setSeatTypes] = useState<ILocalSeatType[]>([
    { name: 'Normal', price: 0, totalSeats: 0, availableSeats: 0 }
  ])

  // Fetch event categories
  const { data: eventCategories = [], isLoading: categoriesLoading } = useGetEventCategoriesQuery()
  const [uploadSingle] = useUploadSingleMutation()

  const handlePosterChange = (file: File | null) => {
    setPoster(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPosterPreview(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      // Keep existing poster preview if no new file
      setPosterPreview(existingPosterUrl || null)
    }
  }

  const { data: event, isLoading: isFetching, isError } = useGetEventsByIdQuery(eventId!, { skip: !eventId })

  const [updateEvent, { isLoading }] = useUpdateEventsMutation()

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
    } as FormValues,
  })

  // Show validation errors as toast
  useEffect(() => {
    const errorMessages = Object.values(errors).map(error => error?.message).filter(Boolean)
    if (errorMessages.length > 0) {
      showMessage(errorMessages[0] as string, 'danger')
    }
  }, [errors])

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
  const handleSeatTypeChange = (index: number, field: keyof ILocalSeatType, value: string | number) => {
    setSeatTypes(prev => {
      const updated = [...prev]
      if (field === 'name') {
        updated[index] = { ...updated[index], [field]: value as string }
      } else {
        updated[index] = { ...updated[index], [field]: Number(value) }
      }
      return updated
    })
  }

  // Pre-fill form when data is fetched
  useEffect(() => {
    if (event) {
      // Format dates for input fields
      const formatDate = (dateStr: string) => {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        return date.toISOString().split('T')[0]
      }

      reset({
        title: event.title || '',
        description: event.description || '',
        eventType: event.eventType || '',
        category: event.category || '',
        categoryId: event.categoryId || '',
        eventLanguage: event.eventLanguage || 'English',
        startDate: formatDate(event.startDate),
        endDate: formatDate(event.endDate),
        startTime: event.startTime || '',
        endTime: event.endTime || '',
        status: event.status || 'upcoming',
        ticketPrice: event.ticketPrice || 0,
        totalSeats: event.totalSeats || 0,
        availableSeats: event.availableSeats || 0,
        maxTicketsPerPerson: event.maxTicketsPerPerson || 10,
        venueName: event.location?.venueName || '',
        address: event.location?.address || '',
        city: event.location?.city || '',
        state: event.location?.state || '',
        postalCode: event.location?.postalCode || '',
        latitude: event.location?.latitude ?? null,
        longitude: event.location?.longitude ?? null,
        tagsInput: event.tags?.join(', ') || '',
        homeSection: (event as any).homeSection || '',
      })

      // Set existing poster preview
      if (event.posterImage) {
        setExistingPosterUrl(event.posterImage)
        setPosterPreview(event.posterImage)
      }

      // Set existing video URL
      if ((event as any).videoUrl) {
        setVideoUrl((event as any).videoUrl)
      }
      if ((event as any).cloudflareVideoUid) {
        setCloudflareVideoUid((event as any).cloudflareVideoUid)
      }

      // Set existing gallery images
      if (event.galleryImages && event.galleryImages.length > 0) {
        setExistingGalleryUrls(event.galleryImages)
      }

      // Set seat types
      if (event.seatTypes && event.seatTypes.length > 0) {
        setSeatTypes(event.seatTypes.map((st: any) => ({
          name: st.name || '',
          price: st.price || 0,
          totalSeats: st.totalSeats || 0,
          availableSeats: st.availableSeats || 0,
        })))
      }

      setPerformers(
        event.performers?.length
          ? event.performers.map((p: any) => ({
              name: p.name || '',
              type: p.type || '',
              bio: p.bio || '',
              image: null,
              imagePreview: p.image || '',
              existingImage: p.image || '',
            }))
          : [{ name: '', type: '', bio: '', image: null, imagePreview: '', existingImage: '' }],
      )

      setOrganizers(
        event.organizers?.length
          ? event.organizers.map((o: any) => ({
              name: o.name || '',
              email: o.email || '',
              phone: o.phone || '',
              logo: null,
              logoPreview: o.logo || '',
              existingLogo: o.logo || '',
            }))
          : [{ name: '', email: '', phone: '', logo: null, logoPreview: '', existingLogo: '' }],
      )

      setPoster(null)
      setGalleryImages([])
    }
  }, [event, reset])

  const showMessage = (msg: string, type: 'success' | 'danger' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  // Performers
  const [performers, setPerformers] = useState<any[]>([{ name: '', type: '', bio: '', image: null, imagePreview: '', existingImage: '' }])
  const addPerformer = () => setPerformers([...performers, { name: '', type: '', bio: '', image: null, imagePreview: '', existingImage: '' }])
  
  const handlePerformerChange = (index: number, field: string, value: any) => {
    const updated = [...performers]
    if (field === 'image' && value) {
      // Create preview for new image
      const reader = new FileReader()
      reader.onloadend = () => {
        updated[index] = { ...updated[index], image: value, imagePreview: reader.result as string }
        setPerformers([...updated])
      }
      reader.readAsDataURL(value)
    } else {
      updated[index] = { ...updated[index], [field]: value }
      setPerformers(updated)
    }
  }

  // Organizers
  const [organizers, setOrganizers] = useState<any[]>([{ name: '', email: '', phone: '', logo: null, logoPreview: '', existingLogo: '' }])
  const addOrganizers = () => setOrganizers([...organizers, { name: '', email: '', phone: '', logo: null, logoPreview: '', existingLogo: '' }])
  
  const handleOrganizerChange = (index: number, field: string, value: any) => {
    const updated = [...organizers]
    if (field === 'logo' && value) {
      // Create preview for new logo
      const reader = new FileReader()
      reader.onloadend = () => {
        updated[index] = { ...updated[index], logo: value, logoPreview: reader.result as string }
        setOrganizers([...updated])
      }
      reader.readAsDataURL(value)
    } else {
      updated[index] = { ...updated[index], [field]: value }
      setOrganizers(updated)
    }
  }

  // Remove existing gallery image
  const removeExistingGalleryImage = (index: number) => {
    setExistingGalleryUrls(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (values: FormValues) => {
    if (!eventId) return

    try {
      setUploadProgress(0)
      
      // Upload poster image if changed
      let posterImageUrl = existingPosterUrl
      if (poster) {
        setIsUploadingPoster(true)
        setUploadStatus('Uploading poster image...')
        setUploadProgress(10)
        try {
          posterImageUrl = await uploadSingle(poster).unwrap()
        } catch (uploadErr) {
          console.warn('Poster upload failed, using existing URL')
        }
        setIsUploadingPoster(false)
        setUploadProgress(30)
      }

      // Upload new gallery images
      const galleryImageUrls: string[] = [...existingGalleryUrls]
      if (galleryImages.length > 0) {
        setIsUploadingGallery(true)
        const progressPerImage = 30 / galleryImages.length
        
        for (let i = 0; i < galleryImages.length; i++) {
          setUploadStatus(`Uploading gallery image ${i + 1} of ${galleryImages.length}...`)
          try {
            const url = await uploadSingle(galleryImages[i]).unwrap()
            galleryImageUrls.push(url)
          } catch (uploadErr) {
            console.warn('Gallery upload failed for image', i)
          }
          setUploadProgress(30 + (i + 1) * progressPerImage)
        }
        setIsUploadingGallery(false)
      }

      setUploadProgress(60)
      setUploadStatus('Uploading performer images...')

      // Upload performer images if new files are selected
      const uploadedPerformers = await Promise.all(
        performers.filter(p => p.name.trim() !== '').map(async (p) => {
          let imageUrl = p.existingImage || ''
          if (p.image) {
            try {
              imageUrl = await uploadSingle(p.image).unwrap()
            } catch (uploadErr) {
              console.warn('Performer image upload failed, using existing')
            }
          }
          return {
            name: p.name,
            type: p.type,
            bio: p.bio,
            image: imageUrl,
          }
        })
      )

      setUploadProgress(70)
      setUploadStatus('Uploading organizer logos...')

      // Upload organizer logos if new files are selected
      const uploadedOrganizers = await Promise.all(
        organizers.filter(o => o.name.trim() !== '').map(async (o) => {
          let logoUrl = o.existingLogo || ''
          if (o.logo) {
            try {
              logoUrl = await uploadSingle(o.logo).unwrap()
            } catch (uploadErr) {
              console.warn('Organizer logo upload failed, using existing')
            }
          }
          return {
            name: o.name,
            email: o.email,
            phone: o.phone,
            logo: logoUrl,
          }
        })
      )

      setUploadProgress(80)
      setUploadStatus('Updating event...')

      // Find categoryId from selected category name
      const selectedCat = eventCategories.find((cat: IEventCategory) => cat.name === values.category)

      // Filter out empty seat types
      const validSeatTypes = seatTypes.filter(st => st.name.trim() !== '' && st.totalSeats > 0)

      const payload: any = {
        title: values.title,
        description: values.description,
        eventType: values.eventType,
        category: values.category,
        categoryId: selectedCat?._id || values.categoryId || undefined,
        eventLanguage: values.eventLanguage,
        startDate: values.startDate,
        endDate: values.endDate,
        startTime: values.startTime,
        endTime: values.endTime,
        status: values.status,
        ticketPrice: values.ticketPrice,
        totalSeats: values.totalSeats,
        availableSeats: values.availableSeats,
        maxTicketsPerPerson: values.maxTicketsPerPerson || 10,
        seatTypes: validSeatTypes,
        isActive: true,
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
        galleryImages: galleryImageUrls,
        tags: (values.tagsInput || '')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        performers: uploadedPerformers,
        organizers: uploadedOrganizers,
        homeSection: values.homeSection || '',
      }

      // Only include video fields if they have values (prevent accidental wiping)
      if (videoUrl) {
        payload.videoUrl = videoUrl
      }
      if (cloudflareVideoUid) {
        payload.cloudflareVideoUid = cloudflareVideoUid
      }

      setUploadProgress(90)
      await updateEvent({ id: eventId, data: payload as any }).unwrap()

      setUploadProgress(100)
      setUploadStatus('')
      showMessage('Event updated successfully!', 'success')
      
      setTimeout(() => {
        router.push('/events/events-list')
      }, 2000)
    } catch (err: any) {
      console.error(err)
      setUploadStatus('')
      setUploadProgress(0)
      const errorMsg = err?.data?.message || 'Failed to update event'
      showMessage(errorMsg, 'danger')
    }
  }

  // Handle form validation errors
  const onError = (formErrors: any) => {
    const firstError = Object.values(formErrors)[0] as any
    if (firstError?.message) {
      showMessage(firstError.message, 'danger')
    }
  }

  // Check if any upload is in progress
  const isUploading = isUploadingPoster || isUploadingGallery || isLoading

  // Loading state
  if (isFetching) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading event...</p>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="text-center py-5 text-danger">
        <p>Error loading event. Please try again.</p>
        <Button variant="primary" onClick={() => router.push('/events/events-list')}>
          Back to List
        </Button>
      </div>
    )
  }

  return (
    <>
      <form ref={formRef} onSubmit={handleSubmit(onSubmit, onError)}>
        <Container>
          {/* Basic Details */}
          <Card>
            <CardHeader>
              <CardTitle as="h4">Basic Details</CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                {/* Poster Upload */}
                <Col lg={6}>
                  <label className="form-label">Upload Poster</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={(e) => handlePosterChange(e.target.files?.[0] || null)}
                  />
                  {posterPreview && (
                    <div className="mt-2">
                      <img 
                        src={posterPreview} 
                        alt="poster preview" 
                        width={100} 
                        height={100} 
                        style={{ objectFit: 'cover', borderRadius: '8px' }}
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://res.cloudinary.com/drulco0au/image/upload/v1770982075/ss_ldwhjh.png' }}
                      />
                    </div>
                  )}
                </Col>

                <Col lg={6}>
                  <label className="form-label">Event Name *</label>
                  <input 
                    type="text" 
                    {...register('title')} 
                    className={`form-control ${errors.title ? 'is-invalid' : ''}`} 
                  />
                  {errors.title && <div className="invalid-feedback">{errors.title.message}</div>}
                </Col>

                {/* Event Video Upload */}
                <Col lg={12} className="mt-3">
                  <Card className="border-2 border-dashed">
                    <CardBody>
                      <h6 className="mb-3">🎬 Event Trailer Video (Cloudflare Stream)</h6>
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
                  <label className="form-label">Description *</label>
                  <textarea 
                    {...register('description')} 
                    className={`form-control ${errors.description ? 'is-invalid' : ''}`} 
                    rows={3} 
                  />
                  {errors.description && <div className="invalid-feedback">{errors.description.message}</div>}
                </Col>

                {/* Event Type */}
                <Col lg={6} className="mt-3">
                  <label className="form-label">Event Type *</label>
                  <select {...register('eventType')} className={`form-select ${errors.eventType ? 'is-invalid' : ''}`}>
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
                  {errors.eventType && <div className="invalid-feedback">{errors.eventType.message}</div>}
                </Col>

                <Col lg={6} className="mt-3">
                  <label className="form-label">Category *</label>
                  <select {...register('category')} className={`form-select ${errors.category ? 'is-invalid' : ''}`}>
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
                  {errors.category && <div className="invalid-feedback">{errors.category.message}</div>}
                </Col>

                <Col lg={6} className="mt-3">
                  <label className="form-label">Language *</label>
                  <select {...register('eventLanguage')} className={`form-select ${errors.eventLanguage ? 'is-invalid' : ''}`}>
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
                    <option value="Urdu">Urdu</option>
                    <option value="Odia">Odia</option>
                    <option value="Assamese">Assamese</option>
                    <option value="Multilingual">Multilingual</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.eventLanguage && <div className="invalid-feedback">{errors.eventLanguage.message}</div>}
                </Col>

                {/* Dates and Times */}
                <Col lg={3} className="mt-3">
                  <label className="form-label">Start Date *</label>
                  <input 
                    type="date" 
                    {...register('startDate')} 
                    className={`form-control ${errors.startDate ? 'is-invalid' : ''}`} 
                  />
                  {errors.startDate && <div className="invalid-feedback">{errors.startDate.message}</div>}
                </Col>
                <Col lg={3} className="mt-3">
                  <label className="form-label">End Date *</label>
                  <input 
                    type="date" 
                    {...register('endDate')} 
                    className={`form-control ${errors.endDate ? 'is-invalid' : ''}`} 
                  />
                  {errors.endDate && <div className="invalid-feedback">{errors.endDate.message}</div>}
                </Col>
                <Col lg={3} className="mt-3">
                  <label className="form-label">Start Time *</label>
                  <input 
                    type="time" 
                    {...register('startTime')} 
                    className={`form-control ${errors.startTime ? 'is-invalid' : ''}`} 
                  />
                  {errors.startTime && <div className="invalid-feedback">{errors.startTime.message}</div>}
                </Col>
                <Col lg={3} className="mt-3">
                  <label className="form-label">End Time *</label>
                  <input 
                    type="time" 
                    {...register('endTime')} 
                    className={`form-control ${errors.endTime ? 'is-invalid' : ''}`} 
                  />
                  {errors.endTime && <div className="invalid-feedback">{errors.endTime.message}</div>}
                </Col>

                {/* Status */}
                <Col lg={6} className="mt-3">
                  <label className="form-label">Status *</label>
                  <select {...register('status')} className={`form-select ${errors.status ? 'is-invalid' : ''}`}>
                    <option value="">-- Select --</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  {errors.status && <div className="invalid-feedback">{errors.status.message}</div>}
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
                  <label className="form-label">Venue Name *</label>
                  <input 
                    type="text" 
                    {...register('venueName')} 
                    className={`form-control ${errors.venueName ? 'is-invalid' : ''}`} 
                  />
                  {errors.venueName && <div className="invalid-feedback">{errors.venueName.message}</div>}
                </Col>
                <Col lg={6}>
                  <label className="form-label">Address *</label>
                  <input 
                    type="text" 
                    {...register('address')} 
                    className={`form-control ${errors.address ? 'is-invalid' : ''}`} 
                  />
                  {errors.address && <div className="invalid-feedback">{errors.address.message}</div>}
                </Col>
                <Col lg={4} className="mt-3">
                  <label className="form-label">City *</label>
                  <input 
                    type="text" 
                    {...register('city')} 
                    className={`form-control ${errors.city ? 'is-invalid' : ''}`} 
                  />
                  {errors.city && <div className="invalid-feedback">{errors.city.message}</div>}
                </Col>
                <Col lg={4} className="mt-3">
                  <label className="form-label">State *</label>
                  <input 
                    type="text" 
                    {...register('state')} 
                    className={`form-control ${errors.state ? 'is-invalid' : ''}`} 
                  />
                  {errors.state && <div className="invalid-feedback">{errors.state.message}</div>}
                </Col>
                <Col lg={4} className="mt-3">
                  <label className="form-label">Postal Code *</label>
                  <input 
                    type="text" 
                    {...register('postalCode')} 
                    className={`form-control ${errors.postalCode ? 'is-invalid' : ''}`} 
                  />
                  {errors.postalCode && <div className="invalid-feedback">{errors.postalCode.message}</div>}
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
                  <input 
                    type="number" 
                    {...register('ticketPrice')} 
                    className={`form-control ${errors.ticketPrice ? 'is-invalid' : ''}`} 
                    placeholder="0" 
                  />
                  {errors.ticketPrice && <div className="invalid-feedback">{errors.ticketPrice.message}</div>}
                </Col>
                <Col lg={3}>
                  <label className="form-label">Total Seats *</label>
                  <input 
                    type="number" 
                    {...register('totalSeats')} 
                    className={`form-control ${errors.totalSeats ? 'is-invalid' : ''}`} 
                    placeholder="100" 
                  />
                  {errors.totalSeats && <div className="invalid-feedback">{errors.totalSeats.message}</div>}
                </Col>
                <Col lg={3}>
                  <label className="form-label">Available Seats *</label>
                  <input 
                    type="number" 
                    {...register('availableSeats')} 
                    className={`form-control ${errors.availableSeats ? 'is-invalid' : ''}`} 
                    placeholder="100" 
                  />
                  {errors.availableSeats && <div className="invalid-feedback">{errors.availableSeats.message}</div>}
                </Col>
                <Col lg={3}>
                  <label className="form-label">Max Tickets/Person</label>
                  <input type="number" {...register('maxTicketsPerPerson')} className="form-control" />
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
              <CardTitle as="h4">Gallery Images</CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                <Col lg={12}>
                  <label className="form-label">Upload New Gallery Images</label>
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

              {/* Existing Gallery Images */}
              {existingGalleryUrls.length > 0 && (
                <>
                  <h6 className="mt-4 mb-3">Existing Gallery Images</h6>
                  <Row>
                    {existingGalleryUrls.map((url, index) => (
                      <Col lg={3} md={4} sm={6} xs={12} key={`existing-${index}`} className="mb-3">
                        <div className="position-relative border rounded p-2">
                          <img
                            src={url}
                            alt={`gallery-${index}`}
                            className="img-fluid rounded"
                            style={{ height: '120px', objectFit: 'cover', width: '100%' }}
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://res.cloudinary.com/drulco0au/image/upload/v1770982075/ss_ldwhjh.png' }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                            onClick={() => removeExistingGalleryImage(index)}
                          >
                            ✕
                          </button>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </>
              )}

              {/* New Gallery Images Preview */}
              {galleryImages.length > 0 && (
                <>
                  <h6 className="mt-4 mb-3">New Gallery Images</h6>
                  <Row>
                    {galleryImages.map((file: File, index: number) => (
                      <Col lg={3} md={4} sm={6} xs={12} key={`new-${index}`} className="mb-3">
                        <div className="position-relative border rounded p-2">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`new-gallery-${index}`}
                            className="img-fluid rounded"
                            style={{ height: '120px', objectFit: 'cover', width: '100%' }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                            onClick={() => setGalleryImages((prev: File[]) => prev.filter((_, i) => i !== index))}
                          >
                            ✕
                          </button>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </>
              )}
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
                </Col>
              </Row>
            </CardBody>
          </Card>

          {/* Performers */}
          <Card className="mt-4">
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle as="h4">Performers Details</CardTitle>
              <button type="button" className="btn btn-sm btn-outline-primary" onClick={addPerformer}>
                + Add Performer
              </button>
            </CardHeader>

            <CardBody>
              {performers.map((performer, index) => (
                <Row key={`performer-${index}`} className="align-items-end mb-3 pb-3 border-bottom">
                  {/* Performer Image Preview */}
                  <Col lg={2}>
                    <label className="form-label">Image</label>
                    {(performer.imagePreview || performer.existingImage) && (
                      <div className="mb-2">
                        <img
                          src={performer.imagePreview || performer.existingImage}
                          alt={`performer-${index}`}
                          width={60}
                          height={60}
                          style={{ objectFit: 'cover', borderRadius: '50%' }}
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://res.cloudinary.com/drulco0au/image/upload/v1770982075/ss_ldwhjh.png' }}
                        />
                      </div>
                    )}
                    <input 
                      type="file" 
                      className="form-control form-control-sm" 
                      accept="image/*"
                      onChange={(e) => handlePerformerChange(index, 'image', e.target.files?.[0] || null)} 
                    />
                  </Col>

                  {/* Performer Name */}
                  <Col lg={3}>
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={performer.name}
                      onChange={(e) => handlePerformerChange(index, 'name', e.target.value)}
                      placeholder="Enter performer's name"
                    />
                  </Col>

                  {/* Performer Type */}
                  <Col lg={2}>
                    <label className="form-label">Type</label>
                    <select className="form-select" value={performer.type} onChange={(e) => handlePerformerChange(index, 'type', e.target.value)}>
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
                      onChange={(e) => handlePerformerChange(index, 'bio', e.target.value)}
                      placeholder="Enter short bio"
                    />
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
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </Col>
                </Row>
              ))}
            </CardBody>
          </Card>

          {/* Organizers */}
          <Card className="mt-4">
            <CardHeader className="d-flex justify-content-between align-items-center">
              <CardTitle as="h4">Organizers Details</CardTitle>
              <button type="button" className="btn btn-sm btn-outline-primary" onClick={addOrganizers}>
                + Add Organizer
              </button>
            </CardHeader>

            <CardBody>
              {organizers.map((organizer, index) => (
                <Row key={`organizer-${index}`} className="align-items-end mb-3 pb-3 border-bottom">
                  {/* Organizer Logo Preview */}
                  <Col lg={2}>
                    <label className="form-label">Logo</label>
                    {(organizer.logoPreview || organizer.existingLogo) && (
                      <div className="mb-2">
                        <img
                          src={organizer.logoPreview || organizer.existingLogo}
                          alt={`organizer-${index}`}
                          width={60}
                          height={60}
                          style={{ objectFit: 'cover', borderRadius: '8px' }}
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://res.cloudinary.com/drulco0au/image/upload/v1770982075/ss_ldwhjh.png' }}
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      className="form-control form-control-sm"
                      accept="image/*"
                      onChange={(e) => handleOrganizerChange(index, 'logo', e.target.files?.[0] || null)}
                    />
                  </Col>

                  {/* Organizer Name */}
                  <Col lg={3}>
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={organizer.name}
                      onChange={(e) => handleOrganizerChange(index, 'name', e.target.value)}
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
                      onChange={(e) => handleOrganizerChange(index, 'email', e.target.value)}
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
                      onChange={(e) => handleOrganizerChange(index, 'phone', e.target.value)}
                      placeholder="Enter phone number"
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
                        }}
                      >
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
                    Updating...
                  </>
                ) : (
                  'Update Event'
                )}
              </Button>
            </Col>
          </Row>
        </div>
      </form>

      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={4000} autohide bg={toastVariant}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default EventsEdit
