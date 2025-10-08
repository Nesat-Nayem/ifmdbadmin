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

            {/* Cast List */}
            <h4 className="text-dark fw-medium mt-3">Cast List :</h4>
            {movie.castCrew?.length ? (
              <Row className="g-3">
                {movie.castCrew.map((cast, index) => (
                  <Col lg={6} key={index}>
                    <div className="p-3 rounded border text-center bg-light" style={{ minHeight: 200 }}>
                      {cast.profileImage ? (
                        <Image src={cast.profileImage} alt="cast-img" height={100} width={100} style={{ objectFit: 'cover', borderRadius: '50%' }} />
                      ) : (
                        <div className="rounded-circle bg-light mx-auto mb-2" style={{ width: 100, height: 100 }} />
                      )}
                      <p className="mb-0 fw-bold">{cast.name}</p>
                      <p className="text-muted">{cast.role}</p>
                    </div>
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="text-muted">No cast listed.</div>
            )}

            {/* Admin Cast (simple) */}
            {(movie as any).cast?.length ? (
              <>
                <h5 className="text-dark fw-medium mt-3">Admin Cast</h5>
                <ul>
                  {(movie as any).cast.map((c: any, i: number) => (
                    <li key={i}>{c.name} {c.type ? `(${c.type})` : ''}</li>
                  ))}
                </ul>
              </>
            ) : null}

            {/* Admin Crew (simple) */}
            {(movie as any).crew?.length ? (
              <>
                <h5 className="text-dark fw-medium mt-2">Admin Crew</h5>
                <ul>
                  {(movie as any).crew.map((c: any, i: number) => (
                    <li key={i}>{c.name} {c.designation ? `- ${c.designation}` : ''}</li>
                  ))}
                </ul>
              </>
            ) : null}

            {/* Tags & Awards */}
            {(movie as any).tags?.length ? (
              <p className="mt-3"><strong>Tags:</strong> {(movie as any).tags.join(', ')}</p>
            ) : null}
            {(movie as any).awards?.length ? (
              <p><strong>Awards:</strong> {(movie as any).awards.join(', ')}</p>
            ) : null}
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default MoviesView
