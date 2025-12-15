'use client'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect, useState } from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Toast, ToastContainer, Spinner } from 'react-bootstrap'
import { Control, Controller, UseFormSetValue, useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useCreateMovieMutation } from '@/store/moviesApi'
import { useGetMovieCategoriesQuery } from '@/store/movieCategory'
import { useUploadSingleMutation } from '@/store/uploadApi'

type GeneralInformationCardProps = {
  control: Control<any>
  setImage: React.Dispatch<React.SetStateAction<File | null>>
  errors: any
  setValue: UseFormSetValue<any>
}

const GeneralInformationCard = ({ control, setImage, errors, setValue }: GeneralInformationCardProps) => {
  // cast
  const [cast, setcast] = useState([{ name: '', type: '', image: null }])
  const [uploadSingle, { isLoading: isPosterUploading }] = useUploadSingleMutation()

  const addCast = () => {
    setcast([...cast, { name: '', type: '', image: null }])
  }

  // token input local states
  const [languagesInput, setLanguagesInput] = useState('')
  const [companiesInput, setCompaniesInput] = useState('')
  const [distributorsInput, setDistributorsInput] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [awardsInput, setAwardsInput] = useState('')

  const handleChange = (index: number, field: keyof (typeof cast)[number], value: any) => {
    setcast((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  // crew state
  const [crew, setCrew] = useState([{ name: '', designation: '', image: null }])

  // add crew
  const addCrew = () => {
    setCrew((prev) => [...prev, { name: '', designation: '', image: null }])
  }

  // Country pricing state
  const [countryPricing, setCountryPricing] = useState([
    { countryCode: '', countryName: '', currency: '', askingPrice: 0, negotiable: true, notes: '' }
  ])

  const addCountryPricing = () => {
    setCountryPricing((prev) => [...prev, { countryCode: '', countryName: '', currency: '', askingPrice: 0, negotiable: true, notes: '' }])
  }

  const handleCountryPricingChange = (index: number, field: string, value: any) => {
    setCountryPricing((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const removeCountryPricing = (index: number) => {
    setCountryPricing((prev) => prev.filter((_, i) => i !== index))
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

  // handle crew change
  const handleChangeCrew = (index: number, field: keyof (typeof crew)[number], value: any) => {
    setCrew((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  useEffect(() => {
    // Expose cast, crew, and countryPricing to parent form values
    setValue('cast', cast)
    setValue('crew', crew)
    setValue('countryPricing', countryPricing)
  }, [cast, crew, countryPricing, setValue])

  const { data: categoryData, isLoading, isError } = useGetMovieCategoriesQuery()
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>Add Movies</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            {/* Title */}
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Movie Name</label>
                <Controller
                  control={control}
                  name="title"
                  render={({ field }) => <input {...field} type="text" className="form-control" placeholder="Enter Title" />}
                />
                {errors?.title && <p className="text-danger">{errors.title.message}</p>}
              </div>
            </Col>

            {/* Original Title */}
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Original Title</label>
                <Controller
                  control={control}
                  name="originalTitle"
                  render={({ field }) => <input {...field} type="text" className="form-control" placeholder="Enter Original Title" />}
                />
              </div>
            </Col>

            {/* Poster URL */}
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Poster URL</label>
                <Controller
                  control={control}
                  name="posterUrl"
                  render={({ field }) => <input {...field} type="url" className="form-control" placeholder="https://example.com/poster.jpg" />}
                />
                {errors?.posterUrl && <p className="text-danger">{errors.posterUrl.message}</p>}
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
                    disabled={isPosterUploading}
                  />
                  {isPosterUploading && (
                    <div className="d-flex align-items-center gap-2 mt-2 text-muted">
                      <Spinner size="sm" animation="border" />
                      <span>Uploading...</span>
                    </div>
                  )}
                </div>
              </div>
            </Col>

            {/* Backdrop URL */}
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Backdrop URL</label>
                <Controller
                  control={control}
                  name="backdropUrl"
                  render={({ field }) => <input {...field} type="url" className="form-control" placeholder="https://example.com/backdrop.jpg" />}
                />
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
                    disabled={isPosterUploading}
                  />
                  {isPosterUploading && (
                    <div className="d-flex align-items-center gap-2 mt-2 text-muted">
                      <Spinner size="sm" animation="border" />
                      <span>Uploading...</span>
                    </div>
                  )}
                </div>
              </div>
            </Col>

            {/* Trailer */}
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Trailer URL</label>
                <Controller
                  control={control}
                  name="trailerUrl"
                  render={({ field }) => <input {...field} type="url" className="form-control" placeholder='e.g. "https://www.youtube.com' />}
                />
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
                    if (urls.length > 0) {
                      setValue('galleryImages', urls, { shouldValidate: true })
                    }
                    e.currentTarget.value = ''
                  }}
                  disabled={isPosterUploading}
                />
                {isPosterUploading && (
                  <div className="d-flex align-items-center gap-2 mt-2 text-muted">
                    <Spinner size="sm" animation="border" />
                    <span>Uploading...</span>
                  </div>
                )}
              </div>
            </Col>

            {/* relase category */}
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Category</label>
                <Controller
                  control={control}
                  name="categoryId" // ✅ use a proper field name
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

            {/* Rotten Tomatoes Rating */}
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Rotten Tomatoes Rating</label>
                <Controller
                  control={control}
                  name="rottenTomatoesRating"
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      step="1"
                      min={0}
                      max={100}
                      className="form-control"
                    />
                  )}
                />
              </div>
            </Col>

            {/* Release Date */}
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Release Date</label>
                <Controller control={control} name="releaseDate" render={({ field }) => <input {...field} type="date" className="form-control" />} />
              </div>
            </Col>

            {/* Status (optional) */}
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

            {/* director */}
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Director</label>
                <Controller
                  control={control}
                  name="director"
                  render={({ field }) => <input {...field} type="text" className="form-control" placeholder="Enter Director" />}
                />
              </div>
            </Col>

            {/* producer */}
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Producer</label>
                <Controller
                  control={control}
                  name="producer"
                  render={({ field }) => <input {...field} type="text" className="form-control" placeholder="Enter Producer" />}
                />
              </div>
            </Col>

            {/* production cost */}
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Production Cost</label>
                <Controller
                  control={control}
                  name="productionCost"
                  render={({ field }) => <input {...field} type="number" className="form-control" placeholder="Enter Production Cost" />}
                />
              </div>
            </Col>

            {/* Budget */}
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Budget</label>
                <Controller
                  control={control}
                  name="budget"
                  render={({ field }) => <input {...field} type="number" className="form-control" placeholder="Enter budget" />}
                />
              </div>
            </Col>

            {/* Box Office */}
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Box Office</label>
                <Controller
                  control={control}
                  name="boxOffice"
                  render={({ field }) => <input {...field} type="number" className="form-control" placeholder="Enter box office" />}
                />
              </div>
            </Col>

            {/* Content Rating */}
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
                {errors?.rating && <p className="text-danger">{errors.rating.message}</p>}
              </div>
            </Col>

            {/* IMDB Rating */}
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">IMDB Rating</label>
                <Controller
                  control={control}
                  name="imdbRating"
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      step="0.1"
                      min={0}
                      max={10}
                      className="form-control"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </Col>

            {/* Formats */}
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Formats</label>
                <Controller
                  control={control}
                  name="formats"
                  render={({ field }) => (
                    <select
                      {...field}
                      multiple
                      className="form-control form-select"
                      onChange={(e) => field.onChange(Array.from(e.target.selectedOptions, (opt) => opt.value))}
                    >
                      <option value="2d">2D</option>
                      <option value="3d">3D</option>
                      <option value="imax">IMAX</option>
                      <option value="imax_3d">IMAX 3D</option>
                      <option value="imax_4d">IMAX 4D</option>
                      <option value="imax_5d">IMAX 5D</option>
                      <option value="4dx">4DX</option>
                      <option value="dolby_atmos">Dolby Atmos</option>
                      <option value="dolby_cinema">Dolby Cinema</option>
                      <option value="screenx">ScreenX</option>
                      <option value="d_box">D-BOX</option>
                      <option value="hdr">HDR</option>
                      <option value="uhd">UHD</option>
                      <option value="virtual_reality">Virtual Reality (VR)</option>
                      <option value="hfr">High Frame Rate (HFR)</option>
                      <option value="laser">Laser Projection</option>
                    </select>
                  )}
                />
              </div>
            </Col>

            {/* Production Companies */}
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

            {/* Distributors */}
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

            {/* Languages */}
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
                          placeholder="Type and press Enter"
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
                <Controller
                  control={control}
                  name="originalLanguage"
                  render={({ field }) => <input {...field} type="text" className="form-control" placeholder="e.g. English" />}
                />
              </div>
            </Col>

            {/* Duration */}
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

            {/* Genres */}
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Genres</label>
                <Controller
                  control={control}
                  name="genres"
                  render={({ field }) => (
                    <select
                      {...field}
                      multiple
                      className="form-control form-select"
                      onChange={(e) => field.onChange(Array.from(e.target.selectedOptions, (opt) => opt.value))}
                    >
                      <option value="action">Action</option>
                      <option value="comedy">Comedy</option>
                      <option value="drama">Drama</option>
                      <option value="thriller">Thriller</option>
                      <option value="horror">Horror</option>
                      <option value="romance">Romance</option>
                      <option value="sci-fi">Sci-Fi</option>
                      <option value="fantasy">Fantasy</option>
                      <option value="documentary">Documentary</option>
                      <option value="animation">Animation</option>
                      <option value="musical">Musical</option>
                      <option value="biography">Biography</option>
                      <option value="adventure">Adventure</option>
                      <option value="crime">Crime</option>
                      <option value="family">Family</option>
                    </select>
                  )}
                />
              </div>
            </Col>

            {/* Tags */}
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

            {/* Awards */}
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

            {/* UA Certification */}
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">UA Certification</label>
                <Controller
                  control={control}
                  name="uaCertification"
                  render={({ field }) => <input {...field} type="text" className="form-control" placeholder="" />}
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
                        onBlur={field.onBlur}
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

            {/* Description */}
            <Col lg={12}>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <Controller
                  control={control}
                  name="description"
                  render={({ field }) => <textarea {...field} className="form-control" placeholder="Enter description" />}
                />
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* cast */}
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <CardTitle as="h4">Cast Details</CardTitle>
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={addCast}>
            +
          </button>
        </CardHeader>

        <CardBody>
          {cast.map((member, index) => (
            <Row key={`cast-${index}`} className="align-items-end mb-3">
              {/* Cast Image */}
              <Col lg={4}>
                <label className="form-label">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    try {
                      const url = await uploadSingle(file).unwrap()
                      handleChange(index, 'image', url)
                    } catch (err) {
                      console.error('Cast image upload failed:', err)
                    } finally {
                      e.currentTarget.value = ''
                    }
                  }}
                  disabled={isPosterUploading}
                />
              </Col>

              {/* Cast Name */}
              <Col lg={3}>
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={member.name}
                  onChange={(e) => handleChange(index, 'name', e.target.value)}
                  placeholder="Enter name"
                />
              </Col>

              {/* Cast Type */}
              <Col lg={3}>
                <label className="form-label">Designation</label>
                <input
                  type="text"
                  className="form-control"
                  value={member.type}
                  onChange={(e) => handleChange(index, 'type', e.target.value)}
                  placeholder="Enter designation"
                />
              </Col>

              {/* Remove Button */}
              <Col lg={1}>
                {cast.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-outline-danger w-100"
                    onClick={() => setcast((prev) => prev.filter((_, i) => i !== index))}>
                    ✕
                  </button>
                )}
              </Col>
            </Row>
          ))}
        </CardBody>
      </Card>

      {/* crew */}
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <CardTitle as="h4">Crew Details</CardTitle>
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={addCrew}>
            +
          </button>
        </CardHeader>

        <CardBody>
          {crew.map((member, index) => (
            <Row key={`crew-${index}`} className="align-items-end mb-3">
              {/* Crew Image */}
              <Col lg={4}>
                <label className="form-label">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    try {
                      const url = await uploadSingle(file).unwrap()
                      handleChangeCrew(index, 'image', url)
                    } catch (err) {
                      console.error('Crew image upload failed:', err)
                    } finally {
                      e.currentTarget.value = ''
                    }
                  }}
                  disabled={isPosterUploading}
                />
              </Col>

              {/* Crew Name */}
              <Col lg={3}>
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={member.name}
                  onChange={(e) => handleChangeCrew(index, 'name', e.target.value)}
                  placeholder="Enter name"
                />
              </Col>

              {/* Crew Designation */}
              <Col lg={3}>
                <label className="form-label">Designation</label>
                <input
                  type="text"
                  className="form-control"
                  value={member.designation}
                  onChange={(e) => handleChangeCrew(index, 'designation', e.target.value)}
                  placeholder="Enter designation"
                />
              </Col>

              {/* Remove Button */}
              <Col lg={1}>
                {crew.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-outline-danger w-100"
                    onClick={() => setCrew((prev) => prev.filter((_, i) => i !== index))}>
                    ✕
                  </button>
                )}
              </Col>
            </Row>
          ))}
        </CardBody>
      </Card>

      {/* Company details */}
      <Card>
        <CardHeader>
          <CardTitle as="h4">Company Details</CardTitle>
        </CardHeader>

        <CardBody>
          <Row>
            {/* Production House */}
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Production House</label>
                <Controller
                  control={control}
                  name="productionhouse"
                  render={({ field }) => <input {...field} type="text" className="form-control" placeholder="Enter production house" />}
                />
                {errors?.productionhouse && <p className="text-danger">{errors.productionhouse.message}</p>}
              </div>
            </Col>

            {/* Website */}
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Website (optional)</label>
                <Controller
                  control={control}
                  name="website"
                  render={({ field }) => <input {...field} type="url" className="form-control" placeholder="https://example.com" />}
                />
              </div>
            </Col>

            {/* Address */}
            <Col lg={12}>
              <div className="mb-3">
                <label className="form-label">Address</label>
                <Controller
                  control={control}
                  name="address"
                  render={({ field }) => <input {...field} type="text" className="form-control" placeholder="Enter address" />}
                />
                {errors?.address && <p className="text-danger">{errors.address.message}</p>}
              </div>
            </Col>

            {/* State */}
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">State</label>
                <Controller
                  control={control}
                  name="state"
                  render={({ field }) => <input {...field} type="text" className="form-control" placeholder="Enter state" />}
                />
              </div>
            </Col>

            {/* Country */}
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

            {/* Phone */}
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Phone Number</label>
                <Controller
                  control={control}
                  name="phone"
                  render={({ field }) => <input {...field} type="text" className="form-control" placeholder="Enter phone number" />}
                />
              </div>
            </Col>

            {/* Email */}
            <Col lg={6}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <Controller
                  control={control}
                  name="email"
                  render={({ field }) => <input {...field} type="email" className="form-control" placeholder="Enter email" />}
                />
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Country-wise Asking Price */}
      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center">
          <CardTitle as="h4">Country-wise Asking Price</CardTitle>
          <button type="button" className="btn btn-sm btn-outline-primary" onClick={addCountryPricing}>
            + Add Country
          </button>
        </CardHeader>

        <CardBody>
          <p className="text-muted mb-3">Set different asking prices for film rights in different countries</p>
          {countryPricing.map((pricing, index) => (
            <Row key={`pricing-${index}`} className="align-items-end mb-3 p-3 bg-light rounded">
              {/* Country Selection */}
              <Col lg={3}>
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

              {/* Currency (Auto-filled) */}
              <Col lg={2}>
                <label className="form-label">Currency</label>
                <input
                  type="text"
                  className="form-control"
                  value={pricing.currency}
                  readOnly
                  placeholder="Auto"
                />
              </Col>

              {/* Asking Price */}
              <Col lg={2}>
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

              {/* Negotiable */}
              <Col lg={2}>
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

              {/* Notes */}
              <Col lg={2}>
                <label className="form-label">Notes</label>
                <input
                  type="text"
                  className="form-control"
                  value={pricing.notes}
                  onChange={(e) => handleCountryPricingChange(index, 'notes', e.target.value)}
                  placeholder="Optional"
                />
              </Col>

              {/* Remove Button */}
              <Col lg={1}>
                {countryPricing.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-outline-danger w-100"
                    onClick={() => removeCountryPricing(index)}>
                    ✕
                  </button>
                )}
              </Col>
            </Row>
          ))}
        </CardBody>
      </Card>
    </>
  )
}

