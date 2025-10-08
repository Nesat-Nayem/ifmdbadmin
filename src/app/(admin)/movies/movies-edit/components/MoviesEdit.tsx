'use client'

import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Col, Container, Row } from 'react-bootstrap'
import user1 from '../../../../../assets/images/users/avatar-1.jpg'
import user2 from '../../../../../assets/images/users/avatar-2.jpg'
import classNames from 'classnames'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
const MoviesEdit = () => {
  const [castMembers, setCastMembers] = useState([
    { name: 'Anupam Kher', role: 'Actor', image: user1 },
    { name: 'Another Actor', role: 'Actor', image: user2 },
    { name: 'Someone Else', role: 'Comedian', image: user1 },
    { name: 'Fourth Actor', role: 'Singer', image: user2 },
  ])
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([])

  const toggleSelection = (index: number) => {
    setSelectedIndexes((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  const deleteCast = (indexToDelete: number) => {
    const updatedCast = castMembers.filter((_, index) => index !== indexToDelete)
    setCastMembers(updatedCast)
    setSelectedIndexes((prev) => prev.filter((i) => i !== indexToDelete))
  }

  // addvertisement
  const [selectedAds, setSelectedAds] = useState<string[]>([])

  const handleCheckboxChange = (id: string) => {
    setSelectedAds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const advertisementList = [
    { id: 'ad1', name: 'Banner Top' },
    { id: 'ad2', name: 'Home Slider' },
    { id: 'ad3', name: 'Sidebar Promo' },
    { id: 'ad4', name: 'Footer Strip' },
  ]

  return (
    <Container>
      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>Basic Details</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={6}>
              <form>
                <label htmlFor="handshake" className="form-label">
                  Upload Poster
                </label>
                <div className="input-group mb-3">
                  <input type="file" id="handshake" className="form-control" defaultValue={''} />
                </div>
              </form>
            </Col>
            <Col lg={6}>
              <form>
                <label htmlFor="Title" className="form-label">
                  Movie Name
                </label>
                <div className="input-group mb-3">
                  <input type="text" id="Title" className="form-control" defaultValue={''} />
                </div>
              </form>
            </Col>
            <Col lg={6}>
              <form>
                <label htmlFor="Sub" className="form-label">
                  Slug
                </label>
                <div className="input-group mb-3">
                  <input type="text" id="Sub" className="form-control" defaultValue={''} />
                </div>
              </form>
            </Col>

            <Col lg={6}>
              <form>
                <label htmlFor="URL" className="form-label">
                  Movie Trailer URL
                </label>
                <div className="input-group mb-3">
                  <input type="link" id="URL" className="form-control" defaultValue={''} />
                </div>
              </form>
            </Col>
            <Col lg={6}>
              <label className="form-label">Movies Category</label>
              <select name="category" className="form-control mb-3">
                <option value="">Select Category</option>
                <option value="RecommendedMovies">Recommended Movies</option>
                <option value="KidsMovies">Kids Movies</option>
              </select>
            </Col>
            <Col lg={6}>
              <label className="form-label">Category</label>
              <select name="category" className="form-control mb-3">
                <option value="">Select Category</option>
                <option value="Release">Release</option>
                <option value="UpComing">UpComing</option>
              </select>
            </Col>
            <Col lg={6}>
              <form>
                <label htmlFor="Title" className="form-label">
                  Director Name
                </label>
                <div className="input-group mb-3">
                  <input type="text" id="Title" className="form-control" defaultValue={''} />
                </div>
              </form>
            </Col>
            <Col lg={6}>
              <form>
                <label htmlFor="Title" className="form-label">
                  Producer Name
                </label>
                <div className="input-group mb-3">
                  <input type="text" id="Title" className="form-control" defaultValue={''} />
                </div>
              </form>
            </Col>
            <Col lg={6}>
              <form>
                <label htmlFor="Title" className="form-label">
                  Production Cost
                </label>
                <div className="input-group mb-3">
                  <input type="text" id="Title" className="form-control" defaultValue={''} />
                </div>
              </form>
            </Col>

            <Col lg={6}>
              <label className="form-label">Format</label>
              <select name="format" className="form-control  mb-3">
                <option value="">Select Format</option>
                <option value="2D">2D</option>
                <option value="3D">3D</option>
                <option value="4D">4D</option>
                <option value="IMAX">IMAX</option>
                <option value="UHD">UHD</option>
                <option value="4K">4K</option>
                <option value="IMAX 4K">IMAX 4K</option>
                <option value="UHD 4K">UHD 4K</option>
                <option value="IMAX UHD 4K">IMAX UHD 4K</option>
              </select>
            </Col>

            <Col lg={6}>
              <label className="form-label">Language</label>
              <select name="language" className="form-control  mb-3">
                <option value="">Select Language</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Malayalam">Malayalam</option>
                <option value="Tamil">Tamil</option>
                <option value="Kannada">Kannada</option>
                <option value="Telugu">Telugu</option>
                <option value="Bengali">Bengali</option>
                <option value="Punjabi">Punjabi</option>
                <option value="Gujarati">Gujarati</option>
                <option value="Marathi">Marathi</option>
                <option value="Urdu">Urdu</option>
                <option value="Other">Other</option>
              </select>
            </Col>

            <Col lg={6}>
              <form>
                <label htmlFor="Title" className="form-label">
                  Duration
                </label>
                <div className="input-group mb-3">
                  <input type="text" id="Title" className="form-control" defaultValue={''} />
                </div>
              </form>
            </Col>
            <Col lg={6}>
              <form>
                <label htmlFor="Title" className="form-label">
                  Relesae Date
                </label>
                <div className="input-group mb-3">
                  <input type="date" id="Title" className="form-control" defaultValue={''} />
                </div>
              </form>
            </Col>

            <Col lg={6}>
              <label className="form-label">Category</label>
              <select name="category" className="form-control mb-3">
                <option value="">Select Category</option>
                <option value="Drama">Drama</option>
                <option value="Action">Action</option>
                <option value="Thriller">Thriller</option>
                <option value="Romantic">Romantic</option>
                <option value="Comedy">Comedy</option>
                <option value="Horror">Horror</option>
                <option value="Other">Other</option>
              </select>
            </Col>
            <Col lg={6}>
              <label className="form-label">Status</label>
              <select name="status" className="form-control mb-3">
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="InActive">InActive</option>
              </select>
            </Col>
            <Col lg={12}>
              <div className="mb-3">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea className="form-control bg-light-subtle" id="description" rows={3} placeholder="" defaultValue={''} />
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>Company Details</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={3}>
              <form>
                <label htmlFor="Customers" className="form-label">
                  Production House Name
                </label>
                <div className="input-group mb-3">
                  <input type="text" id="Customers" className="form-control" defaultValue={''} />
                </div>
              </form>
            </Col>
            <Col lg={3}>
              <form>
                <label htmlFor="Electronics" className="form-label">
                  Address
                </label>
                <div className="input-group mb-3">
                  <input type="text" id="Electronics" className="form-control" defaultValue={''} />
                </div>
              </form>
            </Col>
            <Col lg={3}>
              <form>
                <label htmlFor="Salesman" className="form-label">
                  Country{' '}
                </label>
                <select name="Country" className="form-control mb-3">
                  <option value="">Select Country</option>
                  <option value="India">India</option>
                  <option value="USA">USA</option>
                  <option value="UAE">UAE</option>
                  <option value="Australia">Australia</option>
                  <option value="New Zealand">New Zealand</option>
                  <option value="South Africa">South Africa</option>
                  <option value="Other">Other</option>
                </select>
              </form>
            </Col>

            <Col lg={3}>
              <form>
                <label htmlFor="Salesman" className="form-label">
                  State{' '}
                </label>
                <select name="state" className="form-control mb-3">
                  <option value="">Select State</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                  <option value="Assam">Assam</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Chhattisgarh">Chhattisgarh</option>
                  <option value="Goa">Goa</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Himachal Pradesh">Himachal Pradesh</option>
                  <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                  <option value="Jharkhand">Jharkhand</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Manipur">Manipur</option>
                  <option value="Meghalaya">Meghalaya</option>
                  <option value="Mizoram">Mizoram</option>
                  <option value="Nagaland">Nagaland</option>
                  <option value="Odisha">Odisha</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Sikkim">Sikkim</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Tripura">Tripura</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Uttarakhand">Uttarakhand</option>
                  <option value="West Bengal">West Bengal</option>
                </select>
              </form>
            </Col>

            <Col lg={3}>
              <form>
                <label htmlFor="Salesman" className="form-label">
                  City{' '}
                </label>
                <select name="city" className="form-control mb-3">
                  <option value="">Select City</option>
                  <option value="Agra">Agra</option>
                  <option value="Ahmedabad">Ahmedabad</option>
                  <option value="Allahabad">Allahabad</option>
                  <option value="Amritsar">Amritsar</option>
                  <option value="Aurangabad">Aurangabad</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Baroda">Baroda</option>
                  <option value="Bhopal">Bhopal</option>
                  <option value="Bhubaneswar">Bhubaneswar</option>
                  <option value="Chandigarh">Chandigarh</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Coimbatore">Coimbatore</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Ghaziabad">Ghaziabad</option>
                  <option value="Guwahati">Guwahati</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Indore">Indore</option>
                  <option value="Jaipur">Jaipur</option>
                  <option value="Jalandhar">Jalandhar</option>
                  <option value="Jammu">Jammu</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Lucknow">Lucknow</option>
                  <option value="Ludhiana">Ludhiana</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Nagpur">Nagpur</option>
                  <option value="Nashik">Nashik</option>
                  <option value="Patna">Patna</option>
                  <option value="Pune">Pune</option>
                  <option value="Raipur">Raipur</option>
                  <option value="Rajkot">Rajkot</option>
                  <option value="Ranchi">Ranchi</option>
                  <option value="Surat">Surat</option>
                  <option value="Thane">Thane</option>
                  <option value="Vadodara">Vadodara</option>
                </select>
              </form>
            </Col>
            <Col lg={3}>
              <form>
                <label htmlFor="Worldwide" className="form-label">
                  Phone Number
                </label>
                <div className="input-group mb-3">
                  <input type="text" id="Worldwide" className="form-control" defaultValue={''} />
                </div>
              </form>
            </Col>
            <Col lg={3}>
              <form>
                <label htmlFor="Worldwide" className="form-label">
                  Email Address
                </label>
                <div className="input-group mb-3">
                  <input type="email" id="Worldwide" className="form-control" defaultValue={''} />
                </div>
              </form>
            </Col>
            <Col lg={3}>
              <form>
                <label htmlFor="Worldwide" className="form-label">
                  Website
                </label>
                <div className="input-group mb-3">
                  <input type="url" id="Worldwide" className="form-control" defaultValue={''} />
                </div>
              </form>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center gap-1">
          <CardTitle as={'h4'} className="flex-grow-1">
            Select Cast
          </CardTitle>
          <Link href="/movies/add-cast" className="btn btn-sm btn-primary">
            Add Cast
          </Link>
        </CardHeader>
        <CardBody>
          <Row className="g-3">
            {castMembers.map((cast, index) => (
              <Col lg={3} key={index}>
                <div
                  onClick={() => toggleSelection(index)}
                  className={classNames('position-relative p-3 rounded border text-center cursor-pointer', {
                    'bg-primary-subtle border-primary': selectedIndexes.includes(index),
                    'bg-light': !selectedIndexes.includes(index),
                  })}
                  style={{ transition: 'background-color 0.3s', minHeight: 200 }}>
                  {/* Delete Button (top-right) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteCast(index)
                    }}
                    className="position-absolute top-0 end-0 m-1 btn btn-soft-danger btn-sm z-2"
                    style={{ zIndex: 2 }}>
                    <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                  </button>

                  {/* Edit Button (top-left) */}
                  <Link
                    href="/home-banner/home-banner-edit"
                    onClick={(e) => e.stopPropagation()}
                    className="position-absolute top-0 start-0 m-1 btn btn-soft-primary btn-sm z-2"
                    style={{ zIndex: 2 }}>
                    <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                  </Link>

                  {/* Avatar and Info */}
                  <Image
                    src={cast.image}
                    alt="img"
                    className="img-fluid mb-2"
                    height={100}
                    width={100}
                    style={{ objectFit: 'cover', borderRadius: '50%' }}
                  />
                  <p className="mb-0 fw-bold">{cast.name}</p>
                  <p className="text-muted">{cast.role}</p>
                </div>
              </Col>
            ))}
          </Row>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center gap-1">
          <CardTitle as={'h4'} className="flex-grow-1">
            Select Crew
          </CardTitle>
          <Link href="/movies/add-crew" className="btn btn-sm btn-primary">
            Add Crew
          </Link>
        </CardHeader>
        <CardBody>
          <Row className="g-3">
            {castMembers.map((cast, index) => (
              <Col lg={3} key={index}>
                <div
                  onClick={() => toggleSelection(index)}
                  className={classNames('position-relative p-3 rounded border text-center cursor-pointer', {
                    'bg-primary-subtle border-primary': selectedIndexes.includes(index),
                    'bg-light': !selectedIndexes.includes(index),
                  })}
                  style={{ transition: 'background-color 0.3s', minHeight: 200 }}>
                  {/* Delete Button (top-right) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteCast(index)
                    }}
                    className="position-absolute top-0 end-0 m-1 btn btn-soft-danger btn-sm z-2"
                    style={{ zIndex: 2 }}>
                    <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                  </button>

                  {/* Edit Button (top-left) */}
                  <Link
                    href="/home-banner/home-banner-edit"
                    onClick={(e) => e.stopPropagation()}
                    className="position-absolute top-0 start-0 m-1 btn btn-soft-primary btn-sm z-2"
                    style={{ zIndex: 2 }}>
                    <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                  </Link>

                  {/* Avatar and Info */}
                  <Image
                    src={cast.image}
                    alt="img"
                    className="img-fluid mb-2"
                    height={100}
                    width={100}
                    style={{ objectFit: 'cover', borderRadius: '50%' }}
                  />
                  <p className="mb-0 fw-bold">{cast.name}</p>
                  <p className="text-muted">{cast.role}</p>
                </div>
              </Col>
            ))}
          </Row>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle as="h4">Select Advertisement</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="d-flex flex-column gap-2">
            {advertisementList.map((ad) => (
              <div className="form-check" key={ad.id}>
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={ad.id}
                  checked={selectedAds.includes(ad.id)}
                  onChange={() => handleCheckboxChange(ad.id)}
                />
                <label className="form-check-label" htmlFor={ad.id}>
                  {ad.name}
                </label>
              </div>
            ))}
          </div>
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
                <label htmlFor="Title" className="form-label">
                  Meta Title
                </label>
                <div className="input-group mb-3">
                  <input type="text" id="Title" className="form-control" defaultValue={''} />
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
              <form>
                <label htmlFor="Title" className="form-label">
                  Meta Description
                </label>
                <textarea className="form-control bg-light-subtle" id="description" rows={3} placeholder="" defaultValue={''} />
              </form>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Link href="" className="btn btn-outline-secondary w-100">
              Save Changes
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

export default MoviesEdit
