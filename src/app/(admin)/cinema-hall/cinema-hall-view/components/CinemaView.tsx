'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Card, CardBody, CardFooter, Carousel, CarouselItem, Col, ListGroup, Row } from 'react-bootstrap'

import add1 from '../../../../../assets/images/ads/1.png'
import add2 from '../../../../../assets/images/ads/2.png'
import event1 from '../../../../../assets/images/banner/3.png'

const CinemaView = () => {
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
      <Col lg={12}>
        <Card>
          <CardBody>
            <p className="mb-1">
              <Link href="" className="fs-24 text-dark fw-medium">
                PVR
              </Link>
            </p>

            <h4 className="text-dark fw-medium mt-3">Basic Details :</h4>
            <div className="mt-3">
              <ListGroup>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Cinema Hall Name</span> :<span>PVR</span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Country</span> :<span>India</span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>State</span> :<span>Maharashtra</span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>City</span> :<span>Mumbai </span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Sub-locality / Area</span> :<span>Mumbai</span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Seating Capacity</span> :<span>200</span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Number of Screens</span> :<span>12</span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Facilities Available</span> :
                  <span>
                    <ul>
                      <li>Wifi</li>
                      <li>Dolby Atmos</li>
                      <li>Online Booking</li>
                      <li>Parking</li>
                      <li>3D Projection</li>
                      <li>Food Court</li>
                      <li>Recliner Seats</li>
                      <li>Wheelchair Access</li>
                    </ul>
                  </span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Contact Email</span> :<span>info@pvr.com</span>{' '}
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span>Contact Number</span> :<span>+91 9090909090</span>{' '}
                </ListGroup.Item>
              </ListGroup>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h4 className="text-dark fw-medium mt-3">TimeTable :</h4>
            <div className="mt-3 d-flex flex-wrap gap-2">
              <div className="d-flex justify-content-between align-items-center badge bg-dark p-2">6:00 AM</div>
              <div className="d-flex justify-content-between align-items-center badge bg-dark p-2">6:30 AM</div>
              <div className="d-flex justify-content-between align-items-center badge bg-dark p-2">7:00 AM</div>
              <div className="d-flex justify-content-between align-items-center badge bg-dark p-2">7:30 AM</div>
              <div className="d-flex justify-content-between align-items-center badge bg-dark p-2">8:00 AM</div>
              <div className="d-flex justify-content-between align-items-center badge bg-dark p-2">8:30 AM</div>
              <div className="d-flex justify-content-between align-items-center badge bg-dark p-2">9:00 AM</div>
              <div className="d-flex justify-content-between align-items-center badge bg-dark p-2">9:30 AM</div>
              <div className="d-flex justify-content-between align-items-center badge bg-dark p-2">10:00 AM</div>
              <div className="d-flex justify-content-between align-items-center badge bg-dark p-2">10:30 AM</div>
              <div className="d-flex justify-content-between align-items-center badge bg-dark p-2">11:00 AM</div>
              <div className="d-flex justify-content-between align-items-center badge bg-dark p-2">11:30 AM</div>
              <div className="d-flex justify-content-between align-items-center badge bg-dark p-2">12:00 PM</div>
              <div className="d-flex justify-content-between align-items-center badge bg-dark p-2">12:30 PM</div>
              <div className="d-flex justify-content-between align-items-center badge bg-dark p-2">1:00 PM</div>

              <div className="d-flex justify-content-between align-items-center badge bg-dark p-2">1:30 PM</div>
              <div className="d-flex justify-content-between align-items-center badge bg-dark p-2">2:00 PM</div>
              <div className="d-flex justify-content-between align-items-center badge bg-dark p-2">2:30 PM</div>
              <div className="d-flex justify-content-between align-items-center badge bg-dark p-2">3:00 PM</div>
              <div className="d-flex justify-content-between align-items-center badge bg-dark p-2">3:30 PM</div>
              <div className="d-flex justify-content-between align-items-center badge bg-dark p-2">4:00 PM</div>
              <div className="d-flex justify-content-between align-items-center badge bg-dark p-2">4:30 PM</div>
              <div className="d-flex justify-content-between align-items-center badge bg-dark p-2">5:00 PM</div>
              <div className="d-flex justify-content-between align-items-center badge bg-dark p-2">5:30 PM</div>
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default CinemaView