const MoviesAdd = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  const [image, setImage] = React.useState<File | null>(null)
  const router = useRouter()

  const [createMovies, { isLoading }] = useCreateMovieMutation()

  const messageSchema = yup.object({
    title: yup.string().required('Please enter title'),
    originalTitle: yup.string().optional(),
    description: yup.string().required('Please enter description'),
    releaseDate: yup.string().required('Please select release date'),
    duration: yup.number().required('Please enter duration'),
    genres: yup.array().of(yup.string()).required('Please select at least one genre'),
    languages: yup.array().of(yup.string()).required('Please select at least one language'),
    originalLanguage: yup.string().optional(),
    country: yup.string().required('Please enter country'),
    rating: yup.string().oneOf(['G', 'PG', 'PG-13', 'R', 'NC-17', 'NR'], 'Invalid rating').required('Please select rating'),
    imdbRating: yup
      .number()
      .typeError('IMDB rating must be a number')
      .min(0, 'IMDB rating must be at least 0')
      .max(10, 'IMDB rating must be 10 or less')
      .required('Please enter IMDB rating'),
    rottenTomatoesRating: yup.number().min(0).max(100).optional(),
    posterUrl: yup.string().url('Please enter a valid URL').required('Please enter poster URL'),
    trailerUrl: yup.string().url().optional(),
    backdropUrl: yup.string().url().optional(),
    galleryImages: yup.array().of(yup.string()).optional(),
    budget: yup.number().min(0).optional(),
    boxOffice: yup.number().min(0).optional(),
    productionCompanies: yup.array().of(yup.string()).optional(),
    distributors: yup.array().of(yup.string()).optional(),
    formats: yup.array().of(yup.string()).optional(),
    status: yup.string().oneOf(['upcoming', 'released', 'in_production'], 'Invalid status').optional(),
    tags: yup.array().of(yup.string()).optional(),
    awards: yup.array().of(yup.string()).optional(),
    director: yup.string().optional(),
    producer: yup.string().optional(),
    productionCost: yup.number().min(0).optional(),
    uaCertification: yup.string().optional(),
    isActive: yup.boolean().optional(),
    homeSection: yup.string().oneOf(['', 'hot_rights_available', 'profitable_picks', 'international_deals', 'indie_gems']).optional(),
    tradeStatus: yup.string().oneOf(['get_it_now', 'sold_out', 'out_of_stock', 'coming_soon', 'limited_offer', 'negotiating']).optional(),
  })

  const {
    reset,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(messageSchema),
    defaultValues: {
      title: '',
      originalTitle: '',
      posterUrl: '',
      backdropUrl: '',
      trailerUrl: '',
      galleryImages: [],
      releaseDate: '',
      status: undefined,
      director: '',
      producer: '',
      productionCost: undefined,
      rating: undefined,
      imdbRating: 0,
      rottenTomatoesRating: undefined,
      formats: [],
      budget: undefined,
      boxOffice: undefined,
      productionCompanies: [],
      distributors: [],
      languages: [],
      originalLanguage: '',
      duration: 0,
      genres: [],
      tags: [],
      awards: [],
      uaCertification: '',
      description: '',
      isActive: true,
      productionhouse: '',
      website: '',
      address: '',
      state: '',
      country: '',
      phone: '',
      email: '',
      cast: [],
      crew: [],
      homeSection: '',
      tradeStatus: 'get_it_now',
    },
  })

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        title: data.title,
        originalTitle: data.originalTitle,
        description: data.description,
        releaseDate: data.releaseDate,
        duration: Number(data.duration),
        genres: data.genres,
        languages: data.languages,
        originalLanguage: data.originalLanguage,
        country: data.country,
        rating: data.rating,
        imdbRating: Number(data.imdbRating),
        rottenTomatoesRating: data.rottenTomatoesRating,
        posterUrl: data.posterUrl,
        backdropUrl: data.backdropUrl,
        trailerUrl: data.trailerUrl,
        galleryImages: data.galleryImages,
        budget: data.budget,
        boxOffice: data.boxOffice,
        productionCompanies: data.productionCompanies,
        distributors: data.distributors,
        formats: data.formats,
        status: data.status,
        tags: data.tags,
        awards: data.awards,
        director: data.director,
        producer: data.producer,
        productionCost: data.productionCost,
        uaCertification: data.uaCertification,
        isActive: data.isActive,
        company: {
          productionHouse: data.productionhouse,
          website: data.website,
          address: data.address,
          state: data.state,
          phone: data.phone,
          email: data.email,
        },
        cast: (data.cast || []).map((c: any) => ({ name: c.name, type: c.type, image: c.image })),
        crew: (data.crew || []).map((c: any) => ({ name: c.name, designation: c.designation, image: c.image })),
        homeSection: data.homeSection || '',
        tradeStatus: data.tradeStatus || 'get_it_now',
        countryPricing: (data.countryPricing || []).filter((p: any) => p.countryCode).map((p: any) => ({
          countryCode: p.countryCode,
          countryName: p.countryName,
          currency: p.currency,
          askingPrice: Number(p.askingPrice) || 0,
          negotiable: p.negotiable ?? true,
          notes: p.notes || '',
        })),
      }

      // ✅ send JSON object (not FormData)
      const result = await createMovies(payload).unwrap()
      console.log('✅ Movie created:', result)

      showMessage('Movie created successfully!', 'success')
      reset()
      router.push('/movies/movies-list') // navigate if needed
    } catch (err: any) {
      console.error('❌ Error submitting movie:', err)
      showMessage(err?.data?.message || 'Failed to create movie', 'error')
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <GeneralInformationCard control={control} setImage={setImage} errors={errors} setValue={setValue} />

        <div className="p-3 bg-light mb-3 rounded">
          <Row className="justify-content-end g-2">
            <Col lg={2}>
              <Button variant="success" type="submit" className="w-100" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save'}
              </Button>
            </Col>
          </Row>
        </div>
      </form>

      <ToastContainer className="p-3" position="top-end" style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default MoviesAdd
