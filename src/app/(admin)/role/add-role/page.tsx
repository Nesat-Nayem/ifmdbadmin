import ChoicesFormInput from '@/components/form/ChoicesFormInput'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import Link from 'next/link'
import { Button, Card, CardBody, CardFooter, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'

export const metadata: Metadata = { title: 'Role Add' }

const RoleAddPage = () => {
  return (
    <>
      <PageTItle title="ROLE ADD" />
      <Row>
        <Col lg={12}>
          <Card>
            <CardHeader>
              <CardTitle as={'h4'}>Roles Information</CardTitle>
            </CardHeader>
            <CardBody>
              <Row>
                <Col lg={4}>
                  <form>
                    <div className="mb-3">
                      <label htmlFor="roles-name" className="form-label">
                        Roles Name
                      </label>
                      <input type="text" id="roles-name" className="form-control" placeholder="Role name" />
                    </div>
                  </form>
                </Col>

                <Col lg={4}>
                  <div className="mb-3">
                    <label htmlFor="user-name" className="form-label">
                      User Name
                    </label>
                    <input type="text" id="user-name" className="form-control" placeholder="Enter name" />
                  </div>
                </Col>
                <Col lg={4}>
                  <div className="mb-3">
                    <label htmlFor="user-name" className="form-label">
                      Password
                    </label>
                    <input type="password" id="user-name" className="form-control" placeholder="Enter name" />
                  </div>
                </Col>
                <Col lg={6}>
                  <p>User Status </p>
                  <div className="d-flex gap-2 align-items-center">
                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault1" defaultChecked />
                      <label className="form-check-label" htmlFor="flexRadioDefault1">
                        Active
                      </label>
                    </div>
                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="flexRadioDefault" id="flexRadioDefault2" />
                      <label className="form-check-label" htmlFor="flexRadioDefault2">
                        In Active
                      </label>
                    </div>
                  </div>
                </Col>
              </Row>
            </CardBody>
            <CardFooter className="border-top">
              <Row className="justify-content-end g-2">
                <Col lg={2}>
                  <Button variant="success" type="submit" className="w-100">
                    Save
                  </Button>
                </Col>
              </Row>
            </CardFooter>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default RoleAddPage
