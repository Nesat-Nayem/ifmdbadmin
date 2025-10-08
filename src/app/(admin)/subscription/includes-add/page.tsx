import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Link from 'next/link'
import React from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Container, Row } from 'react-bootstrap'

const IncludesAdd = () => {
  return (
    <Container>
      <Card>
        <CardHeader>
          <CardTitle as={'h4'}>Create Includes</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={6}>
              <form>
                <label htmlFor="Title" className="form-label">
                  Title
                </label>
                <div className="input-group mb-3">
                  <input type="text" id="Title" className="form-control" defaultValue={''} />
                </div>
              </form>
            </Col>
          </Row>

          <Row className="justify-content-end g-2">
            <Col lg={2}>
              <Button variant="success" type="submit" className="w-100">
                Save
              </Button>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="d-flex justify-content-between align-items-center gap-1">
          <CardTitle as={'h4'} className="flex-grow-1">
            Plan Includes
          </CardTitle>
        </CardHeader>
        <CardBody>
          <div className="table-responsive">
            <table className="table align-middle mb-0 table-hover table-centered table-bordered">
              <thead className="bg-light-subtle">
                <tr>
                  <th style={{ textWrap: 'nowrap' }}>Name</th>
                  <th style={{ textWrap: 'nowrap' }}>Status</th>
                  <th style={{ textWrap: 'nowrap' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Unlimited Movie Downloads</td>
                  <td>
                    <span className="badge bg-success">Active</span>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Link href={`/subscription/includes-edit`} className="btn btn-soft-primary btn-sm">
                        <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                      </Link>
                      <button className="btn btn-soft-danger btn-sm">
                        <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </Container>
  )
}

export default IncludesAdd
