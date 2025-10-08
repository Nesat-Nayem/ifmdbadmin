'use client'

import React, { useState } from 'react'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import { Card, CardBody, CardFooter, CardHeader, CardTitle, Col, ListGroup, ListGroupItem, Row } from 'react-bootstrap'
import Image from 'next/image'
import adharfront from '../../../../../assets/images/adhar-front.png'
import adharback from '../../../../../assets/images/adhar-front.png'
import pan from '../../../../../assets/images/pan.jpg'
const VendorDetails = () => {
  return (
    <Row>
      <Col lg={12}>
        <Card>
          <CardBody>
            <Row className="g-3">
              <Col lg={6} className="border-end">
                <div>
                  <h4 className="mb-1"> Suraj Jamdade</h4>
                  <Link href="" className="link-primary fs-16 fw-medium">
                    www.zara.com
                  </Link>

                  <div className="mt-2">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <div className="avatar-sm bg-light d-flex align-items-center justify-content-center rounded">
                        <IconifyIcon icon="solar:point-on-map-bold-duotone" className="fs-20 text-primary" />
                      </div>
                      <p className="mb-0 fs-15">4604 , Bandra West, Mumbai, IN 47404</p>
                    </div>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <div className="avatar-sm bg-light d-flex align-items-center justify-content-center rounded">
                        <IconifyIcon icon="solar:letter-bold-duotone" className="fs-20 text-primary" />
                      </div>
                      <p className="mb-0 fs-15">suraj@zara.com</p>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <div className="avatar-sm bg-light d-flex align-items-center justify-content-center rounded">
                        <IconifyIcon icon="solar:outgoing-call-rounded-bold-duotone" className="fs-20 text-primary" />
                      </div>
                      <p className="mb-0 fs-15">+91 9876789098</p>
                    </div>
                  </div>
                </div>
              </Col>
              <Col lg={6}>
                <ListGroup variant="flush">
                  <ListGroupItem className="d-flex justify-content-between align-items-center">
                    <strong>Business Type</strong>
                    <span className="text-danger-emphasis">Movie Making</span>
                  </ListGroupItem>

                  <ListGroupItem className="d-flex justify-content-between align-items-center">
                    <strong>Registration Number</strong>
                    <span className="text-danger-emphasis">12345678890</span>
                  </ListGroupItem>

                  <ListGroupItem className="d-flex justify-content-between align-items-center">
                    <strong>GST Number</strong>
                    <span className="text-danger-emphasis">GSTIN9876578</span>
                  </ListGroupItem>

                  <ListGroupItem className="d-flex justify-content-between align-items-center">
                    <strong>PAN Number</strong>
                    <span className="text-danger-emphasis">PAN9876578</span>
                  </ListGroupItem>

                  <ListGroupItem className="d-flex justify-content-between align-items-center">
                    <strong>Status</strong>
                    <span className="text-danger-emphasis bg-success-subtle p-1 px-2 rounded-1">Approved</span>
                  </ListGroupItem>

                  <ListGroupItem className="d-flex justify-content-between align-items-center">
                    <strong>Purchase Plan</strong>
                    <span className="text-danger-emphasis bg-success-subtle p-1 px-2 rounded-1">Silver</span>
                  </ListGroupItem>
                </ListGroup>
              </Col>
            </Row>
            <hr className="my-4" />
            <CardTitle as={'h4'} className="mb-2">
              KYC Details :
            </CardTitle>

            <CardTitle as={'h4'} className="mt-3 mb-2">
              Aadhar Card :
            </CardTitle>
            <div className="d-flex gap-5">
              <Image src={adharfront} alt="Aadhar-card" className="avatar-xxl flex-shrink-0" />
              <Image src={adharback} alt="Aadhar-card" className="avatar-xxl flex-shrink-0" />
            </div>
            <CardTitle as={'h4'} className="my-2">
              Pan Card Details :
            </CardTitle>
            <Image src={pan} alt="Aadhar-card" className="avatar-xxl flex-shrink-0" />
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default VendorDetails
