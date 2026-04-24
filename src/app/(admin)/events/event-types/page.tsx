import PageTitle from '@/components/PageTItle'
import EventTypesList from './components/EventTypesList'

export const metadata = { title: 'Event Types' }

const EventTypesPage = () => {
  return (
    <>
      <PageTitle title="Event Types" />
      <EventTypesList />
    </>
  )
}

export default EventTypesPage
