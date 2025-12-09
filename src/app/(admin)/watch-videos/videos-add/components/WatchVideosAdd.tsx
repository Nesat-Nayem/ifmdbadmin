'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardBody, CardHeader, CardTitle, Form, Button, Row, Col, Spinner, Toast, ToastContainer, Tab, Tabs } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { FaPlus, FaTrash, FaSave } from 'react-icons/fa'
import { useCreateWatchVideoMutation, useGetWatchVideoCategoriesQuery, useGetChannelsQuery } from '@/store/watchVideosApi'
import { useUploadSingleMutation } from '@/store/uploadApi'
import CloudflareVideoUploader from '@/components/CloudflareVideoUploader'

// Validation schema
const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  channelId: yup.string().required('Channel is required'),
  videoType: yup.string().oneOf(['single', 'series']).required('Video type is required'),
  category: yup.string().required('Category is required'),
  duration: yup.number().min(0).required('Duration is required'),
  releaseDate: yup.string().required('Release date is required'),
  ageRating: yup.string().required('Age rating is required'),
  status: yup.string().oneOf(['draft', 'published', 'archived']).default('draft'),
  isFree: yup.boolean().default(false),
  defaultPrice: yup.number().min(0).default(0),
  isFeatured: yup.boolean().default(false),
})

type FormValues = yup.InferType<typeof schema>

interface ICountryPricing {
  countryCode: string
  countryName: string
  currency: string
  price: number
  isActive: boolean
}

interface ICast {
  name: string
  role: string
  image: string
}

interface ICrew {
  name: string
  designation: string
  image: string
}

