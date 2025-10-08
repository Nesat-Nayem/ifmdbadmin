import PageTItle from '@/components/PageTItle'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { getRoleListData } from '@/helpers/data'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Fragment } from 'react'
import { Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'

export const metadata: Metadata = { title: 'Role List' }

const RoleListPage = async () => {
  const roleListData = await getRoleListData()
  return (
    <>
      <PageTItle title="ROLES LIST" />

      <Card className="overflow-hiddenCoupons">
        <CardHeader>
          <CardTitle as={'h4'}>Role List</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="table-responsive">
            <table className="table align-middle mb-0 table-hover table-centered table-bordered">
              <thead className="bg-light-subtle">
                <tr>
                  <th>Role</th>
                  <th>Users</th>
                  <th>Password</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Manager</td>
                  <td>Suraj Jamdade</td>
                  <td>123456</td>
                  <td>Active</td>
                  <td style={{ textWrap: 'nowrap' }}>
                    <div className="d-flex gap-2">
                      <Link href="/role/role-edit" className="btn btn-soft-info btn-sm">
                        <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
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
        </CardBody>
        <Row className="g-0 align-items-center justify-content-between text-center text-sm-start p-3 border-top">
          <div className="col-sm">
            <div className="text-muted">
              Showing <span className="fw-semibold">10</span> of <span className="fw-semibold">59</span> Results
            </div>
          </div>
          <Col sm={'auto'} className="mt-3 mt-sm-0">
            <ul className="pagination  m-0">
              <li className="page-item">
                <Link href="" className="page-link">
                  <IconifyIcon icon="bx:left-arrow-alt" />
                </Link>
              </li>
              <li className="page-item active">
                <Link href="" className="page-link">
                  1
                </Link>
              </li>
              <li className="page-item">
                <Link href="" className="page-link">
                  2
                </Link>
              </li>
              <li className="page-item">
                <Link href="" className="page-link">
                  3
                </Link>
              </li>
              <li className="page-item">
                <Link href="" className="page-link">
                  <IconifyIcon icon="bx:right-arrow-alt" />
                </Link>
              </li>
            </ul>
          </Col>
        </Row>
      </Card>
    </>
  )
}

export default RoleListPage
