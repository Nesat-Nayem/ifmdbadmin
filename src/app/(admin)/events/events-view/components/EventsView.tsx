'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Card, CardBody, CardFooter, Carousel, CarouselItem, Col, ListGroup, Row } from 'react-bootstrap'

import add1 from '../../../../../assets/images/ads/1.png'
import add2 from '../../../../../assets/images/ads/2.png'
import event1 from '../../../../../assets/images/banner/3.png'

const EventsView = () => {
  const [activeIndex, setActiveIndex] = useState(0)

  const handleSelect = (selectedIndex: number) => {
    setActiveIndex(selectedIndex)
  }

  const handleThunkSelect = (index: number) => {
    setActiveIndex(index)
  }

  const [quantity, setQuantity] = useState<number>(1)

  const increment = () => {
    setQuantity((prevQuantity) => prevQuantity + 1)
  }

  const decrement = () => {
    if (quantity > 1) {
      setQuantity((prevQuantity) => prevQuantity - 1)
    } else {
      setQuantity(1)
    }
  }

  const ads = [
    { id: 'ad1', image: add1 },
    { id: 'ad2', image: add2 },
    { id: 'ad3', image: add1 },
  ]
  const movies = [
    { id: 'event1', image: event1 },
    { id: 'event2', image: event1 },
    { id: 'event3', image: event1 },
  ]
  return (
    <Row>
      <Col lg={6}>
        <Card>
          <CardBody>
            <div id="carouselExampleFade" className="carousel slide carousel-fade" data-bs-ride="carousel">
              <Carousel activeIndex={activeIndex} onSelect={handleSelect} indicators={false} className="carousel-inner" role="listbox">
                {movies.map((item, idx) => (
                  <CarouselItem key={idx}>
                    <Image src={item.image} alt="productImg" className="img-fluid bg-light rounded w-100" />
                  </CarouselItem>
                ))}
              </Carousel>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div id="carouselExampleFade" className="carousel slide carousel-fade" data-bs-ride="carousel">
              <div className="ratio ratio-16x9">
                <iframe
                  src="https://www.youtube.com/embed/YoHD9XEInc0"
                  title="YouTube video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen></iframe>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col lg={6}>
        <Card>
          <CardBody>
            <h4 className="badge bg-success text-light fs-14 py-1 px-2">English</h4>
            <p className="mb-1">
              <Link href="" className="fs-24 text-dark fw-medium">
                Coldplay: Music Of The Spheres World Tour
              </Link>
            </p>
            <div className="d-flex gap-2 align-items-center mb-3">
              <ul className="d-flex text-warning m-0 fs-20  list-unstyled">
                <li>
                  <IconifyIcon icon="bxs:star" />
                </li>
                <li>
                  <IconifyIcon icon="bxs:star" />
                </li>
                <li>
                  <IconifyIcon icon="bxs:star" />
                </li>
                <li>
                  <IconifyIcon icon="bxs:star" />
                </li>
                <li>
                  <IconifyIcon icon="bxs:star-half" />
                </li>
              </ul>
              <p className="mb-0 fw-medium fs-18 text-dark">
                4.5 <span className="text-muted fs-13">(55 Review)</span>
              </p>
            </div>

            <h4 className="text-dark fw-medium">Description :</h4>
            <p className="text-muted">
              Top in sweatshirt fabric made from a cotton blend with a soft brushed inside. Relaxed fit with dropped shoulders, long sleeves and
              ribbing around the neckline, cuffs and hem. Small metal text applique.{' '}
              <Link href="" className="link-primary">
                Read more
              </Link>
            </p>
            <h4 className="text-dark fw-medium mt-3">Basic Details :</h4>
            <div className="mt-3">
              <ListGroup>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Events Category</span> :<span>Music Festivals</span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Organizer Name</span> :<span>John Smith</span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Organizer Comapany Logo</span> :<span></span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Ticket Cost</span> :<span>Rs.5000 /-</span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Events Date</span> :<span>30 July 2025</span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Events Start Time</span> :<span>9:00 AM</span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Events End Time</span> :<span>12:00 PM</span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Duration</span> :<span>2 hours 30 minutes</span>{' '}
                </ListGroup.Item>
              </ListGroup>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h4 className="text-dark fw-medium mt-3">Performers Details :</h4>
            <div className="mt-3">
              <ListGroup>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Performer Name</span> :<span>YashRaj Production</span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Address</span> :<span>Mumbai</span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Country</span> :<span>India</span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>State</span> :<span>Maharashtra</span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>City</span> :<span>Mumbai</span>{' '}
                </ListGroup.Item>
              </ListGroup>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default EventsView
