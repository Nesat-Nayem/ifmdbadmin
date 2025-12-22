'use client'

import React, { useEffect, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'
import { useGetAboutUsQuery, useUpdateAboutUsMutation } from '@/store/aboutUsApi'

const AboutUsPage = () => {
  const [contentText, setContentText] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  const { data: aboutUs, isLoading, isError } = useGetAboutUsQuery()
  const [updateAboutUs, { isLoading: isUpdating }] = useUpdateAboutUsMutation()

  useEffect(() => {
    if (aboutUs) {
      setContentText(aboutUs.content)
    }
  }, [aboutUs])

  const handleChange = (value: string) => {
    setContentText(value)
  }

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const handleSave = async () => {
    try {
      await updateAboutUs({ content: contentText }).unwrap()
      showMessage('About Us updated successfully', 'success')
    } catch (error) {
      console.error('Error updating About Us:', error)
      showMessage('Failed to update About Us', 'error')
    }
  }

  if (isLoading) {
    return <div className="text-center py-5">Loading About Us...</div>
  }

  if (isError) {
    return <div className="text-center py-5 text-danger">Error loading About Us</div>
  }

  return (
    <>
      <PageTItle title="About Us" />
      <Row>
        <Col lg={12}>
          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <ReactQuill
              value={contentText}
              onChange={handleChange}
              theme="snow"
              style={{ minHeight: '300px', height: '300px', marginBottom: '3rem' }}
              modules={{
                toolbar: [
                  [{ header: [1, 2, 3, 4, 5, 6, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  [{ indent: '-1' }, { indent: '+1' }],
                  [{ color: [] }, { background: [] }],
                  ['link'],
                  ['clean'],
                ],
              }}
            />
          </div>
        </Col>
      </Row>
      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <button className="btn btn-outline-secondary w-100" onClick={handleSave} disabled={isUpdating}>
              {isUpdating ? (
                <span className="d-flex align-items-center justify-content-center">
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </Col>
        </Row>
      </div>

      {showToast && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999, top: 20, right: 20 }}>
          <div className={`toast show align-items-center text-white bg-${toastVariant === 'error' ? 'danger' : 'success'}`} role="alert">
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

export default AboutUsPage
