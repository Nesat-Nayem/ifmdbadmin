'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardBody, CardHeader, CardTitle, Form, Button, Row, Col, Spinner, Toast, ToastContainer, Tab, Tabs, Badge } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { FaPlus, FaTrash, FaSave } from 'react-icons/fa'
import { useCreateWatchVideoMutation, useGetWatchVideoCategoriesQuery, useGetChannelsQuery } from '@/store/watchVideosApi'
import { useUploadSingleMutation } from '@/store/uploadApi'
import CloudflareVideoUploader from '@/components/CloudflareVideoUploader'

// Import comprehensive countries data
import COUNTRIES, { ICountry } from '@/data/countries'

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
  homeSection: yup.string().oneOf(['', 'trending_now', 'most_popular', 'exclusive_on_moviemart', 'new_release']).optional(),
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

interface IEpisode {
  episodeNumber: number
  title: string
  description: string
  videoUrl: string
  thumbnailUrl: string
  duration: number
  releaseDate?: string
  isFree: boolean
  price: number
  isActive: boolean
}

interface ISeason {
  seasonNumber: number
  title: string
  description: string
  episodes: IEpisode[]
  releaseDate?: string
  isActive: boolean
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
  const [seasons, setSeasons] = useState<ISeason[]>([])
  const [countrySearch, setCountrySearch] = useState('')
  
