'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardBody, CardHeader, CardTitle, Form, Button, Row, Col, Spinner, Toast, ToastContainer, Tab, Tabs, Badge, Image } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { FaSave, FaArrowLeft, FaPlus, FaTrash, FaUpload } from 'react-icons/fa'
import { 
  useGetWatchVideoByIdQuery, 
  useUpdateWatchVideoMutation, 
  useGetWatchVideoCategoriesQuery, 
  useGetChannelsQuery 
} from '@/store/watchVideosApi'
import { useUploadSingleMutation } from '@/store/uploadApi'
import CloudflareVideoUploader from '@/components/CloudflareVideoUploader'

// Country list with codes and currencies
const COUNTRIES = [
  { code: 'IN', name: 'India', currency: 'INR' },
  { code: 'US', name: 'United States', currency: 'USD' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
  { code: 'CA', name: 'Canada', currency: 'CAD' },
  { code: 'AU', name: 'Australia', currency: 'AUD' },
  { code: 'AE', name: 'United Arab Emirates', currency: 'AED' },
  { code: 'SG', name: 'Singapore', currency: 'SGD' },
  { code: 'DE', name: 'Germany', currency: 'EUR' },
  { code: 'FR', name: 'France', currency: 'EUR' },
  { code: 'JP', name: 'Japan', currency: 'JPY' },
  { code: 'CN', name: 'China', currency: 'CNY' },
  { code: 'KR', name: 'South Korea', currency: 'KRW' },
  { code: 'BR', name: 'Brazil', currency: 'BRL' },
  { code: 'MX', name: 'Mexico', currency: 'MXN' },
  { code: 'ZA', name: 'South Africa', currency: 'ZAR' },
  { code: 'NZ', name: 'New Zealand', currency: 'NZD' },
  { code: 'BD', name: 'Bangladesh', currency: 'BDT' },
  { code: 'PK', name: 'Pakistan', currency: 'PKR' },
  { code: 'LK', name: 'Sri Lanka', currency: 'LKR' },
  { code: 'NP', name: 'Nepal', currency: 'NPR' },
  { code: 'MY', name: 'Malaysia', currency: 'MYR' },
  { code: 'ID', name: 'Indonesia', currency: 'IDR' },
  { code: 'TH', name: 'Thailand', currency: 'THB' },
  { code: 'PH', name: 'Philippines', currency: 'PHP' },
  { code: 'VN', name: 'Vietnam', currency: 'VND' },
  { code: 'SA', name: 'Saudi Arabia', currency: 'SAR' },
  { code: 'QA', name: 'Qatar', currency: 'QAR' },
  { code: 'KW', name: 'Kuwait', currency: 'KWD' },
  { code: 'OM', name: 'Oman', currency: 'OMR' },
  { code: 'BH', name: 'Bahrain', currency: 'BHD' },
  { code: 'EG', name: 'Egypt', currency: 'EGP' },
  { code: 'NG', name: 'Nigeria', currency: 'NGN' },
  { code: 'KE', name: 'Kenya', currency: 'KES' },
  { code: 'GH', name: 'Ghana', currency: 'GHS' },
  { code: 'IT', name: 'Italy', currency: 'EUR' },
  { code: 'ES', name: 'Spain', currency: 'EUR' },
  { code: 'NL', name: 'Netherlands', currency: 'EUR' },
  { code: 'SE', name: 'Sweden', currency: 'SEK' },
  { code: 'NO', name: 'Norway', currency: 'NOK' },
  { code: 'DK', name: 'Denmark', currency: 'DKK' },
  { code: 'FI', name: 'Finland', currency: 'EUR' },
  { code: 'CH', name: 'Switzerland', currency: 'CHF' },
  { code: 'AT', name: 'Austria', currency: 'EUR' },
  { code: 'BE', name: 'Belgium', currency: 'EUR' },
  { code: 'PL', name: 'Poland', currency: 'PLN' },
  { code: 'CZ', name: 'Czech Republic', currency: 'CZK' },
  { code: 'RU', name: 'Russia', currency: 'RUB' },
  { code: 'TR', name: 'Turkey', currency: 'TRY' },
  { code: 'IL', name: 'Israel', currency: 'ILS' },
  { code: 'AR', name: 'Argentina', currency: 'ARS' },
  { code: 'CL', name: 'Chile', currency: 'CLP' },
  { code: 'CO', name: 'Colombia', currency: 'COP' },
  { code: 'PE', name: 'Peru', currency: 'PEN' },
]

const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  description: yup.string().optional(),
  channelId: yup.string().required('Channel is required'),
  videoType: yup.string().oneOf(['single', 'series']).required(),
  category: yup.string().optional(),
  duration: yup.number().transform((value, originalValue) => 
    originalValue === '' ? 0 : value
  ).min(0).optional(),
  releaseDate: yup.string().optional(),
  ageRating: yup.string().optional(),
  status: yup.string().oneOf(['draft', 'published', 'archived']).optional(),
  isFeatured: yup.boolean().optional(),
  isFree: yup.boolean().optional(),
  defaultPrice: yup.number().transform((value, originalValue) => 
    originalValue === '' ? 0 : value
  ).min(0).optional(),
  rentalDays: yup.number().transform((value, originalValue) => 
    originalValue === '' ? 0 : value
  ).min(0).optional(),
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
  isFree: boolean
  price: number
  isActive: boolean
}

