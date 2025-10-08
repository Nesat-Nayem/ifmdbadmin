'use client'

import React, { useState } from 'react'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import { Card, CardFooter, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'

const VendorList = () => {
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
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center gap-1">
            <CardTitle as="h4" className="flex-grow-1">
              Vendor List
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
                  <th style={{ whiteSpace: 'nowrap' }}>businessType</th>
                  <th style={{ whiteSpace: 'nowrap' }}>registrationNumber</th>
                  <th style={{ whiteSpace: 'nowrap' }}>gstNumber</th>
                  <th style={{ whiteSpace: 'nowrap' }}>panNumber</th>
                  <th style={{ whiteSpace: 'nowrap' }}>address</th>
                  <th style={{ whiteSpace: 'nowrap' }}>email</th>
                  <th style={{ whiteSpace: 'nowrap' }}>phone</th>
                  <th style={{ whiteSpace: 'nowrap' }}>Status</th>
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
                  <td style={{ whiteSpace: 'nowrap' }}>Movie Making</td>
                  <td style={{ whiteSpace: 'nowrap' }}>#1234564321</td>
                  <td style={{ whiteSpace: 'nowrap' }}>GSTIN098768900</td>
                  <td style={{ whiteSpace: 'nowrap' }}>PAN123456789</td>
                  <td style={{ whiteSpace: 'nowrap' }}>Mumbai</td>
                  <td style={{ whiteSpace: 'nowrap' }}>suraj@gmail.com</td>
                  <td style={{ whiteSpace: 'nowrap' }}>+91 9090909090</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <select
                      value={vendorStatus['1']}
                      onChange={(e) => handleStatusChange('1', e.target.value)}
                      className={`px-2 py-1 rounded border ${getColorClass(vendorStatus['1'])}`}>
                      <option value="active">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div className="d-flex gap-2">
                      <Link href="/vendors/vendor-details" className="btn btn-light btn-sm">
                        <IconifyIcon icon="solar:eye-broken" className="align-middle fs-18" />
                      </Link>
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
  )
}

export default VendorList
