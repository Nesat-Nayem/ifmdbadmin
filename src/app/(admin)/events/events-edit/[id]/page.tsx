'use client'

import { useGetEventsByIdQuery, useUpdateEventsMutation } from '@/store/eventsApi'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Container, Row, Toast, ToastContainer } from 'react-bootstrap'
import * as yup from 'yup'
import { useForm } from 'react-hook-form'
import Image from 'next/image'

// Validation Schema
const schema = yup.object().shape({
  title: yup.string().required('Please enter title'),
  description: yup.string().required('Please enter description'),
  eventType: yup.string().required('Please select event type'),
  category: yup.string().required('Please select category'),
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
  tagsInput: yup.string().required('Tags required'),
})

type FormValues = yup.InferType<typeof schema> & {
  posterImage?: string
  galleryImages?: string[]
  performers?: string[]
  organizers?: string[]
  tags?: string[]
  tagsInput?: string // 👈 add this
}

// Placeholder file upload function
const uploadFile = async (file: File): Promise<string> => {
  return Promise.resolve(URL.createObjectURL(file))
}

const EventsEdit = () => {
  const router = useRouter()
  const params = useParams()
  const eventId = typeof params?.id === 'string' ? params.id : undefined

  const [poster, setPoster] = useState<File | null>(null)
  const [galleryImages, setGalleryImages] = useState<File[]>([])

  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)
  const [posterPreview, setPosterPreview] = useState<string | null>(null)

  const handlePosterChange = (file: File | null) => {
    setPoster(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPosterPreview(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      setPosterPreview(null)
    }
  }

  const { data: event, isLoading: isFetching } = useGetEventsByIdQuery(eventId!, { skip: !eventId })

  const [updateEvent, { isLoading }] = useUpdateEventsMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }, // can keep this if you want, but not used anymore
  } = useForm<FormValues>({
    defaultValues: {} as FormValues, // keep for pre-filling data
  })

  // Pre-fill form when data is fetched
  useEffect(() => {
    if (event) {
      reset({
        ...event,
        venueName: event.location?.venueName || '',
        address: event.location?.address || '',
        city: event.location?.city || '',
        state: event.location?.state || '',
        postalCode: event.location?.postalCode || '',
        latitude: event.location?.latitude ?? 0,
        longitude: event.location?.longitude ?? 0,
        tagsInput: event.tags?.join(', ') || '',
        performers: event.performers.map((p) => p.name || ''),
        organizers: event.organizers.map((o) => o.name || ''),
      })

      setPerformers(
        event.performers.length
          ? event.performers.map((p) => ({
              name: p.name || '',
              type: p.type || '',
              bio: p.bio || '',
              image: null, // You can store p.imageUrl if you want preview
            }))
          : [{ name: '', type: '', bio: '', image: null }],
      )

      setOrganizers(
        event.organizers.length
          ? event.organizers.map((o) => ({
              name: o.name || '',
              email: o.email || '',
              phone: o.phone || '',
              logo: null, // store o.logoUrl if you want preview
            }))
          : [{ name: '', email: '', phone: '', logo: null }],
      )

      // Optional: store existing poster URL if you want preview
      setPoster(null)
      setGalleryImages([])
    }
  }, [event, reset])

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  // Performers
  const [performers, setPerformers] = useState([{ name: '', type: '', bio: '', image: null }])
  const addPerformer = () => setPerformers([...performers, { name: '', type: '', bio: '', image: null }])
  const handleChange = (index: number, field: keyof (typeof performers)[number], value: any) => {
    const updated = [...performers]
    updated[index] = { ...updated[index], [field]: value }
    setPerformers(updated)
  }

  // Organizers
  const [organizers, setOrganizers] = useState([{ name: '', email: '', phone: '', logo: null }])
  const addOrganizers = () => setOrganizers([...organizers, { name: '', email: '', phone: '', logo: null }])
  const handleChangeOrganizers = (index: number, field: keyof (typeof organizers)[number], value: any) => {
    const updated = [...organizers]
    updated[index] = { ...updated[index], [field]: value }
    setOrganizers(updated)
  }

  const onSubmit = async (values: FormValues) => {
    if (!eventId) return

    try {
      // Prepare plain object for JSON fields
      const payload = {
        title: values.title,
        description: values.description,
        eventType: values.eventType,
        category: values.category,
        startDate: values.startDate,
        endDate: values.endDate,
        startTime: values.startTime,
        endTime: values.endTime,
        status: values.status,
        ticketPrice: values.ticketPrice,
        totalSeats: values.totalSeats,
        availableSeats: values.availableSeats,
        isActive: true,
        location: {
          venueName: values.venueName,
          address: values.address,
          city: values.city,
          state: values.state,
          postalCode: values.postalCode,
          latitude: values.latitude,
          longitude: values.longitude,
        },
        tags: (values.tagsInput || '')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        performers: performers.map((p) => ({ name: p.name, type: p.type, bio: p.bio })),
        organizers: organizers.map((o) => ({ name: o.name, email: o.email, phone: o.phone })),
      }

      // FormData only for files
      const formData = new FormData()
      if (poster) formData.append('posterImage', poster)
      galleryImages.forEach((file) => formData.append('galleryImages', file))
      performers.forEach((p, i) => {
        if (p.image) formData.append(`performersImages[${i}]`, p.image)
      })
      organizers.forEach((o, i) => {
        if (o.logo) formData.append(`organizersLogos[${i}]`, o.logo)
      })

      // Send JSON in 'body' field
      formData.append('body', JSON.stringify(payload))

      await updateEvent({ id: eventId, data: formData }).unwrap()

      showMessage('Event updated successfully!', 'success')
    } catch (err) {
      console.error(err)
      showMessage('Failed to update event', 'error')
    }
  }

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
                {/* Poster Upload */}
                <Col lg={6}>
                  <label className="form-label">Upload Poster *</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={(e) => handlePosterChange(e.target.files?.[0] || null)}
                    required
                  />

                  {posterPreview && <Image src={posterPreview} alt="poster preview" width={100} height={100} style={{ objectFit: 'cover' }} />}
                </Col>

                <Col lg={6}>
                  <label className="form-label">Event Name</label>
                  <input type="text" {...register('title')} className="form-control" />
                </Col>

                <Col lg={12} className="mt-3">
                  <label className="form-label">Description</label>
                  <textarea {...register('description')} className="form-control" rows={3} />
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
                </Col>

                <Col lg={6} className="mt-3">
                  <label className="form-label">Category</label>
                  <input type="text" {...register('category')} className="form-control" />
                </Col>

                {/* Dates and Times */}
                <Col lg={3} className="mt-3">
                  <label className="form-label">Start Date</label>
                  <input type="date" {...register('startDate')} className="form-control" />
                </Col>
                <Col lg={3} className="mt-3">
                  <label className="form-label">End Date</label>
                  <input type="date" {...register('endDate')} className="form-control" />
                </Col>
                <Col lg={3} className="mt-3">
                  <label className="form-label">Start Time</label>
                  <input type="time" {...register('startTime')} className="form-control" />
                </Col>
                <Col lg={3} className="mt-3">
                  <label className="form-label">End Time</label>
                  <input type="time" {...register('endTime')} className="form-control" />
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
                </Col>
                <Col lg={6}>
                  <label className="form-label">Address</label>
                  <input type="text" {...register('address')} className="form-control" />
                </Col>
                <Col lg={4} className="mt-3">
                  <label className="form-label">City</label>
                  <input type="text" {...register('city')} className="form-control" />
                </Col>
                <Col lg={4} className="mt-3">
                  <label className="form-label">State</label>
                  <input type="text" {...register('state')} className="form-control" />
                </Col>
                <Col lg={4} className="mt-3">
                  <label className="form-label">Postal Code</label>
                  <input type="text" {...register('postalCode')} className="form-control" />
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
                <Col lg={4}>
                  <label className="form-label">Ticket Price</label>
                  <input type="number" {...register('ticketPrice')} className="form-control" />
                </Col>
                <Col lg={4}>
                  <label className="form-label">Total Seats</label>
                  <input type="number" {...register('totalSeats')} className="form-control" />
                </Col>
                <Col lg={4}>
                  <label className="form-label">Available Seats</label>
                  <input type="number" {...register('availableSeats')} className="form-control" />
                </Col>
              </Row>
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

          {/* tags */}
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
          <Row className="justify-content-end g-2">
            <Col lg={2}>
              <Button type="submit" variant="success" className="w-100" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
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

export default EventsEdit
