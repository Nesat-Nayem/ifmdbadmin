'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useGetAdvertiseQuery } from '@/store/advertiseApi'
import { useGetEnquiryQuery } from '@/store/enquiryApi'
import { useGetEventsQuery } from '@/store/eventsApi'
import { useGetMoviesQuery } from '@/store/moviesApi'
import Link from 'next/link'
import { Card, CardBody, CardFooter, CardTitle, Col, Row } from 'react-bootstrap'

const StatsCard = () => {
  const { data: movieData } = useGetMoviesQuery({})
  const { data: eventdata } = useGetEventsQuery()
  const { data: advertiseData } = useGetAdvertiseQuery()
  const { data: enqueryData } = useGetEnquiryQuery()
  return (
    <>
      <Col md={4}>
        <Card className="overflow-hidden">
          <CardBody>
            <Row>
              <Col xs={6}>
                <div className="avatar-md  rounded  flex-centered" style={{ backgroundColor: '#0e0e2b' }}>
                  <IconifyIcon icon="bx:movie" className=" fs-24 text-warning" />
                </div>
              </Col>
              <Col xs={6} className="text-end">
                <p className="text-muted mb-0 text-truncate">Total Movies</p>
                <h3 className="text-dark mt-1 mb-0">{movieData?.data?.length}</h3>
              </Col>
            </Row>
          </CardBody>
          <CardFooter className="py-2 bg-light bg-opacity-50">
            <div className="d-flex align-items-center justify-content-between">
              <Link href="/movies/movies-list" className="text-reset fw-semibold fs-12">
                View More
              </Link>
            </div>
          </CardFooter>
        </Card>
      </Col>

      <Col md={4}>
        <Card className="overflow-hidden">
          <CardBody>
            <Row>
              <Col xs={6}>
                <div className="avatar-md  rounded  flex-centered" style={{ backgroundColor: '#0e0e2b' }}>
                  <IconifyIcon icon="bxs:music" className=" fs-24 text-warning" />
                </div>
              </Col>
              <Col xs={6} className="text-end">
                <p className="text-muted mb-0 text-truncate">Total Events</p>
                <h3 className="text-dark mt-1 mb-0">{eventdata?.length}</h3>
              </Col>
            </Row>
          </CardBody>
          <CardFooter className="py-2 bg-light bg-opacity-50">
            <div className="d-flex align-items-center justify-content-between">
              <Link href="/events/events-list" className="text-reset fw-semibold fs-12">
                View More
              </Link>
            </div>
          </CardFooter>
        </Card>
      </Col>

      <Col md={4}>
        <Card className="overflow-hidden">
          <CardBody>
            <Row>
              <Col xs={6}>
                <div className="avatar-md  rounded  flex-centered" style={{ backgroundColor: '#0e0e2b' }}>
                  <IconifyIcon icon="bx:award" className=" fs-24 text-warning" />
                </div>
              </Col>
              <Col xs={6} className="text-end">
                <p className="text-muted mb-0 text-truncate">Total Advertise</p>
                <h3 className="text-dark mt-1 mb-0">{advertiseData?.length}</h3>
              </Col>
            </Row>
          </CardBody>
          <CardFooter className="py-2 bg-light bg-opacity-50">
            <div className="d-flex align-items-center justify-content-between">
              <Link href="/advertise/advertise-list" className="text-reset fw-semibold fs-12">
                View More
              </Link>
            </div>
          </CardFooter>
        </Card>
      </Col>

      <Col md={4}>
        <Card className="overflow-hidden">
          <CardBody>
            <Row>
              <Col xs={6}>
                <div className="avatar-md  rounded  flex-centered" style={{ backgroundColor: '#0e0e2b' }}>
                  <IconifyIcon icon="bx:user" className=" fs-24 text-warning" />
                </div>
              </Col>
              <Col xs={6} className="text-end">
                <p className="text-muted mb-0 text-truncate">Total Enquiries</p>
                <h3 className="text-dark mt-1 mb-0">{enqueryData?.length}</h3>
              </Col>
            </Row>
          </CardBody>
          <CardFooter className="py-2 bg-light bg-opacity-50">
            <div className="d-flex align-items-center justify-content-between">
              <Link href="/enquires/enquires-list" className="text-reset fw-semibold fs-12">
                View More
              </Link>
            </div>
          </CardFooter>
        </Card>
      </Col>

      <Col md={4}>
        <Card className="overflow-hidden">
          <CardBody>
            <Row>
              <Col xs={6}>
                <div className="avatar-md  rounded  flex-centered" style={{ backgroundColor: '#0e0e2b' }}>
                  <IconifyIcon icon="bx:user" className=" fs-24 text-warning" />
                </div>
              </Col>
              <Col xs={6} className="text-end">
                <p className="text-muted mb-0 text-truncate">Total Vendor</p>
                <h3 className="text-dark mt-1 mb-0">{enqueryData?.length}</h3>
              </Col>
            </Row>
          </CardBody>
          <CardFooter className="py-2 bg-light bg-opacity-50">
            <div className="d-flex align-items-center justify-content-between">
              <Link href="/vendors/vendors-list" className="text-reset fw-semibold fs-12">
                View More
              </Link>
            </div>
          </CardFooter>
        </Card>
      </Col>
    </>
  )
}

export default StatsCard