interface ISeason {
  seasonNumber: number
  title: string
  description: string
  episodes: IEpisode[]
  isActive: boolean
}

interface VideoEditProps {
  videoId: string
}

const VideoEdit: React.FC<VideoEditProps> = ({ videoId }) => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('basic')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
  const [thumbnailUploading, setThumbnailUploading] = useState(false)
  const [posterUploading, setPosterUploading] = useState(false)

  // Form states
  const [genres, setGenres] = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [countryPricing, setCountryPricing] = useState<ICountryPricing[]>([])
  const [cast, setCast] = useState<ICast[]>([])
  const [crew, setCrew] = useState<ICrew[]>([])
  const [seasons, setSeasons] = useState<ISeason[]>([])
  const [castImageUploading, setCastImageUploading] = useState<number | null>(null)
  const [crewImageUploading, setCrewImageUploading] = useState<number | null>(null)
  const [countrySearch, setCountrySearch] = useState('')

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

  // Filtered countries for search
  const filteredCountries = COUNTRIES.filter(c => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase())
  )

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

  const isFree = watch('isFree')
  const videoType = watch('videoType')

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
        homeSection: video.homeSection || '',
      })

      // Set media URLs
      setVideoUrl(video.videoUrl || '')
      setTrailerUrl(video.trailerUrl || '')

      // Set arrays
      setGenres(video.genres || [])
      setLanguages(video.languages || [])
      setTags(video.tags || [])
      setCountryPricing(video.countryPricing || [])
      setCast(video.cast || [])
      setCrew(video.crew || [])
      setSeasons(video.seasons || [])
    }
  }, [video, reset])

  // Handler functions for genres, languages, tags
  const addGenre = (genre: string) => {
    if (genre && !genres.includes(genre)) setGenres([...genres, genre])
  }
  const removeGenre = (index: number) => setGenres(genres.filter((_, i) => i !== index))

  const addLanguage = (language: string) => {
    if (language && !languages.includes(language)) setLanguages([...languages, language])
  }
  const removeLanguage = (index: number) => setLanguages(languages.filter((_, i) => i !== index))

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) setTags([...tags, tag])
  }
  const removeTag = (index: number) => setTags(tags.filter((_, i) => i !== index))

  // Country pricing handlers
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
  const removeCountryPricing = (index: number) => setCountryPricing(countryPricing.filter((_, i) => i !== index))
  const updateCountryPricing = (index: number, field: keyof ICountryPricing, value: any) => {
    const updated = [...countryPricing]
    updated[index] = { ...updated[index], [field]: value }
    setCountryPricing(updated)
  }

  // Cast handlers with image upload
  const addCastMember = () => setCast([...cast, { name: '', role: '', image: '' }])
  const removeCastMember = (index: number) => setCast(cast.filter((_, i) => i !== index))
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

  // Crew handlers with image upload
  const addCrewMember = () => setCrew([...crew, { name: '', designation: '', image: '' }])
  const removeCrewMember = (index: number) => setCrew(crew.filter((_, i) => i !== index))
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

  // Image upload handlers with loading state
  const handleThumbnailUpload = async (file: File) => {
    setThumbnailUploading(true)
    setThumbnailFile(file)
    try {
      // Preview will be shown immediately via file
    } finally {
      setThumbnailUploading(false)
    }
  }

  const handlePosterUpload = async (file: File) => {
    setPosterUploading(true)
    setPosterFile(file)
    try {
      // Preview will be shown immediately via file
    } finally {
      setPosterUploading(false)
    }
  }

  const onSubmit = async (values: FormValues) => {
    console.log('Form submitted with values:', values)
    setIsSubmitting(true)
    
    try {
      let thumbnailUrl = video?.thumbnailUrl || ''
      let posterUrl = video?.posterUrl || ''

      // Upload new images if selected
      if (thumbnailFile) {
        setThumbnailUploading(true)
        try {
          thumbnailUrl = await uploadSingle(thumbnailFile).unwrap()
        } catch {
          thumbnailUrl = URL.createObjectURL(thumbnailFile)
        } finally {
          setThumbnailUploading(false)
        }
      }

      if (posterFile) {
        setPosterUploading(true)
        try {
          posterUrl = await uploadSingle(posterFile).unwrap()
        } catch {
          posterUrl = URL.createObjectURL(posterFile)
        } finally {
          setPosterUploading(false)
        }
      }

      const updateData: any = {
        ...values,
        genres,
        languages,
        tags,
        countryPricing,
        cast,
        crew,
        seasons: videoType === 'series' ? seasons : [],
        thumbnailUrl: thumbnailUrl || video?.thumbnailUrl,
        posterUrl: posterUrl || video?.posterUrl,
        videoUrl: videoUrl || video?.videoUrl,
        trailerUrl: trailerUrl || video?.trailerUrl,
        homeSection: values.homeSection || '',
      }

      console.log('Updating video with data:', updateData)
      await updateVideo({ id: videoId, ...updateData }).unwrap()

      setToastMessage('Video updated successfully!')
      setToastVariant('success')
      setShowToast(true)

      setTimeout(() => {
        router.push('/watch-videos/videos-list')
      }, 1500)
    } catch (error: any) {
      console.error('Update error:', error)
      setToastMessage(error?.data?.message || 'Failed to update video')
      setToastVariant('danger')
      setShowToast(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle form errors
  const onError = (errors: any) => {
    console.error('Form validation errors:', errors)
    setToastMessage('Please fill in all required fields correctly')
    setToastVariant('danger')
    setShowToast(true)
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

      <Form onSubmit={handleSubmit(onSubmit, onError)}>
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
                      <div className="mb-2 position-relative">
                        {(thumbnailFile || video.thumbnailUrl) && (
                          <img 
                            src={thumbnailFile ? URL.createObjectURL(thumbnailFile) : video.thumbnailUrl} 
                            alt="Thumbnail" 
                            className="img-thumbnail" 
                            style={{ maxHeight: 100 }} 
                          />
                        )}
                        {thumbnailUploading && (
                          <div className="position-absolute top-50 start-50 translate-middle">
                            <Spinner size="sm" />
                          </div>
                        )}
                      </div>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e: any) => handleThumbnailUpload(e.target.files?.[0])}
                        disabled={thumbnailUploading}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Poster Image</Form.Label>
                      <div className="mb-2 position-relative">
                        {(posterFile || video.posterUrl) && (
                          <img 
                            src={posterFile ? URL.createObjectURL(posterFile) : video.posterUrl} 
                            alt="Poster" 
                            className="img-thumbnail" 
                            style={{ maxHeight: 100 }} 
                          />
                        )}
                        {posterUploading && (
                          <div className="position-absolute top-50 start-50 translate-middle">
                            <Spinner size="sm" />
                          </div>
                        )}
                      </div>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e: any) => handlePosterUpload(e.target.files?.[0])}
                        disabled={posterUploading}
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
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Home Page Section</Form.Label>
                      <Form.Select {...register('homeSection')}>
                        <option value="">-- Not Featured on Home --</option>
                        <option value="trending_now">Trending Now</option>
                        <option value="most_popular">Most Popular</option>
                        <option value="exclusive_on_moviemart">Exclusive on Movie Mart</option>
                        <option value="new_release">New Release</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  {!isFree && (
                    <>
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
                      <Col md={12}>
                        <hr />
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
                            <div className="position-absolute w-100 bg-white border rounded shadow-sm" style={{ zIndex: 1000, maxHeight: 200, overflowY: 'auto' }}>
                              {filteredCountries.map(country => (
                                <div
                                  key={country.code}
                                  className="p-2 cursor-pointer hover-bg-light"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => addCountryPricing(country)}
                                >
                                  <strong>{country.name}</strong> ({country.code}) - {country.currency}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Country Pricing List */}
                        {countryPricing.map((cp, index) => (
                          <Row key={index} className="mb-2 align-items-center">
                            <Col md={3}>
                              <span className="badge bg-secondary me-2">{cp.countryCode}</span>
                              {cp.countryName}
                            </Col>
                            <Col md={2}>
                              <Form.Control value={cp.currency} disabled size="sm" />
                            </Col>
                            <Col md={3}>
                              <Form.Control
                                type="number"
                                placeholder="Price"
                                value={cp.price}
                                onChange={(e) => updateCountryPricing(index, 'price', Number(e.target.value))}
                                size="sm"
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
                            <Col md={2}>
                              <Button size="sm" variant="outline-danger" onClick={() => removeCountryPricing(index)}>
                                <FaTrash />
                              </Button>
                            </Col>
                          </Row>
                        ))}
                      </Col>
                    </>
                  )}
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
                      <Row key={index} className="mb-3 align-items-center p-2 bg-light rounded">
                        <Col md={3}>
                          <Form.Control
                            placeholder="Name"
                            value={member.name}
                            onChange={(e) => updateCastMember(index, 'name', e.target.value)}
                          />
                        </Col>
                        <Col md={3}>
                          <Form.Control
                            placeholder="Role/Character"
                            value={member.role}
                            onChange={(e) => updateCastMember(index, 'role', e.target.value)}
                          />
                        </Col>
                        <Col md={4}>
                          <div className="d-flex align-items-center gap-2">
                            {member.image && (
                              <img src={member.image} alt={member.name} className="rounded-circle" style={{ width: 40, height: 40, objectFit: 'cover' }} />
                            )}
                            <Form.Control
                              type="file"
                              accept="image/*"
                              size="sm"
                              onChange={(e: any) => e.target.files?.[0] && handleCastImageUpload(index, e.target.files[0])}
                              disabled={castImageUploading === index}
                            />
                            {castImageUploading === index && <Spinner size="sm" />}
                          </div>
                        </Col>
                        <Col md={2}>
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
                      <Row key={index} className="mb-3 align-items-center p-2 bg-light rounded">
                        <Col md={3}>
                          <Form.Control
                            placeholder="Name"
                            value={member.name}
                            onChange={(e) => updateCrewMember(index, 'name', e.target.value)}
                          />
                        </Col>
                        <Col md={3}>
                          <Form.Control
                            placeholder="Designation"
                            value={member.designation}
                            onChange={(e) => updateCrewMember(index, 'designation', e.target.value)}
                          />
                        </Col>
                        <Col md={4}>
                          <div className="d-flex align-items-center gap-2">
                            {member.image && (
                              <img src={member.image} alt={member.name} className="rounded-circle" style={{ width: 40, height: 40, objectFit: 'cover' }} />
                            )}
                            <Form.Control
                              type="file"
                              accept="image/*"
                              size="sm"
                              onChange={(e: any) => e.target.files?.[0] && handleCrewImageUpload(index, e.target.files[0])}
                              disabled={crewImageUploading === index}
                            />
                            {crewImageUploading === index && <Spinner size="sm" />}
                          </div>
                        </Col>
                        <Col md={2}>
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
                                      id={`free-switch-${sIndex}-${eIndex}`}
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
            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <Button variant="secondary" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={isUpdating || isSubmitting}>
                {(isUpdating || isSubmitting) ? (
                  <><Spinner size="sm" className="me-2" /> Saving...</>
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