  // Media states
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [posterFile, setPosterFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [trailerUrl, setTrailerUrl] = useState('')
  const [cloudflareVideoUid, setCloudflareVideoUid] = useState('')
  const [cloudflareTrailerUid, setCloudflareTrailerUid] = useState('')
  const [thumbnailUploading, setThumbnailUploading] = useState(false)
  const [posterUploading, setPosterUploading] = useState(false)
  const [castImageUploading, setCastImageUploading] = useState<number | null>(null)
  const [crewImageUploading, setCrewImageUploading] = useState<number | null>(null)

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
      homeSection: '',
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

  // Filtered countries for search
  const filteredCountries = COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase())
  )

  const addCountryPricing = (country: typeof COUNTRIES[0]) => {
    if (!countryPricing.find(cp => cp.countryCode === country.code)) {
      setCountryPricing([...countryPricing, {
        countryCode: country.code,
        countryName: country.name,
        currency: country.currency,
        price: 0,
        isActive: true
      }])
    }
    setCountrySearch('')
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

  const handleCastImageUpload = async (index: number, file: File) => {
    setCastImageUploading(index)
    try {
      const url = await uploadSingle(file).unwrap()
      updateCastMember(index, 'image', url)
    } catch (error) {
      console.error('Failed to upload cast image:', error)
    } finally {
      setCastImageUploading(null)
    }
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

  const handleCrewImageUpload = async (index: number, file: File) => {
    setCrewImageUploading(index)
    try {
      const url = await uploadSingle(file).unwrap()
      updateCrewMember(index, 'image', url)
    } catch (error) {
      console.error('Failed to upload crew image:', error)
    } finally {
      setCrewImageUploading(null)
    }
  }

  // Season/Episode handlers
  const addSeason = () => {
    setSeasons([...seasons, {
      seasonNumber: seasons.length + 1,
      title: `Season ${seasons.length + 1}`,
      description: '',
      episodes: [],
      isActive: true
    }])
  }
  const removeSeason = (index: number) => setSeasons(seasons.filter((_, i) => i !== index))
  const updateSeason = (index: number, field: keyof ISeason, value: any) => {
    const updated = [...seasons]
    updated[index] = { ...updated[index], [field]: value }
    setSeasons(updated)
  }

  const addEpisode = (seasonIndex: number) => {
    const updated = [...seasons]
    const episodeNum = updated[seasonIndex].episodes.length + 1
    updated[seasonIndex].episodes.push({
      episodeNumber: episodeNum,
      title: `Episode ${episodeNum}`,
      description: '',
      videoUrl: '',
      thumbnailUrl: '',
      duration: 0,
      isFree: false,
      price: 0,
      isActive: true
    })
    setSeasons(updated)
  }
  const removeEpisode = (seasonIndex: number, episodeIndex: number) => {
    const updated = [...seasons]
    updated[seasonIndex].episodes = updated[seasonIndex].episodes.filter((_, i) => i !== episodeIndex)
    setSeasons(updated)
  }
  const updateEpisode = (seasonIndex: number, episodeIndex: number, field: keyof IEpisode, value: any) => {
    const updated = [...seasons]
    updated[seasonIndex].episodes[episodeIndex] = { ...updated[seasonIndex].episodes[episodeIndex], [field]: value }
    setSeasons(updated)
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
        seasons: values.videoType === 'series' ? seasons as any : [],
        thumbnailUrl: thumbnailUrl || '/assets/images/placeholder.png',
        posterUrl: posterUrl || '/assets/images/placeholder.png',
        videoUrl,
        trailerUrl,
        uploadedBy: user._id,
        uploadedByType: user.role === 'admin' ? 'admin' as const : 'vendor' as const,
        homeSection: values.homeSection || '',
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
                  <Col md={6} className="mt-3">
                    <Form.Group>
                      <Form.Label>Home Page Section</Form.Label>
                      <Form.Select {...register('homeSection')}>
                        <option value="">-- Not Featured on Home --</option>
                        <option value="trending_now">Trending Now</option>
                        <option value="most_popular">Most Popular</option>
                        <option value="exclusive_on_moviemart">Exclusive on Movie Mart</option>
                        <option value="new_release">New Release</option>
                      </Form.Select>
                      <Form.Text className="text-muted">Select a section to feature this video on the home page</Form.Text>
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
                    </div>
                    {/* Country Search Dropdown */}
                    <div className="mb-3 position-relative">
                      <Form.Control
                        placeholder="Search country to add..."
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                      />
                      {countrySearch && (
                        <div className="position-absolute w-100 bg-white border rounded shadow-sm" style={{ zIndex: 1000, maxHeight: 300, overflowY: 'auto' }}>
                          {filteredCountries.length === 0 ? (
                            <div className="p-3 text-muted text-center">No countries found</div>
                          ) : (
                            filteredCountries.slice(0, 20).map(country => (
                              <div
                                key={country.code}
                                className="p-2 d-flex align-items-center gap-2 border-bottom"
                                style={{ cursor: 'pointer' }}
                                onClick={() => addCountryPricing(country)}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                              >
                                <span style={{ fontSize: '1.5rem' }}>{country.flag}</span>
                                <div>
                                  <strong>{country.name}</strong>
                                  <small className="text-muted d-block">{country.code} • {country.currency} ({country.currencySymbol})</small>
                                </div>
                              </div>
                            ))
                          )}
                          {filteredCountries.length > 20 && (
                            <div className="p-2 text-muted text-center small">Type more to narrow down results...</div>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Country Pricing List */}
                    {countryPricing.length === 0 ? (
                      <div className="text-muted text-center py-3 border rounded bg-light">
                        <small>No country pricing added. Search and add countries above.</small>
                      </div>
                    ) : (
                      countryPricing.map((cp, index) => {
                        const countryData = COUNTRIES.find(c => c.code === cp.countryCode)
                        return (
                          <Row key={index} className="mb-2 align-items-center py-2 border-bottom">
                            <Col md={4}>
                              <div className="d-flex align-items-center gap-2">
                                <span style={{ fontSize: '1.3rem' }}>{countryData?.flag || '🏳️'}</span>
                                <div>
                                  <strong>{cp.countryName}</strong>
                                  <small className="text-muted d-block">{cp.countryCode} • {cp.currency}</small>
                                </div>
                              </div>
                            </Col>
                            <Col md={3}>
                              <div className="input-group input-group-sm">
                                <span className="input-group-text">{countryData?.currencySymbol || cp.currency}</span>
                                <Form.Control 
                                  type="number"
                                  placeholder="Price"
                                  value={cp.price}
                                  onChange={(e) => updateCountryPricing(index, 'price', Number(e.target.value))}
                                  size="sm"
                                />
                              </div>
                            </Col>
                            <Col md={3}>
                              <Form.Check 
                                type="switch"
                                label="Active"
                                checked={cp.isActive}
                                onChange={(e) => updateCountryPricing(index, 'isActive', e.target.checked)}
                              />
                            </Col>
                            <Col md={2}>
                              <Button size="sm" variant="outline-danger" onClick={() => removeCountryPricing(index)}>
                                <FaTrash />
                              </Button>
                            </Col>
                          </Row>
                        )
                      })
                    )}
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

              {/* Series/Episodes Tab - Only show for series type */}
              {videoType === 'series' && (
                <Tab eventKey="episodes" title="Seasons & Episodes">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6>Manage Seasons & Episodes</h6>
                    <Button variant="outline-primary" onClick={addSeason}>
                      <FaPlus className="me-1" /> Add Season
                    </Button>
                  </div>
                  {seasons.map((season, sIndex) => (
                    <Card key={sIndex} className="mb-3">
                      <CardHeader className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-3">
                          <strong>Season {season.seasonNumber}</strong>
                          <Form.Control
                            size="sm"
                            placeholder="Season Title"
                            value={season.title}
                            onChange={(e) => updateSeason(sIndex, 'title', e.target.value)}
                            style={{ width: 200 }}
                          />
                        </div>
                        <div className="d-flex gap-2">
                          <Form.Check
                            type="switch"
                            label="Active"
                            checked={season.isActive}
                            onChange={(e) => updateSeason(sIndex, 'isActive', e.target.checked)}
                          />
                          <Button size="sm" variant="outline-danger" onClick={() => removeSeason(sIndex)}>
                            <FaTrash />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardBody>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-muted">{season.episodes.length} Episode(s)</span>
                          <Button size="sm" variant="outline-success" onClick={() => addEpisode(sIndex)}>
                            <FaPlus className="me-1" /> Add Episode
                          </Button>
                        </div>
                        {season.episodes.map((episode, eIndex) => (
                          <Card key={eIndex} className="mb-3 border">
                            <CardBody className="py-3">
                              <Row className="align-items-center mb-2">
                                <Col md={1}>
                                  <Badge bg={episode.isFree ? 'success' : 'warning'}>
                                    E{episode.episodeNumber}
                                  </Badge>
                                </Col>
                                <Col md={4}>
                                  <Form.Control
                                    size="sm"
                                    placeholder="Episode Title"
                                    value={episode.title}
                                    onChange={(e) => updateEpisode(sIndex, eIndex, 'title', e.target.value)}
                                  />
                                </Col>
                                <Col md={2}>
                                  <Form.Control
                                    size="sm"
                                    type="number"
                                    placeholder="Duration (sec)"
                                    value={episode.duration}
                                    onChange={(e) => updateEpisode(sIndex, eIndex, 'duration', Number(e.target.value))}
                                  />
                                </Col>
                                <Col md={3}>
                                  <div className="d-flex align-items-center gap-2">
                                    <Form.Check
                                      type="switch"
                                      id={`add-free-switch-${sIndex}-${eIndex}`}
                                      label={episode.isFree ? 'Free' : 'Paid'}
                                      checked={episode.isFree}
                                      onChange={(e) => updateEpisode(sIndex, eIndex, 'isFree', e.target.checked)}
                                      className="text-nowrap"
                                    />
                                    {!episode.isFree && (
                                      <Form.Control
                                        size="sm"
                                        type="number"
                                        placeholder="Price"
                                        value={episode.price}
                                        onChange={(e) => updateEpisode(sIndex, eIndex, 'price', Number(e.target.value))}
                                        style={{ width: 80 }}
                                        min={0}
                                      />
                                    )}
                                  </div>
                                </Col>
                                <Col md={2} className="text-end">
                                  <Form.Check
                                    type="switch"
                                    inline
                                    title="Active"
                                    checked={episode.isActive}
                                    onChange={(e) => updateEpisode(sIndex, eIndex, 'isActive', e.target.checked)}
                                  />
                                  <Button size="sm" variant="outline-danger" onClick={() => removeEpisode(sIndex, eIndex)}>
                                    <FaTrash />
                                  </Button>
                                </Col>
                              </Row>
                              <Row className="align-items-center">
                                <Col md={8}>
                                  <CloudflareVideoUploader
                                    onUploadComplete={(uid: string, url: string) => {
                                      updateEpisode(sIndex, eIndex, 'videoUrl', url)
                                    }}
                                    uploadType="main"
                                    existingUid=""
                                  />
                                </Col>
                                <Col md={4}>
                                  {episode.videoUrl && (
                                    <small className="text-success">✅ Video uploaded</small>
                                  )}
                                </Col>
                              </Row>
                            </CardBody>
                          </Card>
                        ))}
                      </CardBody>
                    </Card>
                  ))}
                  {seasons.length === 0 && (
                    <div className="text-center text-muted py-4">
                      No seasons added yet. Click &quot;Add Season&quot; to start adding episodes.
                    </div>
                  )}
                </Tab>
              )}
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
