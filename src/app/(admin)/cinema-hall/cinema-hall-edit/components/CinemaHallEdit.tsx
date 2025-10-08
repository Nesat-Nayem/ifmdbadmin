import Link from 'next/link'
import React from 'react'
import { Card, CardBody, CardHeader, CardTitle, Col, Container, Row } from 'react-bootstrap'

const CinemaHallEdit = () => {
  return (
    <Container>
      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>Edit Cinema Hall</CardTitle>
        </CardHeader>
        <CardBody>
          <form>
            <Row className="g-3">
              <Col lg={6}>
                <label htmlFor="hallName" className="form-label">
                  Cinema Hall Name
                </label>
                <input type="text" id="hallName" className="form-control" placeholder="Enter cinema hall name" defaultValue="" />
              </Col>

              <Col lg={6}>
                <label htmlFor="country" className="form-label">
                  Country
                </label>
                <select id="country" className="form-select">
                  <option value="">Select Country</option>
                  <option value="india">India</option>
                  <option value="usa">USA</option>
                  <option value="uk">United Kingdom</option>
                </select>
              </Col>

              <Col lg={6}>
                <label htmlFor="state" className="form-label">
                  State
                </label>
                <select id="state" className="form-select">
                  <option value="">Select State</option>
                  <option value="maharashtra">Maharashtra</option>
                  <option value="gujarat">Gujarat</option>
                  <option value="karnataka">Karnataka</option>
                </select>
              </Col>

              <Col lg={6}>
                <label htmlFor="city" className="form-label">
                  City
                </label>
                <select id="city" className="form-select">
                  <option value="">Select City</option>
                  <option value="mumbai">Mumbai</option>
                  <option value="ahmedabad">Ahmedabad</option>
                  <option value="bengaluru">Bengaluru</option>
                </select>
              </Col>

              <Col lg={6}>
                <label htmlFor="subLocality" className="form-label">
                  Sub-locality / Area
                </label>
                <input type="text" id="subLocality" className="form-control" placeholder="Enter sub-locality or area" />
              </Col>

              <Col lg={6}>
                <label htmlFor="seating" className="form-label">
                  Seating Capacity
                </label>
                <input type="number" id="seating" className="form-control" placeholder="Enter seating capacity" />
              </Col>

              <Col lg={6}>
                <label htmlFor="screens" className="form-label">
                  Number of Screens
                </label>
                <input type="number" id="screens" className="form-control" placeholder="Enter number of screens" />
              </Col>

              <Col lg={12}>
                <label className="form-label">Facilities Available</label>
                <Row>
                  {['Dolby Atmos', '3D Projection', 'Recliner Seats', 'Online Booking', 'Food Court', 'Wheelchair Access', 'Parking'].map(
                    (facility, idx) => (
                      <Col md={4} key={idx}>
                        <div className="form-check mb-3">
                          <input type="checkbox" className="form-check-input" id={`facility-${idx}`} value={facility} />
                          <label className="form-check-label" htmlFor={`facility-${idx}`}>
                            {facility}
                          </label>
                        </div>
                      </Col>
                    ),
                  )}
                </Row>
              </Col>

              <Col lg={6}>
                <label htmlFor="email" className="form-label">
                  Contact Email
                </label>
                <input type="email" id="email" className="form-control" placeholder="Enter contact email" />
              </Col>

              <Col lg={6}>
                <label htmlFor="phone" className="form-label">
                  Phone Number
                </label>
                <input type="tel" id="phone" className="form-control" placeholder="Enter phone number" />
              </Col>
            </Row>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>Cinema Hall Time Table</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            {[
              '6:00 AM',
              '6:30 AM',
              '7:00 AM',
              '7:30 AM',
              '8:00 AM',
              '8:30 AM',
              '9:00 AM',
              '9:30 AM',
              '10:00 AM',
              '10:30 AM',
              '11:00 AM',
              '11:30 AM',
              '12:00 PM',
              '12:30 PM',
              '1:00 PM',
              '1:30 PM',
              '2:00 PM',
              '2:30 PM',
              '3:00 PM',
              '3:30 PM',
              '4:00 PM',
              '4:30 PM',
              '5:00 PM',
              '5:30 PM',
              '6:00 PM',
              '6:30 PM',
              '7:00 PM',
              '7:30 PM',
              '8:00 PM',
              '8:30 PM',
              '9:00 PM',
              '9:30 PM',
              '10:00 PM',
              '10:30 PM',
              '11:00 PM',
              '11:30 PM',
              '12:00 AM',
              '12:30 AM',
              '1:00 AM',
              '1:30 AM',
              '2:00 AM',
              '2:30 AM',
              '3:00 AM',
              '3:30 AM',
              '4:00 AM',
              '4:30 AM',
              '5:00 AM',
              '5:30 AM',
            ].map((label, idx) => (
              <Col md={6} key={idx}>
                <div className="form-check mb-3">
                  <input className="form-check-input" type="checkbox" id={`plan-${idx}`} value={label} />
                  <label className="form-check-label" htmlFor={`plan-${idx}`}>
                    {label}
                  </label>
                </div>
              </Col>
            ))}
          </Row>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>SEO Details</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={6}>
              <form>
                <label htmlFor="handshake" className="form-label">
                  Meta Title
                </label>
                <div className="input-group mb-3">
                  <input type="text" id="handshake" className="form-control" defaultValue={''} />
                </div>
              </form>
            </Col>
            <Col lg={6}>
              <form>
                <label htmlFor="Title" className="form-label">
                  Meta Tag
                </label>
                <div className="input-group mb-3">
                  <input type="text" id="Title" className="form-control" defaultValue={''} />
                </div>
              </form>
            </Col>
            <Col lg={12}>
              <div className="mb-3">
                <label htmlFor="description" className="form-label">
                  Meta Description
                </label>
                <textarea className="form-control bg-light-subtle" id="description" rows={7} placeholder="" defaultValue={''} />
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Link href="" className="btn btn-outline-secondary w-100">
              Update
            </Link>
          </Col>
          <Col lg={2}>
            <Link href="" className="btn btn-primary w-100">
              Cancel
            </Link>
          </Col>
        </Row>
      </div>
    </Container>
  )
}

export default CinemaHallEdit
