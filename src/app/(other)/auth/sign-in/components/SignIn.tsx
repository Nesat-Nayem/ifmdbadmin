'use client'
import defaultLogo from '@/assets/images/logo.png'
import smallImg from '@/assets/images/banner/login.jpg'
import Image from 'next/image'
import Link from 'next/link'
import { Card, Col, Row } from 'react-bootstrap'
import LoginFrom from './LoginFrom'
import { useGetGeneralSettingsQuery } from '@/store/generalSettingsApi'

const SignIn = () => {
  const { data: generalSettings } = useGetGeneralSettingsQuery()
  
  // Use dynamic logo from settings or fallback to default
  const logoUrl = generalSettings?.logo || defaultLogo
  const isExternal = typeof logoUrl === 'string' && (logoUrl.includes('cloudinary') || logoUrl.includes('http'))

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
                  <Image src={logoUrl} height={50} width={50} alt="logo" unoptimized={isExternal} />
                </Link>
                <h2 className="fw-bold fs-24">Welcome Back 👋</h2>
                <p className="text-muted">Enter your email & password to access the panel</p>
              </div>
              <LoginFrom />
            </div>
          </Col>

          {/* Right Side - Image/Branding */}
          <Col xxl={5} lg={5} className="d-none d-lg-flex">
            <div className="position-relative w-100 h-100 bg-primary bg-opacity-10 d-flex align-items-center justify-content-center">
              <div className="text-center p-5">
                <Image src={logoUrl} alt="Film Mart Logo" className="mb-4" width={150} height={150} unoptimized={isExternal} />
                <h3 className="fw-bold text-primary mb-3">Film Mart Admin</h3>
                <p className="text-muted mb-0">The ultimate destination for movie trade, event bookings, and digital cinema management.</p>
                <div className="mt-4 pt-2">
                  <span className="badge bg-soft-primary text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill">
                    Secure & Professional
                  </span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default SignIn
