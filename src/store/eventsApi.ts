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

export interface ISeatType {
  name: string
  price: number
  totalSeats: number
  availableSeats: number
}

export interface IEvents {
  _id: string
  title: string
  description: string
  eventType: string
  category: string
  categoryId?: string
  language: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  location: ILocation
  ticketPrice: number
  totalSeats: number
  availableSeats: number
  seatTypes: ISeatType[]
  maxTicketsPerPerson: number
  totalTicketsSold: number
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
    baseUrl: 'http://localhost:8080/v1/api',
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

    // Get best events this week
    getBestEventsThisWeek: builder.query<IEvents[], { page?: number; limit?: number } | void>({
      query: (params) => {
        let url = '/events/best-this-week'
        if (params) {
          const queryParams = new URLSearchParams()
          if (params.page) queryParams.append('page', String(params.page))
          if (params.limit) queryParams.append('limit', String(params.limit))
          if (queryParams.toString()) url += `?${queryParams.toString()}`
        }
        return url
      },
      transformResponse: (response: EventsResponse) => (Array.isArray(response.data) ? response.data : [response.data]),
      providesTags: ['Events'],
    }),

    // Get events by category
    getEventsByCategory: builder.query<IEvents[], { categoryId: string; page?: number; limit?: number }>({
      query: ({ categoryId, page, limit }) => {
        let url = `/events/category/${categoryId}`
        const queryParams = new URLSearchParams()
        if (page) queryParams.append('page', String(page))
        if (limit) queryParams.append('limit', String(limit))
        if (queryParams.toString()) url += `?${queryParams.toString()}`
        return url
      },
      transformResponse: (response: EventsResponse) => (Array.isArray(response.data) ? response.data : [response.data]),
      providesTags: ['Events'],
    }),

    // Get events by language
    getEventsByLanguage: builder.query<IEvents[], { language: string; page?: number; limit?: number }>({
      query: ({ language, page, limit }) => {
        let url = `/events/language/${language}`
        const queryParams = new URLSearchParams()
        if (page) queryParams.append('page', String(page))
        if (limit) queryParams.append('limit', String(limit))
        if (queryParams.toString()) url += `?${queryParams.toString()}`
        return url
      },
      transformResponse: (response: EventsResponse) => (Array.isArray(response.data) ? response.data : [response.data]),
      providesTags: ['Events'],
    }),
  }),
})

export const { 
  useGetEventsQuery, 
  useGetEventsByIdQuery, 
  useCreateEventsMutation, 
  useUpdateEventsMutation, 
  useDeleteEventsMutation,
  useGetBestEventsThisWeekQuery,
  useGetEventsByCategoryQuery,
  useGetEventsByLanguageQuery,
} = eventsApi
