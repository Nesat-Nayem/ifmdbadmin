import { Col, Row } from 'react-bootstrap'
import PageTItle from '@/components/PageTItle'
import { Metadata } from 'next'
import ContactList from './components/EnquiryList'
import EnquiryList from './components/EnquiryList'

export const metadata: Metadata = { title: 'Enquiry List' }

const EnquiryListPage = () => {
  return (
    <>
      <PageTItle title=" ENQUIRY LIST" />
      <Row>
        <Col xl={12}>
          <EnquiryList />
        </Col>
      </Row>
    </>
  )
}

export default EnquiryListPage
