'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useGetMoviesByIdQuery, useUpdateMovieJsonMutation } from '@/store/moviesApi'
import { useGetMovieCategoriesQuery } from '@/store/movieCategory'
import { useUploadSingleMutation } from '@/store/uploadApi'

type Props = { id: string }

type FormValues = {
  title: string
  originalTitle?: string
  posterUrl: string
  backdropUrl?: string
  trailerUrl?: string
  categoryId?: string
  releaseDate: string
  status?: 'upcoming' | 'released' | 'in_production' | ''
  director?: string
  producer?: string
  productionCost?: number
  rating: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17' | 'NR' | ''
  imdbRating: number
  rottenTomatoesRating?: number
  formats?: string[]
  languages: string[]
  originalLanguage?: string
  duration: number
  genres: string[]
  uaCertification?: string
  description?: string
  galleryImages?: string[]
  budget?: number
  boxOffice?: number
  productionCompanies?: string[]
  distributors?: string[]
  tags?: string[]
  awards?: string[]
  isActive?: boolean
  productionhouse?: string
  website?: string
  address?: string
  state?: string
  country?: string
  phone?: string
  email?: string
  homeSection?: '' | 'hot_rights_available' | 'profitable_picks' | 'international_deals' | 'indie_gems'
  tradeStatus?: 'get_it_now' | 'sold_out' | 'out_of_stock' | 'coming_soon' | 'limited_offer' | 'negotiating'
}

const schema = yup.object({
  title: yup.string().required('Please enter title'),
  posterUrl: yup.string().url('Please enter a valid URL').required('Please enter poster URL'),
  trailerUrl: yup.string().url().optional(),
  categoryId: yup.string().optional(),
  releaseDate: yup.string().required('Please select release date'),
  status: yup.mixed().oneOf(['upcoming', 'released', 'in_production', '']).optional(),
  director: yup.string().optional(),
  producer: yup.string().optional(),
  productionCost: yup.number().typeError('Must be a number').min(0).optional(),
  rating: yup.mixed().oneOf(['G', 'PG', 'PG-13', 'R', 'NC-17', 'NR', '']).required('Please select rating'),
  imdbRating: yup.number().typeError('Must be a number').min(0).max(10).required('Please enter IMDB rating'),
  rottenTomatoesRating: yup.number().min(0).max(100).optional(),
  formats: yup.array(yup.string()).optional(),
  languages: yup.array(yup.string()).min(1, 'Please enter at least one language').required(),
  originalLanguage: yup.string().optional(),
  duration: yup.number().typeError('Must be a number').min(1).required('Please enter duration'),
  genres: yup.array(yup.string()).min(1, 'Please select at least one genre').required(),
  uaCertification: yup.string().optional(),
  description: yup.string().optional(),
  country: yup.string().optional(),
  backdropUrl: yup.string().url().optional(),
  galleryImages: yup.array(yup.string()).optional(),
  budget: yup.number().min(0).optional(),
  boxOffice: yup.number().min(0).optional(),
  productionCompanies: yup.array(yup.string()).optional(),
  distributors: yup.array(yup.string()).optional(),
  tags: yup.array(yup.string()).optional(),
  awards: yup.array(yup.string()).optional(),
  isActive: yup.boolean().optional(),
  homeSection: yup.string().oneOf(['', 'hot_rights_available', 'profitable_picks', 'international_deals', 'indie_gems']).optional(),
  tradeStatus: yup.string().oneOf(['get_it_now', 'sold_out', 'out_of_stock', 'coming_soon', 'limited_offer', 'negotiating']).optional(),
})

