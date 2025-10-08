'use client'
import logoDark from '@/assets/images/logo.png'
import logoLight from '@/assets/images/logo.png'
import smallImg from '@/assets/images/banner/login.jpg'
import Image from 'next/image'
import Link from 'next/link'
import { Card, Col, Row } from 'react-bootstrap'
import LoginFrom from './LoginFrom'

const SignIn = () => {
  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Card
        className="shadow-lg border-0 rounded-4 overflow-hidden w-100 my-auto"
        style={{ maxWidth: '1200px', marginInline: 'auto', maxHeight: '550px' }}>
        <Row className="g-0">
          {/* Left Side - Form */}
          <Col xxl={7} lg={7} className="d-flex align-items-center justify-content-center p-4">
            <div style={{ maxWidth: '400px', width: '100%', height: '100%' }}>
              <div className="text-center mb-4">
                <Link href="/dashboard" className="d-inline-block mb-3">
                  <Image src={logoDark} height={50} alt="logo" />
                </Link>
                <h2 className="fw-bold fs-24">Welcome Back 👋</h2>
                <p className="text-muted">Enter your email & password to access the admin panel</p>
              </div>
              <LoginFrom />
            </div>
          </Col>

          {/* Right Side - Image */}
          <Col xxl={5} lg={5} className="d-none d-lg-flex">
            <div className="position-relative w-100 h-100">
              <Image src={smallImg} alt="auth background" className="w-100 h-100 object-fit-contain" priority />
              <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-25" />
              <div className="position-absolute bottom-0 start-0 p-4 text-white">
                <h4 className="fw-bold">Secure & Reliable</h4>
                <p className="mb-0 small">Manage your movies, events & tickets easily.</p>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default SignIn
