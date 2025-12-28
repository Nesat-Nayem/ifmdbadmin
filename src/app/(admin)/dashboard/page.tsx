import { Row } from 'react-bootstrap'
import { Metadata } from 'next'
import DashboardStats from './components/DashboardStats'

export const metadata: Metadata = { title: 'Dashboard | Film Mart Admin' }

const DashboardPage = () => {
  return (
    <>
      <DashboardStats />
    </>
  )
}

export default DashboardPage
