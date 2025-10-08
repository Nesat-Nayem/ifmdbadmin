'use client'

import React, { useState } from 'react'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import { Card, CardFooter, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'

const VendorPaymentList = () => {
  // Sample single vendor — in real case, map over an array
  const [vendorStatus, setVendorStatus] = useState<{ [id: string]: string }>({
    '1': 'active',
  })

  const getColorClass = (value: string) => {
    switch (value) {
      case 'active':
        return 'bg-green-100 text-green-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-700'
      default:
        return ''
    }
  }

  const handleStatusChange = (id: string, value: string) => {
    setVendorStatus((prev) => ({ ...prev, [id]: value }))
  }

  return (
    <>
      <Row className="my-3">
        <Col lg={4}>
          <div style={{ border: '1px solid #ccc', padding: '10px', backgroundColor: '#fff', borderRadius: '10px', textAlign: 'center' }}>
            <h4>Total Payment</h4>
            <h3 className="text-danger">Rs.5000</h3>
          </div>
        </Col>
        <Col lg={4}>
          <div style={{ border: '1px solid #ccc', padding: '10px', backgroundColor: '#fff', borderRadius: '10px', textAlign: 'center' }}>
            <h4>Total Vendors</h4>
            <h3 className="text-danger">1000</h3>
          </div>
        </Col>
      </Row>
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center gap-1">
              <CardTitle as="h4" className="flex-grow-1">
                Vendor Payment History
              </CardTitle>
            </CardHeader>
            <div className="table-responsive">
              <table className="table align-middle mb-0 table-hover table-centered table-bordered">
                <thead className="bg-light-subtle">
                  <tr>
                    <th style={{ whiteSpace: 'nowrap' }}>
                      <div className="form-check">
                        <input type="checkbox" className="form-check-input" id="customCheck1" />
                        <label className="form-check-label" htmlFor="customCheck1" />
                      </div>
                    </th>
                    <th style={{ whiteSpace: 'nowrap' }}>vendorName</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Choose Plan</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Plan Price</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Payment Mode</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div className="form-check">
                        <input type="checkbox" className="form-check-input" id="customCheck2" />
                        <label className="form-check-label" htmlFor="customCheck2" />
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>Suraj Jamdade</td>
                    <td style={{ whiteSpace: 'nowrap' }}>Silver</td>
                    <td style={{ whiteSpace: 'nowrap' }}>Rs.5000</td>
                    <td style={{ whiteSpace: 'nowrap' }}>UPI</td>

                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div className="d-flex gap-2">
                        <Link href="" className="btn btn-soft-danger btn-sm">
                          <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <CardFooter className="border-top">
              <nav aria-label="Page navigation example">
                <ul className="pagination justify-content-end mb-0">
                  <li className="page-item">
                    <Link className="page-link" href="">
                      Previous
                    </Link>
                  </li>
                  <li className="page-item active">
                    <Link className="page-link" href="">
                      1
                    </Link>
                  </li>
                  <li className="page-item">
                    <Link className="page-link" href="">
                      2
                    </Link>
                  </li>
                  <li className="page-item">
                    <Link className="page-link" href="">
                      3
                    </Link>
                  </li>
                  <li className="page-item">
                    <Link className="page-link" href="">
                      Next
                    </Link>
                  </li>
                </ul>
              </nav>
            </CardFooter>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default VendorPaymentList