const MoviesEditForm: React.FC<Props> = ({ id }) => {
  const { data: movie, isLoading, isError } = useGetMoviesByIdQuery(id)
  const [updateMovie, { isLoading: isSaving }] = useUpdateMovieJsonMutation()
  const [uploadSingle, { isLoading: isUploading }] = useUploadSingleMutation()
  const { data: categoryData } = useGetMovieCategoriesQuery()

  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  // Simple cast/crew admin arrays
  const [cast, setCast] = useState<Array<{ name: string; type?: string; image?: string }>>([{ name: '', type: '', image: '' }])
  const [crew, setCrew] = useState<Array<{ name: string; designation?: string; image?: string }>>([{ name: '', designation: '', image: '' }])

  // Country pricing state
  const [countryPricing, setCountryPricing] = useState<Array<{
    countryCode: string;
    countryName: string;
    currency: string;
    askingPrice: number;
    negotiable: boolean;
    notes: string;
  }>>([{ countryCode: '', countryName: '', currency: '', askingPrice: 0, negotiable: true, notes: '' }])

  const addCountryPricing = () => {
    setCountryPricing((prev) => [...prev, { countryCode: '', countryName: '', currency: '', askingPrice: 0, negotiable: true, notes: '' }])
  }

  const removeCountryPricing = (index: number) => {
    setCountryPricing((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCountryPricingChange = (index: number, field: string, value: any) => {
    setCountryPricing((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  // Country options with currency
  const countryOptions = [
    { code: 'IN', name: 'India', currency: 'INR' },
    { code: 'US', name: 'United States', currency: 'USD' },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
    { code: 'AE', name: 'UAE', currency: 'AED' },
    { code: 'AU', name: 'Australia', currency: 'AUD' },
    { code: 'CA', name: 'Canada', currency: 'CAD' },
    { code: 'DE', name: 'Germany', currency: 'EUR' },
    { code: 'FR', name: 'France', currency: 'EUR' },
    { code: 'JP', name: 'Japan', currency: 'JPY' },
    { code: 'CN', name: 'China', currency: 'CNY' },
    { code: 'SG', name: 'Singapore', currency: 'SGD' },
    { code: 'MY', name: 'Malaysia', currency: 'MYR' },
    { code: 'SA', name: 'Saudi Arabia', currency: 'SAR' },
    { code: 'ZA', name: 'South Africa', currency: 'ZAR' },
    { code: 'BR', name: 'Brazil', currency: 'BRL' },
    { code: 'RU', name: 'Russia', currency: 'RUB' },
    { code: 'KR', name: 'South Korea', currency: 'KRW' },
    { code: 'NZ', name: 'New Zealand', currency: 'NZD' },
    { code: 'BD', name: 'Bangladesh', currency: 'BDT' },
    { code: 'PK', name: 'Pakistan', currency: 'PKR' },
  ]

  const addCast = () => setCast((prev) => [...prev, { name: '', type: '', image: '' }])
  const removeCast = (index: number) => setCast((prev) => prev.filter((_, i) => i !== index))
  const handleCastChange = (index: number, field: keyof (typeof cast)[number], value: any) =>
    setCast((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })

  // Watchers for previews will be set after useForm

  // Token input states for array fields
  const [companiesInput, setCompaniesInput] = useState('')
  const [distributorsInput, setDistributorsInput] = useState('')
  const [languagesInput, setLanguagesInput] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [awardsInput, setAwardsInput] = useState('')

  const addCrew = () => setCrew((prev) => [...prev, { name: '', designation: '', image: '' }])
  const removeCrew = (index: number) => setCrew((prev) => prev.filter((_, i) => i !== index))
  const handleCrewChange = (index: number, field: keyof (typeof crew)[number], value: any) =>
    setCrew((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })

  const genresOptions = useMemo(
    () =>
      [
        'action',
        'comedy',
        'drama',
        'thriller',
        'horror',
        'romance',
        'sci-fi',
        'fantasy',
        'documentary',
        'animation',
        'musical',
        'biography',
        'adventure',
        'crime',
        'family',
      ],
    [],
  )

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      title: '',
      originalTitle: '',
      posterUrl: '',
      backdropUrl: '',
      trailerUrl: '',
      categoryId: '',
      releaseDate: '',
      status: '',
      director: '',
      producer: '',
      productionCost: undefined,
      rating: '',
      imdbRating: 0,
      rottenTomatoesRating: undefined,
      formats: [],
      languages: [],
      originalLanguage: '',
      duration: 0,
      genres: [],
      uaCertification: '',
      description: '',
      galleryImages: [],
      budget: undefined,
      boxOffice: undefined,
      productionCompanies: [],
      distributors: [],
      tags: [],
      awards: [],
      isActive: true,
      productionhouse: '',
      website: '',
      address: '',
      state: '',
      country: '',
      phone: '',
      email: '',
      homeSection: '',
      tradeStatus: 'get_it_now',
    },
  })

  // Preview watchers
  const posterUrlWatch = watch('posterUrl')
  const backdropUrlWatch = watch('backdropUrl')
  const galleryImagesWatch = watch('galleryImages')

  useEffect(() => {
    if (movie) {
      reset({
        title: movie.title || '',
        originalTitle: (movie as any).originalTitle || '',
        posterUrl: movie.posterUrl || '',
        backdropUrl: (movie as any).backdropUrl || '',
        trailerUrl: movie.trailerUrl || '',
        categoryId: '',
        releaseDate: movie.releaseDate ? movie.releaseDate.substring(0, 10) : '',
        status: (movie.status as any) || '',
        director: movie.director || '',
        producer: movie.producer || '',
        productionCost: movie.productionCost ?? undefined,
        rating: (movie.rating as any) || '',
        imdbRating: Number(movie.imdbRating ?? 0),
        rottenTomatoesRating: Number((movie as any).rottenTomatoesRating ?? 0),
        formats: movie.formats || [],
        languages: movie.languages || [],
        originalLanguage: (movie as any).originalLanguage || '',
        duration: Number(movie.duration ?? 0),
        genres: (movie.genres || []).map((g) => (typeof g === 'string' ? g.toLowerCase() : g)),
        uaCertification: movie.uaCertification || '',
        description: movie.description || '',
        galleryImages: (movie as any).galleryImages || [],
        budget: (movie as any).budget ?? undefined,
        boxOffice: (movie as any).boxOffice ?? undefined,
        productionCompanies: (movie as any).productionCompanies || [],
        distributors: (movie as any).distributors || [],
        tags: (movie as any).tags || [],
        awards: (movie as any).awards || [],
        isActive: (movie as any).isActive ?? true,
        homeSection: (movie as any).homeSection || '',
        tradeStatus: (movie as any).tradeStatus || 'get_it_now',
        productionhouse: movie.company?.productionHouse || '',
        website: movie.company?.website || '',
        address: movie.company?.address || '',
        state: movie.company?.state || '',
        country: movie.country || '',
        phone: movie.company?.phone || '',
        email: movie.company?.email || '',
      })

      // Prefill simple cast/crew
      setCast(((movie as any).cast || []).map((c: any) => ({ name: c.name || '', type: c.type || '', image: c.image || '' })) || [{ name: '', type: '', image: '' }])
      setCrew(((movie as any).crew || []).map((c: any) => ({ name: c.name || '', designation: c.designation || '', image: c.image || '' })) || [
        { name: '', designation: '', image: '' },
      ])
      
      // Prefill country pricing
      const existingPricing = (movie as any).countryPricing || []
      if (existingPricing.length > 0) {
        setCountryPricing(existingPricing.map((p: any) => ({
          countryCode: p.countryCode || '',
          countryName: p.countryName || '',
          currency: p.currency || '',
          askingPrice: p.askingPrice || 0,
          negotiable: p.negotiable ?? true,
          notes: p.notes || '',
        })))
      }
    }
  }, [movie, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      const payload: any = {
        title: values.title,
        originalTitle: values.originalTitle,
        releaseDate: values.releaseDate,
        duration: Number(values.duration),
        genres: values.genres,
        languages: values.languages,
        originalLanguage: values.originalLanguage,
        rating: values.rating,
        imdbRating: Number(values.imdbRating),
        rottenTomatoesRating: values.rottenTomatoesRating,
        trailerUrl: values.trailerUrl,
        description: values.description,
        status: values.status,
        posterUrl: values.posterUrl,
        backdropUrl: values.backdropUrl,
        galleryImages: values.galleryImages,
        budget: values.budget,
        boxOffice: values.boxOffice,
        productionCompanies: values.productionCompanies,
        distributors: values.distributors,
        tags: values.tags,
        awards: values.awards,
        isActive: values.isActive,
        director: values.director,
        producer: values.producer,
        productionCost: values.productionCost,
        uaCertification: values.uaCertification,
        country: values.country,
        // Company fields (backend will map to company object)
        productionhouse: values.productionhouse,
        website: values.website,
        address: values.address,
        state: values.state,
        phone: values.phone,
        email: values.email,
      }
      if (values.formats && values.formats.length) {
        payload.formats = values.formats
      }
      // Include simple cast/crew arrays
      payload.cast = cast.map((c) => ({ name: c.name, type: c.type, image: c.image }))
      payload.crew = crew.map((c) => ({ name: c.name, designation: c.designation, image: c.image }))
      payload.homeSection = values.homeSection || ''
      payload.tradeStatus = values.tradeStatus || 'get_it_now'
      // Include country pricing
      payload.countryPricing = countryPricing.filter((p) => p.countryCode).map((p) => ({
        countryCode: p.countryCode,
        countryName: p.countryName,
        currency: p.currency,
        askingPrice: Number(p.askingPrice) || 0,
        negotiable: p.negotiable ?? true,
        notes: p.notes || '',
      }))
      await updateMovie({ id, data: payload }).unwrap()
      setToastMessage('Movie updated successfully!')
      setToastVariant('success')
      setShowToast(true)
    } catch (err: any) {
      console.error(err)
      setToastMessage(err?.data?.message || 'Failed to update movie')
      setToastVariant('error')
      setShowToast(true)
    }
  }

  if (isLoading) {
    return (
      <div className="d-flex align-items-center gap-2 text-muted">
        <Spinner size="sm" animation="border" /> Loading movie...
      </div>
    )
  }

  if (isError || !movie) {
    return <div className="text-danger">Failed to load movie</div>
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>Edit Movie</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Row>
              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Movie Name</label>
                  <Controller
                    control={control}
                    name="title"
                    render={({ field }) => <input {...field} type="text" className="form-control" placeholder="Enter Title" />}
                  />
                  {errors.title && <p className="text-danger">{errors.title.message}</p>}
                </div>
              </Col>

              {/* Original Title */}
              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Original Title</label>
                  <Controller control={control} name="originalTitle" render={({ field }) => <input {...field} type="text" className="form-control" placeholder="Enter Original Title" />} />
                </div>
              </Col>

              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Poster URL</label>
                  <Controller
                    control={control}
                    name="posterUrl"
                    render={({ field }) => <input {...field} type="url" className="form-control" placeholder="https://example.com/poster.jpg" />}
                  />
                  {errors.posterUrl && <p className="text-danger">{errors.posterUrl.message}</p>}
                  <div className="mt-2">
                    <label className="form-label">Or upload from your device</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        try {
                          const url = await uploadSingle(file).unwrap()
                          setValue('posterUrl', url, { shouldValidate: true })
                        } catch (err) {
                          console.error('Poster upload failed:', err)
                        } finally {
                          e.currentTarget.value = ''
                        }
                      }}
                      disabled={isUploading}
                    />
                    {isUploading && (
                      <div className="d-flex align-items-center gap-2 mt-2 text-muted">
                        <Spinner size="sm" animation="border" />
                        <span>Uploading...</span>
                      </div>
                    )}
                  </div>
                  {posterUrlWatch ? (
                    <div className="mt-2">
                      <img src={posterUrlWatch} alt="Poster Preview" className="img-thumbnail" style={{ maxHeight: 150 }} />
                    </div>
                  ) : null}
                </div>
              </Col>

              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Trailer URL</label>
                  <Controller
                    control={control}
                    name="trailerUrl"
                    render={({ field }) => (
                      <input {...field} type="url" className="form-control" placeholder='e.g. "https://www.youtube.com' />
                    )}
                  />
                </div>
              </Col>

              {/* Backdrop URL */}
              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Backdrop URL</label>
                  <Controller control={control} name="backdropUrl" render={({ field }) => <input {...field} type="url" className="form-control" placeholder="https://example.com/backdrop.jpg" />} />
                  <div className="mt-2">
                    <label className="form-label">Or upload from your device</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        try {
                          const url = await uploadSingle(file).unwrap()
                          setValue('backdropUrl', url, { shouldValidate: true })
                        } catch (err) {
                          console.error('Backdrop upload failed:', err)
                        } finally {
                          e.currentTarget.value = ''
                        }
                      }}
                      disabled={isUploading}
                    />
                    {isUploading && (
                      <div className="d-flex align-items-center gap-2 mt-2 text-muted">
                        <Spinner size="sm" animation="border" />
                        <span>Uploading...</span>
                      </div>
                    )}
                  </div>
                  {backdropUrlWatch ? (
                    <div className="mt-2">
                      <img src={backdropUrlWatch} alt="Backdrop Preview" className="img-thumbnail" style={{ maxHeight: 150 }} />
                    </div>
                  ) : null}
                </div>
              </Col>

              {/* Gallery Images */}
              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Gallery Images</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="form-control"
                    onChange={async (e) => {
                      const files = e.target.files
                      if (!files || files.length === 0) return
                      const urls: string[] = []
                      for (let i = 0; i < files.length; i++) {
                        try {
                          const url = await uploadSingle(files[i]).unwrap()
                          urls.push(url)
                        } catch (err) {
                          console.error('Gallery upload failed for', files[i].name, err)
                        }
                      }
                      if (urls.length > 0) setValue('galleryImages', urls, { shouldValidate: true })
                      e.currentTarget.value = ''
                    }}
                    disabled={isUploading}
                  />
                  {isUploading && (
                    <div className="d-flex align-items-center gap-2 mt-2 text-muted">
                      <Spinner size="sm" animation="border" />
                      <span>Uploading...</span>
                    </div>
                  )}
                  {Array.isArray(galleryImagesWatch) && galleryImagesWatch.length > 0 ? (
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {galleryImagesWatch.map((url: string, i: number) => (
                        <img key={i} src={url} alt={`Gallery ${i + 1}`} className="img-thumbnail" style={{ maxHeight: 100 }} />
                      ))}
                    </div>
                  ) : null}
                </div>
              </Col>

              {/* Category */}
              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Category</label>
                  <Controller
                    control={control}
                    name="categoryId"
                    render={({ field }) => (
                      <select {...field} className="form-control form-select">
                        <option value="">Select Category</option>
                        {categoryData?.map((category: any) => (
                          <option key={category._id} value={category._id}>
                            {category.title}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </div>
              </Col>

              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Release Date</label>
                  <Controller control={control} name="releaseDate" render={({ field }) => <input {...field} type="date" className="form-control" />} />
                </div>
              </Col>

              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <select {...field} className="form-control form-select">
                        <option value="">Select Status</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="released">Released</option>
                        <option value="in_production">In Production</option>
                      </select>
                    )}
                  />
                </div>
              </Col>

              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Director</label>
                  <Controller control={control} name="director" render={({ field }) => <input {...field} type="text" className="form-control" />} />
                </div>
              </Col>

              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Producer</label>
                  <Controller control={control} name="producer" render={({ field }) => <input {...field} type="text" className="form-control" />} />
                </div>
              </Col>

              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Production Cost</label>
                  <Controller control={control} name="productionCost" render={({ field }) => <input {...field} type="number" className="form-control" />} />
                </div>
              </Col>

              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Content Rating</label>
                  <Controller
                    control={control}
                    name="rating"
                    render={({ field }) => (
                      <select {...field} className="form-control form-select">
                        <option value="">Select Rating</option>
                        <option value="G">G</option>
                        <option value="PG">PG</option>
                        <option value="PG-13">PG-13</option>
                        <option value="R">R</option>
                        <option value="NC-17">NC-17</option>
                        <option value="NR">NR</option>
                      </select>
                    )}
                  />
                  {errors.rating && <p className="text-danger">{errors.rating.message}</p>}
                </div>
              </Col>

              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">IMDB Rating</label>
                  <Controller control={control} name="imdbRating" render={({ field }) => <input {...field} type="number" step="0.1" min={0} max={10} className="form-control" />} />
                </div>
              </Col>

              {/* Rotten Tomatoes Rating */}
              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Rotten Tomatoes Rating</label>
                  <Controller control={control} name="rottenTomatoesRating" render={({ field }) => <input {...field} type="number" min={0} max={100} className="form-control" />} />
                </div>
              </Col>

              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Formats</label>
                  <Controller
                    control={control}
                    name="formats"
                    render={({ field }) => {
                      const formatOptions = [
                        { value: '2D', label: '2D' },
                        { value: '3D', label: '3D' },
                        { value: 'IMAX', label: 'IMAX' },
                        { value: 'IMAX 3D', label: 'IMAX 3D' },
                        { value: '4DX', label: '4DX' },
                        { value: 'Dolby Atmos', label: 'Dolby Atmos' },
                        { value: 'Dolby Cinema', label: 'Dolby Cinema' },
                        { value: 'ScreenX', label: 'ScreenX' },
                        { value: 'D-BOX', label: 'D-BOX' },
                        { value: 'HDR', label: 'HDR' },
                      ]
                      const toggleFormat = (val: string) => {
                        const current = field.value || []
                        if (current.includes(val)) {
                          field.onChange(current.filter((v: string) => v !== val))
                        } else {
                          field.onChange([...current, val])
                        }
                      }
                      return (
                        <div className="d-flex flex-wrap gap-2 p-3 border rounded bg-light">
                          {formatOptions.map((opt) => (
                            <div
                              key={opt.value}
                              onClick={() => toggleFormat(opt.value)}
                              className={`px-3 py-2 rounded-pill border cursor-pointer ${
                                (field.value || []).includes(opt.value)
                                  ? 'bg-primary text-white border-primary'
                                  : 'bg-white text-dark border-secondary'
                              }`}
                              style={{ cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
                            >
                              {opt.label}
                            </div>
                          ))}
                        </div>
                      )
                    }}
                  />
                </div>
              </Col>

              {/* Languages (token input) */}
              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Languages</label>
                  <Controller
                    control={control}
                    name="languages"
                    render={({ field }) => (
                      <>
                        <div className="d-flex gap-2 flex-wrap mb-2">
                          {(field.value || []).map((val: string, idx: number) => (
                            <span key={idx} className="badge bg-secondary">
                              {val}
                              <button
                                type="button"
                                className="btn-close btn-close-white btn-sm ms-2"
                                aria-label="Remove"
                                onClick={() => field.onChange((field.value || []).filter((_: string, i: number) => i !== idx))}
                              />
                            </span>
                          ))}
                        </div>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            value={languagesInput}
                            onChange={(e) => setLanguagesInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                const v = languagesInput.trim()
                                if (v) field.onChange([...(field.value || []), v])
                                setLanguagesInput('')
                              }
                            }}
                            placeholder="Type a language and press Enter"
                          />
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => {
                              const v = languagesInput.trim()
                              if (v) field.onChange([...(field.value || []), v])
                              setLanguagesInput('')
                            }}
                          >
                            Add
                          </button>
                        </div>
                      </>
                    )}
                  />
                </div>
              </Col>

              {/* Original Language */}
              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Original Language</label>
                  <Controller control={control} name="originalLanguage" render={({ field }) => <input {...field} type="text" className="form-control" placeholder="e.g. English" />} />
                </div>
              </Col>

              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Duration (minutes)</label>
                  <Controller
                    control={control}
                    name="duration"
                    render={({ field }) => <input {...field} type="number" className="form-control" placeholder="e.g. 120" />}
                  />
                </div>
              </Col>

              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Genres</label>
                  <Controller
                    control={control}
                    name="genres"
                    render={({ field }) => {
                      const genreOptions = [
                        'Action', 'Comedy', 'Drama', 'Thriller', 'Horror', 'Romance',
                        'Sci-Fi', 'Fantasy', 'Documentary', 'Animation', 'Musical',
                        'Biography', 'Adventure', 'Crime', 'Family'
                      ]
                      const toggleGenre = (val: string) => {
                        const lowerVal = val.toLowerCase()
                        const current = field.value || []
                        if (current.includes(lowerVal)) {
                          field.onChange(current.filter((v: string) => v !== lowerVal))
                        } else {
                          field.onChange([...current, lowerVal])
                        }
                      }
                      return (
                        <div className="d-flex flex-wrap gap-2 p-3 border rounded bg-light">
                          {genreOptions.map((genre) => (
                            <div
                              key={genre}
                              onClick={() => toggleGenre(genre)}
                              className={`px-3 py-2 rounded-pill border ${
                                (field.value || []).includes(genre.toLowerCase())
                                  ? 'bg-success text-white border-success'
                                  : 'bg-white text-dark border-secondary'
                              }`}
                              style={{ cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
                            >
                              {genre}
                            </div>
                          ))}
                        </div>
                      )
                    }}
                  />
                  {errors.genres && <p className="text-danger">{errors.genres.message}</p>}
                </div>
              </Col>

              {/* Production Companies (token input) */}
              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Production Companies</label>
                  <Controller
                    control={control}
                    name="productionCompanies"
                    render={({ field }) => (
                      <>
                        <div className="d-flex gap-2 flex-wrap mb-2">
                          {(field.value || []).map((val: string, idx: number) => (
                            <span key={idx} className="badge bg-secondary">
                              {val}
                              <button
                                type="button"
                                className="btn-close btn-close-white btn-sm ms-2"
                                aria-label="Remove"
                                onClick={() => field.onChange((field.value || []).filter((_: string, i: number) => i !== idx))}
                              />
                            </span>
                          ))}
                        </div>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            value={companiesInput}
                            onChange={(e) => setCompaniesInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                const v = companiesInput.trim()
                                if (v) field.onChange([...(field.value || []), v])
                                setCompaniesInput('')
                              }
                            }}
                            placeholder="Type and press Enter"
                          />
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => {
                              const v = companiesInput.trim()
                              if (v) field.onChange([...(field.value || []), v])
                              setCompaniesInput('')
                            }}
                          >
                            Add
                          </button>
                        </div>
                      </>
                    )}
                  />
                </div>
              </Col>

              {/* Distributors (token input) */}
              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Distributors</label>
                  <Controller
                    control={control}
                    name="distributors"
                    render={({ field }) => (
                      <>
                        <div className="d-flex gap-2 flex-wrap mb-2">
                          {(field.value || []).map((val: string, idx: number) => (
                            <span key={idx} className="badge bg-secondary">
                              {val}
                              <button
                                type="button"
                                className="btn-close btn-close-white btn-sm ms-2"
                                aria-label="Remove"
                                onClick={() => field.onChange((field.value || []).filter((_: string, i: number) => i !== idx))}
                              />
                            </span>
                          ))}
                        </div>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            value={distributorsInput}
                            onChange={(e) => setDistributorsInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                const v = distributorsInput.trim()
                                if (v) field.onChange([...(field.value || []), v])
                                setDistributorsInput('')
                              }
                            }}
                            placeholder="Type and press Enter"
                          />
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => {
                              const v = distributorsInput.trim()
                              if (v) field.onChange([...(field.value || []), v])
                              setDistributorsInput('')
                            }}
                          >
                            Add
                          </button>
                        </div>
                      </>
                    )}
                  />
                </div>
              </Col>

              {/* Budget */}
              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Budget</label>
                  <Controller control={control} name="budget" render={({ field }) => <input {...field} type="number" className="form-control" placeholder="Enter budget" />} />
                </div>
              </Col>

              {/* Box Office */}
              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Box Office</label>
                  <Controller control={control} name="boxOffice" render={({ field }) => <input {...field} type="number" className="form-control" placeholder="Enter box office" />} />
                </div>
              </Col>

              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">UA Certification</label>
                  <Controller control={control} name="uaCertification" render={({ field }) => <input {...field} type="text" className="form-control" />} />
                </div>
              </Col>

              <Col lg={12}>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <Controller control={control} name="description" render={({ field }) => <textarea {...field} className="form-control" rows={3} />} />
                </div>
              </Col>

              {/* Tags (token input) */}
              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Tags</label>
                  <Controller
                    control={control}
                    name="tags"
                    render={({ field }) => (
                      <>
                        <div className="d-flex gap-2 flex-wrap mb-2">
                          {(field.value || []).map((val: string, idx: number) => (
                            <span key={idx} className="badge bg-secondary">
                              {val}
                              <button
                                type="button"
                                className="btn-close btn-close-white btn-sm ms-2"
                                aria-label="Remove"
                                onClick={() => field.onChange((field.value || []).filter((_: string, i: number) => i !== idx))}
                              />
                            </span>
                          ))}
                        </div>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                const v = tagsInput.trim()
                                if (v) field.onChange([...(field.value || []), v])
                                setTagsInput('')
                              }
                            }}
                            placeholder="Type and press Enter"
                          />
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => {
                              const v = tagsInput.trim()
                              if (v) field.onChange([...(field.value || []), v])
                              setTagsInput('')
                            }}
                          >
                            Add
                          </button>
                        </div>
                      </>
                    )}
                  />
                </div>
              </Col>

              {/* Awards (token input) */}
              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Awards</label>
                  <Controller
                    control={control}
                    name="awards"
                    render={({ field }) => (
                      <>
                        <div className="d-flex gap-2 flex-wrap mb-2">
                          {(field.value || []).map((val: string, idx: number) => (
                            <span key={idx} className="badge bg-secondary">
                              {val}
                              <button
                                type="button"
                                className="btn-close btn-close-white btn-sm ms-2"
                                aria-label="Remove"
                                onClick={() => field.onChange((field.value || []).filter((_: string, i: number) => i !== idx))}
                              />
                            </span>
                          ))}
                        </div>
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            value={awardsInput}
                            onChange={(e) => setAwardsInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                const v = awardsInput.trim()
                                if (v) field.onChange([...(field.value || []), v])
                                setAwardsInput('')
                              }
                            }}
                            placeholder="Type and press Enter"
                          />
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => {
                              const v = awardsInput.trim()
                              if (v) field.onChange([...(field.value || []), v])
                              setAwardsInput('')
                            }}
                          >
                            Add
                          </button>
                        </div>
                      </>
                    )}
                  />
                </div>
              </Col>

              {/* Is Active */}
              <Col lg={6}>
                <div className="mb-3">
                  <Controller
                    control={control}
                    name="isActive"
                    render={({ field }) => (
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={!!field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          name={field.name}
                          ref={field.ref}
                        />
                        <label className="form-check-label">Is Active</label>
                      </div>
                    )}
                  />
                </div>
              </Col>

              {/* Home Section */}
              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Home Page Section</label>
                  <Controller
                    control={control}
                    name="homeSection"
                    render={({ field }) => (
                      <select {...field} className="form-control form-select">
                        <option value="">-- Not Featured on Home --</option>
                        <option value="hot_rights_available">Hot Rights Available</option>
                        <option value="profitable_picks">Profitable Picks</option>
                        <option value="international_deals">International Deals</option>
                        <option value="indie_gems">Indie Gems</option>
                      </select>
                    )}
                  />
                  <small className="text-muted">Select a section to feature this movie on the home page</small>
                </div>
              </Col>

              {/* Trade Status */}
              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Trade Status</label>
                  <Controller
                    control={control}
                    name="tradeStatus"
                    render={({ field }) => (
                      <select {...field} className="form-control form-select">
                        <option value="get_it_now">🟢 Get It Now</option>
                        <option value="sold_out">🔴 Sold Out</option>
                        <option value="out_of_stock">⚫ Out of Stock</option>
                        <option value="coming_soon">🟡 Coming Soon</option>
                        <option value="limited_offer">🟠 Limited Offer</option>
                        <option value="negotiating">🔵 Negotiating</option>
                      </select>
                    )}
                  />
                  <small className="text-muted">Status badge shown on Film Trade cards</small>
                </div>
              </Col>
            </Row>

            {/* Cast Section */}
            <Card className="mt-4 border">
              <CardHeader className="d-flex justify-content-between align-items-center bg-light">
                <CardTitle as="h5" className="mb-0">
                  <span className="me-2">🎭</span> Cast Details
                </CardTitle>
                <button type="button" className="btn btn-sm btn-primary d-flex align-items-center gap-1" onClick={addCast}>
                  <span>+</span> Add Cast
                </button>
              </CardHeader>
              <CardBody>
                <Row className="g-3">
                  {cast.map((member, index) => (
                    <Col lg={6} key={`cast-${index}`}>
                      <div className="p-3 border rounded bg-light position-relative">
                        {cast.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger position-absolute"
                            style={{ top: 8, right: 8 }}
                            onClick={() => removeCast(index)}
                          >
                            ✕
                          </button>
                        )}
                        <div className="d-flex gap-3">
                          <div className="text-center" style={{ width: 100 }}>
                            {member.image ? (
                              <img src={member.image} alt="Cast" className="rounded-circle border" style={{ width: 80, height: 80, objectFit: 'cover' }} />
                            ) : (
                              <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mx-auto" style={{ width: 80, height: 80 }}>
                                <span className="text-white fs-4">👤</span>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="form-control form-control-sm mt-2"
                              onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                try {
                                  const url = await uploadSingle(file).unwrap()
                                  handleCastChange(index, 'image', url)
                                } catch (err) {
                                  console.error('Cast image upload failed:', err)
                                } finally {
                                  e.currentTarget.value = ''
                                }
                              }}
                              disabled={isUploading}
                            />
                          </div>
                          <div className="flex-grow-1">
                            <div className="mb-2">
                              <label className="form-label small mb-1">Name</label>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={member.name}
                                onChange={(e) => handleCastChange(index, 'name', e.target.value)}
                                placeholder="Enter name"
                              />
                            </div>
                            <div>
                              <label className="form-label small mb-1">Role / Type</label>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={member.type || ''}
                                onChange={(e) => handleCastChange(index, 'type', e.target.value)}
                                placeholder="e.g. Lead Actor"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </CardBody>
            </Card>

            {/* Crew Section */}
            <Card className="mt-4 border">
              <CardHeader className="d-flex justify-content-between align-items-center bg-light">
                <CardTitle as="h5" className="mb-0">
                  <span className="me-2">🎬</span> Crew Details
                </CardTitle>
                <button type="button" className="btn btn-sm btn-primary d-flex align-items-center gap-1" onClick={addCrew}>
                  <span>+</span> Add Crew
                </button>
              </CardHeader>
              <CardBody>
                <Row className="g-3">
                  {crew.map((member, index) => (
                    <Col lg={6} key={`crew-${index}`}>
                      <div className="p-3 border rounded bg-light position-relative">
                        {crew.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger position-absolute"
                            style={{ top: 8, right: 8 }}
                            onClick={() => removeCrew(index)}
                          >
                            ✕
                          </button>
                        )}
                        <div className="d-flex gap-3">
                          <div className="text-center" style={{ width: 100 }}>
                            {member.image ? (
                              <img src={member.image} alt="Crew" className="rounded-circle border" style={{ width: 80, height: 80, objectFit: 'cover' }} />
                            ) : (
                              <div className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mx-auto" style={{ width: 80, height: 80 }}>
                                <span className="text-white fs-4">👤</span>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="form-control form-control-sm mt-2"
                              onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                try {
                                  const url = await uploadSingle(file).unwrap()
                                  handleCrewChange(index, 'image', url)
                                } catch (err) {
                                  console.error('Crew image upload failed:', err)
                                } finally {
                                  e.currentTarget.value = ''
                                }
                              }}
                              disabled={isUploading}
                            />
                          </div>
                          <div className="flex-grow-1">
                            <div className="mb-2">
                              <label className="form-label small mb-1">Name</label>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={member.name}
                                onChange={(e) => handleCrewChange(index, 'name', e.target.value)}
                                placeholder="Enter name"
                              />
                            </div>
                            <div>
                              <label className="form-label small mb-1">Designation</label>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                value={member.designation || ''}
                                onChange={(e) => handleCrewChange(index, 'designation', e.target.value)}
                                placeholder="e.g. Director, Producer"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </CardBody>
            </Card>

            {/* Country-wise Asking Price Section */}
            <Card className="mt-4 border">
              <CardHeader className="d-flex justify-content-between align-items-center bg-light">
                <CardTitle as="h5" className="mb-0">
                  <span className="me-2">💰</span> Country-wise Asking Price
                </CardTitle>
                <button type="button" className="btn btn-sm btn-primary d-flex align-items-center gap-1" onClick={addCountryPricing}>
                  <span>+</span> Add Country
                </button>
              </CardHeader>
              <CardBody>
                <p className="text-muted mb-3">Set different asking prices for film rights in different countries</p>
                {countryPricing.map((pricing, index) => (
                  <Row key={`pricing-${index}`} className="align-items-end mb-3 p-3 bg-light rounded position-relative">
                    {countryPricing.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger position-absolute"
                        style={{ top: 8, right: 8, width: 30 }}
                        onClick={() => removeCountryPricing(index)}
                      >
                        ✕
                      </button>
                    )}
                    <Col lg={3} md={6}>
                      <label className="form-label">Country</label>
                      <select
                        className="form-select"
                        value={pricing.countryCode}
                        onChange={(e) => {
                          const selected = countryOptions.find(c => c.code === e.target.value)
                          if (selected) {
                            handleCountryPricingChange(index, 'countryCode', selected.code)
                            handleCountryPricingChange(index, 'countryName', selected.name)
                            handleCountryPricingChange(index, 'currency', selected.currency)
                          }
                        }}
                      >
                        <option value="">Select Country</option>
                        {countryOptions.map((country) => (
                          <option key={country.code} value={country.code}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </Col>
                    <Col lg={2} md={3}>
                      <label className="form-label">Currency</label>
                      <input
                        type="text"
                        className="form-control"
                        value={pricing.currency}
                        readOnly
                        placeholder="Auto"
                      />
                    </Col>
                    <Col lg={2} md={3}>
                      <label className="form-label">Asking Price</label>
                      <input
                        type="number"
                        className="form-control"
                        value={pricing.askingPrice}
                        onChange={(e) => handleCountryPricingChange(index, 'askingPrice', Number(e.target.value))}
                        placeholder="0"
                        min="0"
                      />
                    </Col>
                    <Col lg={2} md={3}>
                      <label className="form-label">Negotiable</label>
                      <div className="form-check mt-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={pricing.negotiable}
                          onChange={(e) => handleCountryPricingChange(index, 'negotiable', e.target.checked)}
                        />
                        <label className="form-check-label">Yes</label>
                      </div>
                    </Col>
                    <Col lg={3} md={6}>
                      <label className="form-label">Notes</label>
                      <input
                        type="text"
                        className="form-control"
                        value={pricing.notes}
                        onChange={(e) => handleCountryPricingChange(index, 'notes', e.target.value)}
                        placeholder="Optional notes"
                      />
                    </Col>
                  </Row>
                ))}
              </CardBody>
            </Card>

            {/* Company Details Section */}
            <Card className="mt-4 border">
              <CardHeader className="bg-light">
                <CardTitle as="h5" className="mb-0">
                  <span className="me-2">🏢</span> Company Details
                </CardTitle>
              </CardHeader>
              <CardBody>
                <Row>
                  <Col lg={6}>
                    <div className="mb-3">
                      <label className="form-label">Production House</label>
                      <Controller
                        control={control}
                        name="productionhouse"
                        render={({ field }) => <input {...field} type="text" className="form-control" placeholder="Enter production house" />}
                      />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="mb-3">
                      <label className="form-label">Website (optional)</label>
                      <Controller control={control} name="website" render={({ field }) => <input {...field} type="url" className="form-control" placeholder="https://example.com" />} />
                    </div>
                  </Col>
                  <Col lg={12}>
                    <div className="mb-3">
                      <label className="form-label">Address</label>
                      <Controller control={control} name="address" render={({ field }) => <input {...field} type="text" className="form-control" placeholder="Enter address" />} />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="mb-3">
                      <label className="form-label">State</label>
                      <Controller control={control} name="state" render={({ field }) => <input {...field} type="text" className="form-control" placeholder="Enter state" />} />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="mb-3">
                      <label className="form-label">Country</label>
                      <Controller
                        control={control}
                        name="country"
                        render={({ field }) => (
                          <select {...field} className="form-select">
                            <option value="">Select Country</option>
                            <option value="India">India</option>
                            <option value="USA">USA</option>
                            <option value="UK">UK</option>
                          </select>
                        )}
                      />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="mb-3">
                      <label className="form-label">Phone Number</label>
                      <Controller control={control} name="phone" render={({ field }) => <input {...field} type="text" className="form-control" placeholder="Enter phone number" />} />
                    </div>
                  </Col>
                  <Col lg={6}>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <Controller control={control} name="email" render={({ field }) => <input {...field} type="email" className="form-control" placeholder="Enter email" />} />
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>

            {/* Submit Button - Fixed at Bottom */}
            <div className="sticky-bottom bg-white border-top p-3 mt-4" style={{ marginLeft: -16, marginRight: -16, marginBottom: -16 }}>
              <Row className="justify-content-end g-2">
                <Col lg={3} md={4} sm={6}>
                  <Button type="submit" className="w-100 py-2" variant="success" size="lg" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Spinner size="sm" animation="border" className="me-2" />
                        Saving...
                      </>
                    ) : (
                      <>✓ Update Movie</>
                    )}
                  </Button>
                </Col>
              </Row>
            </div>
          </form>
        </CardBody>
      </Card>

      <ToastContainer className="p-3" position="top-end" style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default MoviesEditForm
