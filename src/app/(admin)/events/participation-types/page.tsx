import PageTitle from '@/components/PageTItle'
import ParticipationTypesList from './components/ParticipationTypesList'

export const metadata = { title: 'Event Participation Types' }

const ParticipationTypesPage = () => {
  return (
    <>
      <PageTitle title="Event Participation Types" />
      <ParticipationTypesList />
    </>
  )
}

export default ParticipationTypesPage
