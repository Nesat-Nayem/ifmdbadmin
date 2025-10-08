import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface ILocation {
  venueName: string
  address: string
  city: string
  state: string
  postalCode: string
  latitude: number
  longitude: number
}

export interface IPerformer {
  name: string
  type: 'artist' | 'comedian' | 'band' | string
  image: string
  bio: string
}

export interface IOrganizer {
  name: string
  email: string
  phone: string
  logo: string
}

export interface IEvents {
  _id: string
  title: string
  description: string
  eventType: string
  category: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  location: ILocation
  ticketPrice: number
  totalSeats: number
  availableSeats: number
  posterImage: string
  galleryImages: string[]
  performers: IPerformer[]
  organizers: IOrganizer[]
  tags: string[]
  status: 'upcoming' | 'ongoing' | 'completed' | string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface EventsResponse {
  success: boolean
  statusCode: number
  message: string
  data: IEvents | IEvents[]
}

export const eventsApi = createApi({
  reducerPath: 'eventsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://ifmdb.vercel.app/v1/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as IRootState).auth?.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Events'],
  endpoints: (builder) => ({
    getEvents: builder.query<IEvents[], void>({
      query: () => '/events',
      transformResponse: (response: EventsResponse) => (Array.isArray(response.data) ? response.data : [response.data]),
      providesTags: ['Events'],
    }),

    getEventsById: builder.query<IEvents, string>({
      query: (id) => `/events/${id}`,
      transformResponse: (response: EventsResponse) => response.data as IEvents,
      providesTags: (result, error, id) => [{ type: 'Events', id }],
    }),

    createEvents: builder.mutation<IEvents, Partial<IEvents>>({
      query: (newEvent) => ({
        url: 'events',
        method: 'POST',
        body: newEvent, // plain JSON
        headers: {
          'Content-Type': 'application/json', // make sure JSON is sent
        },
      }),
      transformResponse: (response: EventsResponse) => response.data as IEvents,
      invalidatesTags: ['Events'],
    }),

    updateEvents: builder.mutation<IEvents, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `events/${id}`,
        method: 'PUT',
        body: data, // FormData
        // DO NOT set headers: { 'Content-Type': 'multipart/form-data' }
        // let the browser handle it
      }),
      transformResponse: (response: EventsResponse) => response.data as IEvents,
      invalidatesTags: (result, error, { id }) => [{ type: 'Events', id }, 'Events'],
    }),

    deleteEvents: builder.mutation<IEvents, string>({
      query: (id) => ({
        url: `events/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: EventsResponse) => response.data as IEvents,
      invalidatesTags: ['Events'],
    }),
  }),
})

export const { useGetEventsQuery, useGetEventsByIdQuery, useCreateEventsMutation, useUpdateEventsMutation, useDeleteEventsMutation } = eventsApi
