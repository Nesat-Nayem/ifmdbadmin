'use client'
import ChoicesFormInput from '@/components/form/ChoicesFormInput'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import TextFormInput from '@/components/form/TextFormInput'
import { yupResolver } from '@hookform/resolvers/yup'
import React from 'react'
import * as yup from 'yup'
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from 'react-bootstrap'
import { Control, FieldPath, FieldValues, useForm } from 'react-hook-form'
import Link from 'next/link'

type controlType = {
  control: Control<any>
}

const GeneralInformationCard = ({ control }: controlType) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle as={'h4'}>Add Category</CardTitle>
      </CardHeader>
      <CardBody>
        <Row>
          <Col lg={6}>
            <div className="mb-3">
              <TextFormInput control={control} name="title" label="Category Name" placeholder="Enter Name" />
            </div>
          </Col>
          <Col lg={6}>
            <label htmlFor="crater" className="form-label">
              Status
            </label>
            <ChoicesFormInput className="form-control" id="crater" data-choices data-choices-groups data-placeholder="Select Crater">
              <option defaultValue={''}>Select Status</option>
              <option value="Active">Active</option>
              <option value="InActive">InActive</option>
            </ChoicesFormInput>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

const EventsAddCategory = () => {
  const messageSchema = yup.object({
    title: yup.string().required('Please enter title'),
    description2: yup.string().required('Please enter description'),
    meta: yup.string().required('Please enter meta title'),
    metaTag: yup.string().required('Please enter meta tag'),
  })

  const { reset, handleSubmit, control } = useForm({
    resolver: yupResolver(messageSchema),
  })
  return (
    <form onSubmit={handleSubmit(() => {})}>
      <GeneralInformationCard control={control} />

      <div className="p-3 bg-light mb-3 rounded">
        <Row className="justify-content-end g-2">
          <Col lg={2}>
            <Button variant="success" type="submit" className=" w-100">
              Save
            </Button>
          </Col>
        </Row>
      </div>
    </form>
  )
}

export default EventsAddCategory
