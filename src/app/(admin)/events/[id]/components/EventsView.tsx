'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Badge, Card, CardBody, Carousel, CarouselItem, Col, ListGroup, Row, Spinner } from 'react-bootstrap'
import { useParams, useRouter } from 'next/navigation'
import { useGetEventsByIdQuery } from '@/store/eventsApi'

const EventsView = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const { id } = useParams()
  const router = useRouter()
  const { data: event, isLoading, isError } = useGetEventsByIdQuery(id as string)

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading event details...</p>
      </div>
    )
  }
  if (isError) return <div className="text-center py-5 text-danger">Error loading event details</div>
  if (!event) return <div className="text-center py-5">No event found</div>

  return (
    <Row>
      {/* LEFT SIDE */}
      <Col lg={6}>
        {/* Carousel */}
        <Card>
          <CardBody>
            <Carousel activeIndex={activeIndex} onSelect={setActiveIndex} indicators={false}>
              <CarouselItem>
                <Image
                  src={event.posterImage || '/placeholder.jpg'}
                  alt="event-img"
                  className="img-fluid bg-light rounded w-100"
                  width={500}
                  height={500}
                />
              </CarouselItem>
            </Carousel>
          </CardBody>
        </Card>

        {/* Company Details */}
        <Card className="mt-3">
          <CardBody>
            <h4 className="text-dark fw-medium">Events Details :</h4>
            <ListGroup className="mt-3">
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Venue Name</span> <span>{event.location.venueName}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>State</span> <span>{event.location.state}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>City</span> <span>{event.location.city}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Latitude</span> <span>{event.location.latitude}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Longitude</span> <span>{event.location.longitude}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Postal Code</span> <span>{event.location.postalCode}</span>
              </ListGroup.Item>
            </ListGroup>
          </CardBody>
        </Card>

        {/* Trailer */}
        {/* {event?.trailerUrl && (
          <Card className="mt-3">
            <CardBody>
              <div className="ratio ratio-16x9">
                <iframe
                  src={event.trailerUrl}
                  title="YouTube video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </CardBody>
          </Card>
        )} */}

        {/* Gallery Images */}
        {event?.galleryImages?.length > 0 && (
          <Card className="mt-3">
            <CardBody>
              <h4 className="text-dark fw-medium">Gallery Images</h4>
              <div className="row g-3">
                {event.galleryImages.map((image: string, index: number) => (
                  <div key={index} className="col-lg-3 col-sm-6">
                    <div
                      className="rounded overflow-hidden"
                      style={{
                        width: '100%',
                        height: '100px',
                        position: 'relative',
                      }}>
                      <Image src={image} alt={`Gallery Image ${index}`} fill className="rounded" style={{ objectFit: 'cover' }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* tags  */}
        {event?.tags?.length > 0 && (
          <Card className="mt-3">
            <CardBody>
              <h4 className="text-dark fw-medium">Tag:-</h4>
              <div className="row g-3">
                {event.tags.map((tag: string, index: number) => (
                  <div key={index} className="col-lg-3 col-sm-6">
                    <span className="badge bg-success text-light fs-14 py-1 px-2">{tag}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
      </Col>

      {/* RIGHT SIDE */}
      <Col lg={6}>
        <Card>
          <CardBody>
            <h4 className="badge bg-success text-light fs-14 py-1 px-2">{event?.status}</h4>
            <p className="mb-1">
              <Link href="#" className="fs-24 text-dark fw-medium">
                {event?.title}
              </Link>
            </p>

            {/* Description */}
            <h4 className="text-dark fw-medium">Description :</h4>
            <p className="text-muted">{event?.description || 'No description available.'}</p>

            {/* Basic Details */}
            <h4 className="text-dark fw-medium mt-3">Basic Details :</h4>
            <ListGroup className="mt-3">
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Event Type</span> <span className="text-capitalize">{event.eventType}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Category</span> <span>{event.category}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Language</span> <span>{event.eventLanguage || 'English'}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Start Date</span>
                <span>
                  {new Date(event.startDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>End Date</span>
                <span>
                  {new Date(event.endDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Start Time</span> <span>{event.startTime}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>End Time</span> <span>{event.endTime}</span>
              </ListGroup.Item>
            </ListGroup>

            {/* Ticket Information */}
            <h4 className="text-dark fw-medium mt-4">Ticket Information :</h4>
            <ListGroup className="mt-3">
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Base Ticket Price</span> <Badge bg="success">₹{event.ticketPrice}</Badge>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Total Seats</span> <span>{event.totalSeats}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Available Seats</span> <span>{event.availableSeats}</span>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Tickets Sold</span> <Badge bg="info">{event.totalTicketsSold || 0}</Badge>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Max Tickets/Person</span> <span>{event.maxTicketsPerPerson || 10}</span>
              </ListGroup.Item>
            </ListGroup>

            {/* Seat Types */}
            {event?.seatTypes && event.seatTypes.length > 0 && (
              <>
                <h4 className="text-dark fw-medium mt-4">Seat Types :</h4>
                <div className="table-responsive mt-3">
                  <table className="table table-bordered table-sm">
                    <thead className="bg-light">
                      <tr>
                        <th>Type</th>
                        <th>Price</th>
                        <th>Total</th>
                        <th>Available</th>
                      </tr>
                    </thead>
                    <tbody>
                      {event.seatTypes.map((seatType: any, index: number) => (
                        <tr key={index}>
                          <td className="fw-medium">{seatType.name}</td>
                          <td><Badge bg="success">₹{seatType.price}</Badge></td>
                          <td>{seatType.totalSeats}</td>
                          <td>{seatType.availableSeats}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {event?.performers?.length > 0 && (
              <>
                <h4 className="text-dark fw-medium mt-3">Performers List :</h4>
                <Row className="g-3">
                  {event.performers.map((performer: any, index: number) => (
                    <Col lg={6} key={index}>
                      <div className="p-3 rounded border text-center bg-light" style={{ minHeight: 200 }}>
                        <img
                          src={performer.image || 'https://www.citypng.com/public/uploads/preview/hd-man-user-illustration-icon-transparent-png-701751694974843ybexneueic.png'}
                          alt={performer.name || 'performer-img'}
                          height={100}
                          width={100}
                          style={{ objectFit: 'cover', borderRadius: '50%' }}
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://www.citypng.com/public/uploads/preview/hd-man-user-illustration-icon-transparent-png-701751694974843ybexneueic.png' }}
                        />
                        <p className="mb-0 fw-bold mt-2">{performer.name}</p>
                        <p className="text-muted mb-0">{performer.type}</p>
                        {performer.bio && <p className="text-muted small">{performer.bio}</p>}
                      </div>
                    </Col>
                  ))}
                </Row>
              </>
            )}

            {/* organizers List */}
            {event?.organizers?.length > 0 && (
              <>
                <h4 className="text-dark fw-medium mt-3">Organizers List :</h4>
                <Row className="g-3">
                  {event.organizers.map((organizer: any, index: number) => (
                    <Col lg={6} key={index}>
                      <div className="p-3 rounded border text-center bg-light" style={{ minHeight: 200 }}>
                        <img
                          src={organizer.logo || 'https://www.citypng.com/public/uploads/preview/hd-man-user-illustration-icon-transparent-png-701751694974843ybexneueic.png'}
                          alt={organizer.name || 'organizer-img'}
                          height={100}
                          width={100}
                          style={{ objectFit: 'cover', borderRadius: '50%' }}
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://www.citypng.com/public/uploads/preview/hd-man-user-illustration-icon-transparent-png-701751694974843ybexneueic.png' }}
                        />
                        <p className="mb-0 fw-bold mt-2">{organizer.name}</p>
                        {organizer.email && <p className="text-muted mb-0 small">{organizer.email}</p>}
                        {organizer.phone && <p className="text-muted small">{organizer.phone}</p>}
                      </div>
                    </Col>
                  ))}
                </Row>
              </>
            )}
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default EventsView
