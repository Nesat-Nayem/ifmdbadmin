'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useGetGeneralSettingsQuery, useUpdateGeneralSettingsMutation } from '@/store/generalSettingsApi'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'

const GeneralSettings = () => {
  const [formData, setFormData] = useState({
    number: '',
    email: '',
    facebook: '',
    instagram: '',
    linkedin: '',
    twitter: '',
    youtube: '',
    favicon: null as File | null,
    logo: null as File | null,
  })

  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  const { data: generalSettings, isLoading, isError } = useGetGeneralSettingsQuery()
  console.log('generalSettings', generalSettings)
  const [updateGeneralSettings, { isLoading: isUpdating }] = useUpdateGeneralSettingsMutation()

  useEffect(() => {
    if (generalSettings) {
      setFormData({
        number: generalSettings.number || '',
        email: generalSettings.email || '',
        facebook: generalSettings.facebook || '',
        instagram: generalSettings.instagram || '',
        linkedin: generalSettings.linkedin || '',
        twitter: generalSettings.twitter || '',
        youtube: generalSettings.youtube || '',
        favicon: null,
        logo: null,
      })
    }
  }, [generalSettings])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const data = new FormData()

      // Append normal fields
      data.append('number', formData.number)
      data.append('email', formData.email)
      data.append('facebook', formData.facebook)
      data.append('instagram', formData.instagram)
      data.append('linkedin', formData.linkedin)
      data.append('twitter', formData.twitter)
      data.append('youtube', formData.youtube)

      // Append files only if selected
      if (formData.favicon) {
        data.append('favicon', formData.favicon)
      }
      if (formData.logo) {
        data.append('logo', formData.logo)
      }

      await updateGeneralSettings(data).unwrap()

      showMessage('General Settings updated successfully', 'success')
    } catch (error) {
      console.error('Error updating General Settings:', error)
      showMessage('Failed to update General Settings', 'error')
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error loading General Settings</div>

  return (
    <>
      <Row>
        <Col lg={12}>
          <Card>
            <CardHeader>
              <CardTitle as={'h4'} className="d-flex align-items-center gap-1">
                <IconifyIcon icon="solar:settings-bold-duotone" className="text-primary fs-20" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSave}>
                <Row>
                  <Col lg={6}>
                    <div className="mb-3">
                      <label className="form-label">Mobile Number</label>
                      <input type="text" name="number" value={formData.number} onChange={handleChange} className="form-control" />
                    </div>
                  </Col>

                  <Col lg={6}>
                    <div className="mb-3">
                      <label className="form-label">Email Address</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control" />
                    </div>
                  </Col>

                  <Col lg={6}>
                    <div className="mb-3">
                      <label className="form-label">Facebook</label>
                      <input type="url" name="facebook" value={formData.facebook} onChange={handleChange} className="form-control" />
                    </div>
                  </Col>

                  <Col lg={6}>
                    <div className="mb-3">
                      <label className="form-label">Instagram</label>
                      <input type="url" name="instagram" value={formData.instagram} onChange={handleChange} className="form-control" />
                    </div>
                  </Col>

                  <Col lg={6}>
                    <div className="mb-3">
                      <label className="form-label">LinkedIn</label>
                      <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} className="form-control" />
                    </div>
                  </Col>

                  <Col lg={6}>
                    <div className="mb-3">
                      <label className="form-label">Twitter</label>
                      <input type="url" name="twitter" value={formData.twitter} onChange={handleChange} className="form-control" />
                    </div>
                  </Col>

                  <Col lg={6}>
                    <div className="mb-3">
                      <label className="form-label">YouTube</label>
                      <input type="url" name="youtube" value={formData.youtube} onChange={handleChange} className="form-control" />
                    </div>
                  </Col>

                  {/* Favicon */}
                  <Col lg={6}>
                    <div className="mb-3">
                      <label className="form-label">Favicon</label>
                      <input type="file" name="favicon" onChange={handleChange} className="form-control" />

                      {(formData.favicon || generalSettings?.favicon) && (
                        <div className="mt-2">
                          {formData.favicon ? (
                            // Local preview when user selects a new file
                            <Image
                              src={URL.createObjectURL(formData.favicon)}
                              alt="Favicon preview"
                              width={40}
                              height={40}
                              style={{ borderRadius: 4 }}
                            />
                          ) : (
                            // Existing favicon from API
                            <Image src={generalSettings?.favicon ?? ''} alt="Favicon preview" width={40} height={40} style={{ borderRadius: 4 }} />
                          )}
                        </div>
                      )}
                    </div>
                  </Col>

                  {/* Logo */}
                  {/* Logo */}
                  <Col lg={6}>
                    <div className="mb-3">
                      <label className="form-label">Logo</label>
                      <input type="file" name="logo" onChange={handleChange} className="form-control" />

                      {(formData.logo || generalSettings?.logo) && (
                        <div className="mt-2">
                          {formData.logo ? (
                            // Local file preview
                            <Image
                              src={URL.createObjectURL(formData.logo)}
                              alt="Logo preview"
                              width={200}
                              height={60}
                              style={{ borderRadius: 4, objectFit: 'contain' }}
                            />
                          ) : (
                            // Existing logo from API
                            <Image
                              src={generalSettings?.logo ?? ''}
                              alt="Logo preview"
                              width={200}
                              height={60}
                              className="img-fluid"
                              style={{ objectFit: 'contain' }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </Col>

                  <Col lg={12} className="text-end">
                    <Button type="submit" variant="success" disabled={isUpdating}>
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Col>
                </Row>
              </form>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Toast Notification */}
      {showToast && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
          <div className={`toast show text-white bg-${toastVariant === 'error' ? 'danger' : 'success'}`}>
            <div className="d-flex">
              <div className="toast-body">{toastMessage}</div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setShowToast(false)}></button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default GeneralSettings
