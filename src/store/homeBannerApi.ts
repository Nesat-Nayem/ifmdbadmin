import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

export interface IHomeBanner {
  _id: string
  title?: string
  order?: number
  image: string
  isActive: boolean
  status: 'active' | 'inactive' | string
  createdAt: string
  updatedAt: string
}

interface HomeBannerResponse {
  success: boolean
  statusCode: number
  message: string
  data: IHomeBanner | IHomeBanner[]
}

export const homeBannerApi = createApi({
  reducerPath: 'homeBannerApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://api.moviemart.org/v1/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as IRootState).auth.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`) // add space after Bearer
      }
      return headers
    },
  }),
  tagTypes: ['homeBanner'],
  endpoints: (builder) => ({
    getHomeBanner: builder.query<IHomeBanner[], void>({
      query: () => '/banners',
      transformResponse: (response: HomeBannerResponse) => (Array.isArray(response.data) ? response.data : [response.data]),
      providesTags: ['homeBanner'],
    }),

    getHomeBannerById: builder.query<IHomeBanner, string>({
      query: (id) => `/banners/${id}`,
      transformResponse: (response: HomeBannerResponse) => response.data as IHomeBanner,
      providesTags: (result, error, id) => [{ type: 'homeBanner', id }],
    }),

    createHomeBanner: builder.mutation<IHomeBanner, FormData>({
      query: (formData) => ({
        url: '/banners',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: HomeBannerResponse) => response.data as IHomeBanner,
      invalidatesTags: ['homeBanner'],
    }),

    updateHomeBanner: builder.mutation<IHomeBanner, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/banners/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: HomeBannerResponse) => response.data as IHomeBanner,
      invalidatesTags: (result, error, { id }) => [{ type: 'homeBanner', id }, 'homeBanner'],
    }),

    deleteHomeBanner: builder.mutation<IHomeBanner, string>({
      query: (id) => ({
        url: `/banners/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: HomeBannerResponse) => response.data as IHomeBanner,
      invalidatesTags: ['homeBanner'],
    }),
  }),
})

export const {
  useGetHomeBannerQuery,
  useGetHomeBannerByIdQuery,
  useCreateHomeBannerMutation,
  useUpdateHomeBannerMutation,
  useDeleteHomeBannerMutation,
} = homeBannerApi
