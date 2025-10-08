import { Row } from 'react-bootstrap'
import { Metadata } from 'next'
import StatsCard from './components/Stats'

export const metadata: Metadata = { title: 'Dashboard' }

const DashboardPage = () => {
  return (
    <>
      <Row>
        <StatsCard />
      </Row>
    </>
  )
}

export default DashboardPage
