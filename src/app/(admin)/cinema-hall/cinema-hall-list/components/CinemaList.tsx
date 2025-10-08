'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { Card, CardFooter, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'

interface Cinema {
  id: number
  name: string
  country: string
  state: string
  city: string
  sublocality: string
  status: 'Active' | 'Inactive'
}

const CinemaList: React.FC = () => {
  const [cinemaList, setCinemaList] = useState<Cinema[]>([])

  useEffect(() => {
    // Simulate fetching data from API
    const fetchCinemas = async () => {
      const data: Cinema[] = [
        {
          id: 1,
          name: 'PVR',
          country: 'India',
          state: 'Maharashtra',
          city: 'Pune',
          sublocality: 'Koregaon Park',
          status: 'Active',
        },
        {
          id: 2,
          name: 'INOX',
          country: 'India',
          state: 'Maharashtra',
          city: 'Mumbai',
          sublocality: 'Andheri West',
          status: 'Inactive',
        },
        {
          id: 3,
          name: 'Carnival',
          country: 'India',
          state: 'Gujarat',
          city: 'Ahmedabad',
          sublocality: 'Navrangpura',
          status: 'Active',
        },
        {
          id: 4,
          name: 'Cinepolis',
          country: 'India',
          state: 'Delhi',
          city: 'New Delhi',
          sublocality: 'Saket',
          status: 'Active',
        },
      ]
      setCinemaList(data)
    }

    fetchCinemas()
  }, [])

  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center gap-1">
            <CardTitle as="h4" className="flex-grow-1">
              All Cinema Hall List
            </CardTitle>
            <Link href="/cinema-hall/cinema-hall-add" className="btn btn-sm btn-primary">
              Add Cinema Hall
            </Link>
          </CardHeader>

          <div className="table-responsive">
            <table className="table align-middle mb-0 table-hover table-centered">
              <thead className="bg-light-subtle">
                <tr>
                  <th style={{ width: 20 }}>
                    <div className="form-check">
                      <input type="checkbox" className="form-check-input" id="selectAll" />
                      <label className="form-check-label" htmlFor="selectAll" />
                    </div>
                  </th>
                  <th>Cinema Hall Name</th>
                  <th>Country</th>
                  <th>State</th>
                  <th>City</th>
                  <th>Sublocality / Area</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cinemaList.map((cinema) => (
                  <tr key={cinema.id}>
                    <td>
                      <div className="form-check">
                        <input type="checkbox" className="form-check-input" id={`cinemaCheck${cinema.id}`} />
                        <label className="form-check-label" htmlFor={`cinemaCheck${cinema.id}`} />
                      </div>
                    </td>
                    <td>{cinema.name}</td>
                    <td>{cinema.country}</td>
                    <td>{cinema.state}</td>
                    <td>{cinema.city}</td>
                    <td>{cinema.sublocality}</td>
                    <td className={`fw-medium ${cinema.status === 'Active' ? 'text-success' : 'text-danger'}`}>{cinema.status}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Link href="/cinema-hall/cinema-hall-view" className="btn btn-light btn-sm">
                          <IconifyIcon icon="solar:eye-broken" className="align-middle fs-18" />
                        </Link>
                        <Link href={`/cinema-hall/cinema-hall-edit`} className="btn btn-soft-primary btn-sm" title="Edit">
                          <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                        </Link>
                        <button className="btn btn-soft-danger btn-sm" title="Delete">
                          <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <CardFooter className="border-top">
            <nav aria-label="Page navigation">
              <ul className="pagination justify-content-end mb-0">
                <li className="page-item disabled">
                  <span className="page-link">Previous</span>
                </li>
                <li className="page-item active">
                  <span className="page-link">1</span>
                </li>
                <li className="page-item">
                  <span className="page-link">2</span>
                </li>
                <li className="page-item">
                  <span className="page-link">3</span>
                </li>
                <li className="page-item">
                  <span className="page-link">Next</span>
                </li>
              </ul>
            </nav>
          </CardFooter>
        </Card>
      </Col>
    </Row>
  )
}

export default CinemaList
