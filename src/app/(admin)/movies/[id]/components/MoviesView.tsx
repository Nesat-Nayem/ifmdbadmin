'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Card, CardBody, Carousel, CarouselItem, Col, ListGroup, Row, Spinner } from 'react-bootstrap'
import { useParams } from 'next/navigation'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useGetMoviesByIdQuery } from '@/store/moviesApi'

const MoviesView = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const { id } = useParams()
  const { data: movie, isLoading, isError } = useGetMoviesByIdQuery(id as string)
  if (isLoading)
    return (
      <div className="d-flex align-items-center gap-2 text-muted">
        <Spinner size="sm" animation="border" /> Loading movie...
      </div>
    )
  if (isError) return <div className="text-danger">Failed to load movie details</div>
  if (!movie) return <div>No movie found</div>

  return (
    <Row>
      {/* LEFT SIDE */}
      <Col lg={6}>
        {/* Carousel */}
        <Card>
          <CardBody>
            <Carousel activeIndex={activeIndex} onSelect={setActiveIndex} indicators={false}>
              {movie.posterUrl && (
                <CarouselItem>
                  <Image src={movie.posterUrl} alt="Poster" className="img-fluid bg-light rounded w-100" width={500} height={500} />
                </CarouselItem>
              )}
              {movie.backdropUrl && (
                <CarouselItem>
                  <Image src={movie.backdropUrl} alt="Backdrop" className="img-fluid bg-light rounded w-100" width={500} height={500} />
                </CarouselItem>
              )}
            </Carousel>
          </CardBody>
        </Card>

        {/* Company Details */}
        <Card className="mt-3">
          <CardBody>
            <h4 className="text-dark fw-medium">Company & Production :</h4>
            <ListGroup className="mt-3">
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Production Companies</span>
                <span>{movie.productionCompanies?.length ? movie.productionCompanies.join(', ') : '—'}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Budget</span>
                <span>{typeof movie.budget === 'number' ? movie.budget.toLocaleString() : '—'}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Box Office</span>
                <span>{typeof movie.boxOffice === 'number' ? movie.boxOffice.toLocaleString() : '—'}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Country</span> <span>{movie.country || '—'}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Company</span> <span>{movie.company?.productionHouse || '—'}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Website</span>
                <span>
                  {movie.company?.website ? (
                    <a href={movie.company.website} target="_blank" rel="noreferrer">
                      {movie.company.website}
                    </a>
                  ) : (
                    'N/A'
                  )}
                </span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Email</span> <span>{movie.company?.email || '—'}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Phone</span> <span>{movie.company?.phone || '—'}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Address</span> <span>{movie.company?.address || '—'}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Distributors</span> <span>{movie.distributors?.length ? movie.distributors.join(', ') : '—'}</span>
              </ListGroup.Item>
            </ListGroup>
          </CardBody>
        </Card>

        {/* Trailer */}
        <Card className="mt-3">
          <CardBody>
            {movie.trailerUrl ? (
              <div className="ratio ratio-16x9">
                <iframe
                  src={movie.trailerUrl?.includes('watch?v=') ? movie.trailerUrl.replace('watch?v=', 'embed/') : movie.trailerUrl}
                  title="Trailer"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="text-muted">No trailer available</div>
            )}
          </CardBody>
        </Card>

        {/* gallery Images  */}
        <Card className="mt-3">
          <CardBody>
            <div>
              <h4 className="text-dark fw-medium">Gallery Images</h4>
              {movie.galleryImages?.length ? (
                <div className="row g-3">
                  {movie.galleryImages.map((image, index) => (
                    <div key={index} className="col-lg-3 col-sm-6">
                      <div className="rounded overflow-hidden" style={{ width: '100%', height: '100px', position: 'relative' }}>
                        <Image src={image} alt={`Gallery Image ${index}`} fill className="rounded" style={{ objectFit: 'cover' }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted">No gallery images.</div>
              )}
            </div>
          </CardBody>
        </Card>
      </Col>

      {/* RIGHT SIDE */}
      <Col lg={6}>
        <Card>
          <CardBody>
            <div className="d-flex align-items-center gap-2 mb-2">
              <h4 className="badge bg-success text-light fs-14 py-1 px-2 text-capitalize">{movie.status}</h4>
              <span className={`badge ${movie.isActive ? 'bg-primary' : 'bg-secondary'}`}>{movie.isActive ? 'Active' : 'Inactive'}</span>
            </div>
            <p className="mb-1">
              <Link href="" className="fs-24 text-dark fw-medium">
                {movie.title}
              </Link>
            </p>
            {movie.originalTitle && <p className="text-muted">Original Title: {movie.originalTitle}</p>}

            {/* Rating */}
            <div className="d-flex gap-2 align-items-center mb-3">
              <ul className="d-flex text-warning m-0 fs-20 list-unstyled">
                {[...Array(4)].map((_, i) => (
                  <li key={i}>
                    <IconifyIcon icon="bxs:star" />
                  </li>
                ))}
                <li>
                  <IconifyIcon icon="bxs:star-half" />
                </li>
              </ul>
              <p className="mb-0 fw-medium fs-18 text-dark">
                IMDb {movie.imdbRating}
                <span className="text-muted fs-13 ms-1">({movie.totalReviews} Reviews, Avg {movie.averageRating})</span>
                {typeof (movie as any).rottenTomatoesRating === 'number' && (
                  <span className="ms-2">| RT {(movie as any).rottenTomatoesRating}%</span>
                )}
              </p>
            </div>

            {/* Description */}
            <h4 className="text-dark fw-medium">Description :</h4>
            <p className="text-muted">{movie.description || 'No description available.'}</p>

            {/* Basic Details */}
            <h4 className="text-dark fw-medium mt-3">Basic Details :</h4>
            <ListGroup className="mt-3">
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Genres</span>
                <span>{movie.genres?.join(', ')}</span>
              </ListGroup.Item>

              <ListGroup.Item className="d-flex justify-content-between">
                <span>Format</span> <span>{movie.formats?.join(', ')}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Duration</span> <span>{movie.duration}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Language</span> <span>{movie.languages?.join(', ')}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Original Language</span> <span>{(movie as any).originalLanguage || '—'}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Release Date</span>{' '}
                <span>
                  {new Date(movie.releaseDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </ListGroup.Item>
            </ListGroup>

            {/* Cast Section */}
            <div className="mt-4">
              <h4 className="text-dark fw-medium mb-3 d-flex align-items-center gap-2">
                <span>🎭</span> Cast
              </h4>
              {(movie as any).cast?.length ? (
                <Row className="g-3">
                  {(movie as any).cast.map((c: any, index: number) => (
                    <Col lg={4} md={6} key={index}>
                      <div className="p-3 rounded-3 border bg-light h-100">
                        <div className="d-flex align-items-center gap-3">
                          <div className="flex-shrink-0">
                            {c.image ? (
                              <Image 
                                src={c.image} 
                                alt={c.name} 
                                width={70} 
                                height={70} 
                                className="rounded-circle border shadow-sm"
                                style={{ objectFit: 'cover' }} 
                              />
                            ) : (
                              <div 
                                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
                                style={{ width: 70, height: 70 }}
                              >
                                <span style={{ fontSize: '1.5rem' }}>👤</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <h6 className="mb-1 fw-semibold text-dark">{c.name || 'Unknown'}</h6>
                            {c.type && (
                              <span className="badge bg-primary bg-opacity-10 text-primary small">
                                {c.type}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              ) : movie.castCrew?.length ? (
                <Row className="g-3">
                  {movie.castCrew.map((cast, index) => (
                    <Col lg={4} md={6} key={index}>
                      <div className="p-3 rounded-3 border bg-light h-100">
                        <div className="d-flex align-items-center gap-3">
                          <div className="flex-shrink-0">
                            {cast.profileImage ? (
                              <Image 
                                src={cast.profileImage} 
                                alt={cast.name} 
                                width={70} 
                                height={70} 
                                className="rounded-circle border shadow-sm"
                                style={{ objectFit: 'cover' }} 
                              />
                            ) : (
                              <div 
                                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
                                style={{ width: 70, height: 70 }}
                              >
                                <span style={{ fontSize: '1.5rem' }}>👤</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <h6 className="mb-1 fw-semibold text-dark">{cast.name}</h6>
                            {cast.role && (
                              <span className="badge bg-primary bg-opacity-10 text-primary small">
                                {cast.role}
                              </span>
                            )}
                            {cast.characterName && (
                              <p className="mb-0 text-muted small mt-1">as {cast.characterName}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div className="text-muted p-3 bg-light rounded">No cast members listed.</div>
              )}
            </div>

            {/* Crew Section */}
            <div className="mt-4">
              <h4 className="text-dark fw-medium mb-3 d-flex align-items-center gap-2">
                <span>🎬</span> Crew
              </h4>
              {(movie as any).crew?.length ? (
                <Row className="g-3">
                  {(movie as any).crew.map((c: any, index: number) => (
                    <Col lg={4} md={6} key={index}>
                      <div className="p-3 rounded-3 border bg-light h-100">
                        <div className="d-flex align-items-center gap-3">
                          <div className="flex-shrink-0">
                            {c.image ? (
                              <Image 
                                src={c.image} 
                                alt={c.name} 
                                width={70} 
                                height={70} 
                                className="rounded-circle border shadow-sm"
                                style={{ objectFit: 'cover' }} 
                              />
                            ) : (
                              <div 
                                className="rounded-circle bg-info d-flex align-items-center justify-content-center text-white"
                                style={{ width: 70, height: 70 }}
                              >
                                <span style={{ fontSize: '1.5rem' }}>🎬</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <h6 className="mb-1 fw-semibold text-dark">{c.name || 'Unknown'}</h6>
                            {c.designation && (
                              <span className="badge bg-info bg-opacity-10 text-info small">
                                {c.designation}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div className="text-muted p-3 bg-light rounded">No crew members listed.</div>
              )}
            </div>

            {/* Director & Producer Quick Info */}
            {(movie.director || movie.producer) && (
              <div className="mt-4 p-3 bg-light rounded-3 border">
                <Row>
                  {movie.director && (
                    <Col md={6}>
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted">Director:</span>
                        <strong className="text-dark">{movie.director}</strong>
                      </div>
                    </Col>
                  )}
                  {movie.producer && (
                    <Col md={6}>
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted">Producer:</span>
                        <strong className="text-dark">{movie.producer}</strong>
                      </div>
                    </Col>
                  )}
                </Row>
              </div>
            )}

            {/* Tags */}
            {(movie as any).tags?.length > 0 && (
              <div className="mt-4">
                <h5 className="text-dark fw-medium mb-2">🏷️ Tags</h5>
                <div className="d-flex flex-wrap gap-2">
                  {(movie as any).tags.map((tag: string, i: number) => (
                    <span key={i} className="badge bg-secondary bg-opacity-25 text-dark px-3 py-2">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Awards */}
            {(movie as any).awards?.length > 0 && (
              <div className="mt-4">
                <h5 className="text-dark fw-medium mb-2">🏆 Awards</h5>
                <div className="d-flex flex-wrap gap-2">
                  {(movie as any).awards.map((award: string, i: number) => (
                    <span key={i} className="badge bg-warning bg-opacity-25 text-dark px-3 py-2">
                      {award}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default MoviesView
