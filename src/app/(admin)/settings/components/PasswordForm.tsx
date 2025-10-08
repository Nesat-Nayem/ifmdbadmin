'use client'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useState } from 'react'
import { Row, Col, Button, InputGroup, Card, CardHeader, CardBody, CardTitle } from 'react-bootstrap'
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai' // 👈 import react-icons

const PasswordForm = ({ handleSave, isUpdating }: any) => {
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <form onSubmit={handleSave}>
      <Card>
        <CardHeader>
          <CardTitle as={'h4'} className="d-flex align-items-center gap-1">
            <IconifyIcon icon="solar:settings-bold-duotone" className="text-primary fs-20" />
            Password Settings
          </CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={4}>
              <div className="mb-3">
                <label className="form-label">Old Password</label>
                <InputGroup>
                  <input type={showOld ? 'text' : 'password'} name="oldPassword" className="form-control" />
                  <Button variant="outline-secondary" type="button" onClick={() => setShowOld(!showOld)}>
                    {showOld ? <AiFillEyeInvisible size={18} /> : <AiFillEye size={18} />}
                  </Button>
                </InputGroup>
              </div>
            </Col>

            <Col lg={4}>
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <InputGroup>
                  <input type={showNew ? 'text' : 'password'} name="newPassword" className="form-control" />
                  <Button variant="outline-secondary" type="button" onClick={() => setShowNew(!showNew)}>
                    {showNew ? <AiFillEyeInvisible size={18} /> : <AiFillEye size={18} />}
                  </Button>
                </InputGroup>
              </div>
            </Col>

            <Col lg={4}>
              <div className="mb-3">
                <label className="form-label">Confirm Password</label>
                <InputGroup>
                  <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" className="form-control" />
                  <Button variant="outline-secondary" type="button" onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <AiFillEyeInvisible size={18} /> : <AiFillEye size={18} />}
                  </Button>
                </InputGroup>
              </div>
            </Col>

            <Col lg={12} className="text-end">
              <Button type="submit" variant="success" disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </form>
  )
}

export default PasswordForm