const WatchVideosAdd = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('basic')
  
  // Toast state
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success')

  // Form states
  const [genres, setGenres] = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [countryPricing, setCountryPricing] = useState<ICountryPricing[]>([])
  const [cast, setCast] = useState<ICast[]>([])
  const [crew, setCrew] = useState<ICrew[]>([])
  
  // Media states
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [posterFile, setPosterFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [trailerUrl, setTrailerUrl] = useState('')
  const [cloudflareVideoUid, setCloudflareVideoUid] = useState('')
  const [cloudflareTrailerUid, setCloudflareTrailerUid] = useState('')

  // Fetch data
  const { data: categories = [] } = useGetWatchVideoCategoriesQuery()
  const { data: channelsData } = useGetChannelsQuery({ limit: 100 })
  const channels = channelsData?.data || []

  // Mutations
  const [createVideo, { isLoading: isCreating }] = useCreateWatchVideoMutation()
  const [uploadSingle] = useUploadSingleMutation()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      videoType: 'single',
      ageRating: 'U',
      status: 'draft',
      isFree: false,
      defaultPrice: 0,
      isFeatured: false,
    },
  })

  const isFree = watch('isFree')
  const videoType = watch('videoType')

  // Add handlers
  const addGenre = (genre: string) => {
    if (genre && !genres.includes(genre)) {
      setGenres([...genres, genre])
    }
  }

  const removeGenre = (index: number) => {
    setGenres(genres.filter((_, i) => i !== index))
  }

  const addLanguage = (language: string) => {
    if (language && !languages.includes(language)) {
      setLanguages([...languages, language])
    }
  }

  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index))
  }

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
    }
  }

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  const addCountryPricing = () => {
    setCountryPricing([...countryPricing, { countryCode: '', countryName: '', currency: 'INR', price: 0, isActive: true }])
  }

  const removeCountryPricing = (index: number) => {
    setCountryPricing(countryPricing.filter((_, i) => i !== index))
  }

  const updateCountryPricing = (index: number, field: keyof ICountryPricing, value: any) => {
    const updated = [...countryPricing]
    updated[index] = { ...updated[index], [field]: value }
    setCountryPricing(updated)
  }

  const addCastMember = () => {
    setCast([...cast, { name: '', role: '', image: '' }])
  }

  const removeCastMember = (index: number) => {
    setCast(cast.filter((_, i) => i !== index))
  }

  const updateCastMember = (index: number, field: keyof ICast, value: string) => {
    const updated = [...cast]
    updated[index] = { ...updated[index], [field]: value }
    setCast(updated)
  }

  const addCrewMember = () => {
    setCrew([...crew, { name: '', designation: '', image: '' }])
  }

  const removeCrewMember = (index: number) => {
    setCrew(crew.filter((_, i) => i !== index))
  }

  const updateCrewMember = (index: number, field: keyof ICrew, value: string) => {
    const updated = [...crew]
    updated[index] = { ...updated[index], [field]: value }
    setCrew(updated)
  }

  // Submit handler
  const onSubmit = async (values: FormValues) => {
    try {
      // Upload images
      let thumbnailUrl = ''
      let posterUrl = ''

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

      // Get user info from localStorage (stored as 'authUser')
      const user = JSON.parse(localStorage.getItem('authUser') || '{}')
      
      // Validate user is logged in
      if (!user._id) {
        setToastMessage('You must be logged in to create videos. Please refresh and try again.')
        setToastVariant('danger')
        setShowToast(true)
        return
      }
      
      const videoData = {
        ...values,
        genres,
        languages,
        tags,
        countryPricing,
        cast,
        crew,
        thumbnailUrl: thumbnailUrl || '/assets/images/placeholder.png',
        posterUrl: posterUrl || '/assets/images/placeholder.png',
        videoUrl,
        trailerUrl,
        uploadedBy: user._id,
        uploadedByType: user.role === 'admin' ? 'admin' as const : 'vendor' as const,
      }

      await createVideo(videoData).unwrap()
      
      setToastMessage('Video created successfully!')
      setToastVariant('success')
      setShowToast(true)

      setTimeout(() => {
        router.push('/watch-videos/videos-list')
      }, 1500)
    } catch (error: any) {
      console.error('Error creating video:', error)
      setToastMessage(error?.data?.message || 'Failed to create video')
      setToastVariant('danger')
      setShowToast(true)
    }
  }

  return (
    <>
      <ToastContainer position="top-end" className="p-3">
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide bg={toastVariant}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Add New Watch Video</CardTitle>
          </CardHeader>
          <CardBody>
            <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'basic')} className="mb-4">
              {/* Basic Info Tab */}
              <Tab eventKey="basic" title="Basic Info">
                <Row className="g-3">
                  <Col md={8}>
                    <Form.Group>
                      <Form.Label>Title *</Form.Label>
                      <Form.Control {...register('title')} isInvalid={!!errors.title} placeholder="Enter video title" />
                      <Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Video Type *</Form.Label>
                      <Form.Select {...register('videoType')}>
                        <option value="single">Single Video / Movie</option>
                        <option value="series">Series / Web Series</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Description *</Form.Label>
                      <Form.Control as="textarea" rows={4} {...register('description')} isInvalid={!!errors.description} />
                      <Form.Control.Feedback type="invalid">{errors.description?.message}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Channel *</Form.Label>
                      <Form.Select {...register('channelId')} isInvalid={!!errors.channelId}>
                        <option value="">Select Channel</option>
                        {channels.map((channel: any) => (
                          <option key={channel._id} value={channel._id}>{channel.name}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.channelId?.message}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Category *</Form.Label>
                      <Form.Select {...register('category')} isInvalid={!!errors.category}>
                        <option value="">Select Category</option>
                        {categories.map((cat: any) => (
                          <option key={cat._id} value={cat.name}>{cat.name}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.category?.message}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Duration (seconds) *</Form.Label>
                      <Form.Control type="number" {...register('duration')} isInvalid={!!errors.duration} />
                      <Form.Control.Feedback type="invalid">{errors.duration?.message}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Release Date *</Form.Label>
                      <Form.Control type="date" {...register('releaseDate')} isInvalid={!!errors.releaseDate} />
                      <Form.Control.Feedback type="invalid">{errors.releaseDate?.message}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Age Rating *</Form.Label>
                      <Form.Select {...register('ageRating')}>
                        <option value="U">U - Universal</option>
                        <option value="UA">UA - Parental Guidance</option>
                        <option value="A">A - Adult Only</option>
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
                  <Col md={4}>
                    <Form.Group>
                      <Form.Check type="checkbox" label="Featured Video" {...register('isFeatured')} />
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
                        <h6 className="mb-3">📽️ Main Video Upload (Cloudflare Stream)</h6>
                        <CloudflareVideoUploader 
                          onUploadComplete={(uid, url) => {
                            setVideoUrl(url)
                            setCloudflareVideoUid(uid)
                          }}
                          uploadType="main"
                          existingUid={cloudflareVideoUid}
                        />
                        {videoUrl && (
                          <div className="mt-2 text-success small">
                            ✅ Video uploaded: {cloudflareVideoUid}
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  </Col>

                  {/* Trailer Upload */}
                  <Col md={12}>
                    <Card className="border-2 border-dashed">
                      <CardBody>
                        <h6 className="mb-3">🎬 Trailer Upload (Cloudflare Stream)</h6>
                        <CloudflareVideoUploader 
                          onUploadComplete={(uid, url) => {
                            setTrailerUrl(url)
                            setCloudflareTrailerUid(uid)
                          }}
                          uploadType="trailer"
                          existingUid={cloudflareTrailerUid}
                        />
                        {trailerUrl && (
                          <div className="mt-2 text-success small">
                            ✅ Trailer uploaded: {cloudflareTrailerUid}
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  </Col>

                  {/* Images */}
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Thumbnail Image</Form.Label>
                      <Form.Control 
                        type="file" 
                        accept="image/*"
                        onChange={(e: any) => setThumbnailFile(e.target.files?.[0] || null)}
                      />
                      {thumbnailFile && (
                        <div className="mt-2">
                          <img src={URL.createObjectURL(thumbnailFile)} alt="Thumbnail preview" className="img-thumbnail" style={{ maxHeight: 100 }} />
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Poster Image</Form.Label>
                      <Form.Control 
                        type="file" 
                        accept="image/*"
                        onChange={(e: any) => setPosterFile(e.target.files?.[0] || null)}
                      />
                      {posterFile && (
                        <div className="mt-2">
                          <img src={URL.createObjectURL(posterFile)} alt="Poster preview" className="img-thumbnail" style={{ maxHeight: 100 }} />
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
              </Tab>

              {/* Pricing Tab */}
              <Tab eventKey="pricing" title="Pricing">
                <Row className="g-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Check 
                        type="switch" 
                        label="Free Video" 
                        {...register('isFree')}
                      />
                    </Form.Group>
                  </Col>
                  {!isFree && (
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Default Price (INR)</Form.Label>
                        <Form.Control type="number" min="0" {...register('defaultPrice')} />
                      </Form.Group>
                    </Col>
                  )}
                  <Col md={12}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6>Country-wise Pricing</h6>
                      <Button size="sm" variant="outline-primary" onClick={addCountryPricing}>
                        <FaPlus className="me-1" /> Add Country
                      </Button>
                    </div>
                    {countryPricing.map((cp, index) => (
                      <Row key={index} className="mb-2 align-items-end">
                        <Col md={2}>
                          <Form.Control 
                            placeholder="Code (IN)" 
                            value={cp.countryCode}
                            onChange={(e) => updateCountryPricing(index, 'countryCode', e.target.value.toUpperCase())}
                          />
                        </Col>
                        <Col md={3}>
                          <Form.Control 
                            placeholder="Country Name"
                            value={cp.countryName}
                            onChange={(e) => updateCountryPricing(index, 'countryName', e.target.value)}
                          />
                        </Col>
                        <Col md={2}>
                          <Form.Control 
                            placeholder="Currency"
                            value={cp.currency}
                            onChange={(e) => updateCountryPricing(index, 'currency', e.target.value.toUpperCase())}
                          />
                        </Col>
                        <Col md={2}>
                          <Form.Control 
                            type="number"
                            placeholder="Price"
                            value={cp.price}
                            onChange={(e) => updateCountryPricing(index, 'price', Number(e.target.value))}
                          />
                        </Col>
                        <Col md={2}>
                          <Form.Check 
                            type="switch"
                            label="Active"
                            checked={cp.isActive}
                            onChange={(e) => updateCountryPricing(index, 'isActive', e.target.checked)}
                          />
                        </Col>
                        <Col md={1}>
                          <Button size="sm" variant="outline-danger" onClick={() => removeCountryPricing(index)}>
                            <FaTrash />
                          </Button>
                        </Col>
                      </Row>
                    ))}
                  </Col>
                </Row>
              </Tab>

              {/* Tags & Genres Tab */}
              <Tab eventKey="tags" title="Tags & Genres">
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Genres</Form.Label>
                      <div className="d-flex gap-2 mb-2">
                        <Form.Control 
                          id="genreInput"
                          placeholder="Add genre"
                          onKeyDown={(e: any) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addGenre(e.target.value)
                              e.target.value = ''
                            }
                          }}
                        />
                        <Button variant="outline-primary" onClick={() => {
                          const input = document.getElementById('genreInput') as HTMLInputElement
                          addGenre(input.value)
                          input.value = ''
                        }}>Add</Button>
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        {genres.map((genre, i) => (
                          <span key={i} className="badge bg-primary d-flex align-items-center gap-1">
                            {genre}
                            <button type="button" className="btn-close btn-close-white" style={{ fontSize: '0.6rem' }} onClick={() => removeGenre(i)} />
                          </span>
                        ))}
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Languages</Form.Label>
                      <div className="d-flex gap-2 mb-2">
                        <Form.Control 
                          id="languageInput"
                          placeholder="Add language"
                          onKeyDown={(e: any) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addLanguage(e.target.value)
                              e.target.value = ''
                            }
                          }}
                        />
                        <Button variant="outline-primary" onClick={() => {
                          const input = document.getElementById('languageInput') as HTMLInputElement
                          addLanguage(input.value)
                          input.value = ''
                        }}>Add</Button>
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        {languages.map((lang, i) => (
                          <span key={i} className="badge bg-info d-flex align-items-center gap-1">
                            {lang}
                            <button type="button" className="btn-close btn-close-white" style={{ fontSize: '0.6rem' }} onClick={() => removeLanguage(i)} />
                          </span>
                        ))}
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Tags</Form.Label>
                      <div className="d-flex gap-2 mb-2">
                        <Form.Control 
                          id="tagInput"
                          placeholder="Add tag"
                          onKeyDown={(e: any) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addTag(e.target.value)
                              e.target.value = ''
                            }
                          }}
                        />
                        <Button variant="outline-primary" onClick={() => {
                          const input = document.getElementById('tagInput') as HTMLInputElement
                          addTag(input.value)
                          input.value = ''
                        }}>Add</Button>
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        {tags.map((tag, i) => (
                          <span key={i} className="badge bg-secondary d-flex align-items-center gap-1">
                            {tag}
                            <button type="button" className="btn-close btn-close-white" style={{ fontSize: '0.6rem' }} onClick={() => removeTag(i)} />
                          </span>
                        ))}
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
              </Tab>

              {/* Cast & Crew Tab */}
              <Tab eventKey="castcrew" title="Cast & Crew">
                <Row className="g-3">
                  <Col md={12}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6>Cast Members</h6>
                      <Button size="sm" variant="outline-primary" onClick={addCastMember}>
                        <FaPlus className="me-1" /> Add Cast
                      </Button>
                    </div>
                    {cast.map((member, index) => (
                      <Row key={index} className="mb-2 align-items-end">
                        <Col md={4}>
                          <Form.Control 
                            placeholder="Name"
                            value={member.name}
                            onChange={(e) => updateCastMember(index, 'name', e.target.value)}
                          />
                        </Col>
                        <Col md={4}>
                          <Form.Control 
                            placeholder="Role/Character"
                            value={member.role}
                            onChange={(e) => updateCastMember(index, 'role', e.target.value)}
                          />
                        </Col>
                        <Col md={3}>
                          <Form.Control 
                            placeholder="Image URL"
                            value={member.image}
                            onChange={(e) => updateCastMember(index, 'image', e.target.value)}
                          />
                        </Col>
                        <Col md={1}>
                          <Button size="sm" variant="outline-danger" onClick={() => removeCastMember(index)}>
                            <FaTrash />
                          </Button>
                        </Col>
                      </Row>
                    ))}
                  </Col>
                  <Col md={12} className="mt-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6>Crew Members</h6>
                      <Button size="sm" variant="outline-primary" onClick={addCrewMember}>
                        <FaPlus className="me-1" /> Add Crew
                      </Button>
                    </div>
                    {crew.map((member, index) => (
                      <Row key={index} className="mb-2 align-items-end">
                        <Col md={4}>
                          <Form.Control 
                            placeholder="Name"
                            value={member.name}
                            onChange={(e) => updateCrewMember(index, 'name', e.target.value)}
                          />
                        </Col>
                        <Col md={4}>
                          <Form.Control 
                            placeholder="Designation"
                            value={member.designation}
                            onChange={(e) => updateCrewMember(index, 'designation', e.target.value)}
                          />
                        </Col>
                        <Col md={3}>
                          <Form.Control 
                            placeholder="Image URL"
                            value={member.image}
                            onChange={(e) => updateCrewMember(index, 'image', e.target.value)}
                          />
                        </Col>
                        <Col md={1}>
                          <Button size="sm" variant="outline-danger" onClick={() => removeCrewMember(index)}>
                            <FaTrash />
                          </Button>
                        </Col>
                      </Row>
                    ))}
                  </Col>
                </Row>
              </Tab>
            </Tabs>

            {/* Submit Button */}
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Spinner size="sm" className="me-2" /> Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="me-2" /> Save Video
                  </>
                )}
              </Button>
            </div>
          </CardBody>
        </Card>
      </Form>
    </>
  )
}

export default WatchVideosAdd
