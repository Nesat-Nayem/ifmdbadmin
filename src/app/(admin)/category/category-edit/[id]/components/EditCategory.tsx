'use client'
import ChoicesFormInput from '@/components/form/ChoicesFormInput'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { useEffect, useState } from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner, Toast, ToastContainer } from 'react-bootstrap'
import { Control, Controller, useForm } from 'react-hook-form'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useGetCategoriesByIdQuery, useUpdateCategoryMutation } from '@/store/categoryApi'
import Image from 'next/image'

type FormValues = {
  title: string
  status: string
  image?: File
}

type ControlType = {
  control: Control<FormValues>
  errors: any
  imagePreview: string | null
  setImagePreview: React.Dispatch<React.SetStateAction<string | null>>
}

const GeneralInformationCard = ({ control, errors, imagePreview, setImagePreview }: ControlType) => (
  <Card>
    <CardHeader>
      <CardTitle as={'h4'}>Edit Category</CardTitle>
    </CardHeader>
    <CardBody>
      <Row>
        <Col lg={4}>
          {/* ✅ File Input handled with Controller */}
          <Controller
            name="image"
            control={control}
            render={({ field: { onChange } }) => (
              <div className="mb-3">
                <label htmlFor="icon" className="form-label">
                  Icon
                </label>
                <input
                  type="file"
                  id="icon"
                  className="form-control"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      onChange(file)
                      setImagePreview(URL.createObjectURL(file))
                    }
                  }}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      style={{ maxWidth: '120px', maxHeight: '120px', objectFit: 'contain' }}
                      className="rounded border"
                      width={120}
                      height={120}
                    />
                  </div>
                )}
              </div>
            )}
          />
        </Col>

        <Col lg={4}>
          <div className="mb-3">
            <TextFormInput control={control} name="title" label="Category Name" placeholder="Enter Name" />
            {errors.title && <small className="text-danger">{errors.title.message}</small>}
          </div>
        </Col>

        <Col lg={4}>
          {/* ✅ Status select hooked into react-hook-form */}
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <div className="mb-3">
                <label htmlFor="status" className="form-label">
                  Status
                </label>
                <select {...field} className="form-control form-select" id="status">
                  <option value="">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="InActive">InActive</option>
                </select>
                {errors.status && <small className="text-danger">{errors.status.message}</small>}
              </div>
            )}
          />
        </Col>
      </Row>
    </CardBody>
  </Card>
)

const EditCategory = () => {
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success')
  const [showToast, setShowToast] = useState(false)

  const router = useRouter()
  const params = useParams()

  const categoryId = typeof params?.id === 'string' ? params.id : undefined
  const { data: category, isFetching, isError } = useGetCategoriesByIdQuery(categoryId!, { skip: !categoryId })

  const [updateCategory, { isLoading }] = useUpdateCategoryMutation()
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const messageSchema = yup.object({
    title: yup.string().required('Please enter title'),
    status: yup.string().required('Please select status'),
    image: yup.mixed<File>().optional(),
  })

  const {
    reset,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(messageSchema),
    defaultValues: {
      title: '',
      status: '',
      image: undefined,
    },
  })

  // ✅ Populate form with existing category
  useEffect(() => {
    if (category) {
      reset({
        title: category.title,
        status: category.status,
        image: undefined,
      })
      setImagePreview(category.image || null)
    }
  }, [category, reset])

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const onSubmit = async (values: FormValues) => {
    if (!categoryId) return

    const formData = new FormData()
    formData.append('title', values.title)
    formData.append('status', values.status)

    // Only append image if new one selected
    if (values.image instanceof File) {
      formData.append('image', values.image)
    }

    try {
      await updateCategory({ id: categoryId, data: formData }).unwrap()
      showMessage('Category updated successfully!', 'success')
      setTimeout(() => {
        router.push('/category/category-list')
      }, 1500)
    } catch (err: any) {
      console.error('Update Error:', err)
      showMessage(err?.data?.message || 'Failed to update category', 'error')
    }
  }

  if (!categoryId) return <div className="text-danger">Invalid Category ID</div>
  if (isFetching)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    )
  if (isError) return <div className="text-danger">Failed to load Category data.</div>

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <GeneralInformationCard control={control} imagePreview={imagePreview} setImagePreview={setImagePreview} errors={errors} />

        <div className="p-3 bg-light mb-3 rounded">
          <Row className="justify-content-end g-2">
            <Col lg={2}>
              <Button variant="success" type="submit" className="w-100" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Update'}
              </Button>
            </Col>
          </Row>
        </div>
      </form>

      <ToastContainer className="p-3" position="top-end" style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg={toastVariant}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

export default EditCategory
