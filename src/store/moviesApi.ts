import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

// Interfaces
export interface ICastCrew {
  name: string
  role: string // actor | director | writer etc.
  characterName: string
  profileImage: string
  bio: string
  isMainCast: boolean
}

export interface IReview {
  userId: string
  userName: string
  userImage: string
  rating: number
  reviewText: string
  isVerified: boolean
  helpfulCount: number
  createdAt: string
}

export interface ICast {
  name: string
  type: string
  image: string
}

export interface ICrew {
  name: string
  designation: string
  image: string
}

export interface ICompany {
  productionHouse: string
  website: string
  address: string
  state: string
  phone: string
  email: string
}

export interface IMovies {
  _id: string
  title: string
  originalTitle: string
  description: string
  releaseDate: string
  duration: number
  genres: string[]
  languages: string[]
  originalLanguage: string
  rating: string
  imdbRating: number
  rottenTomatoesRating: number
  posterUrl: string
  backdropUrl: string
  trailerUrl: string
  galleryImages: string[]
  budget: number
  boxOffice: number
  country: string
  productionCompanies: string[]
  distributors: string[]
  castCrew: ICastCrew[]
  reviews: IReview[]
  averageRating: number
  totalReviews: number
  formats: string[]
  status: string
  isActive: boolean
  tags: string[]
  awards: string[]
  director: string
  producer: string
  productionCost: number
  uaCertification: string
  company: ICompany
  cast: ICast[]
  crew: ICrew[]
  website?: string // keep optional if API sometimes doesn’t send it
  createdAt: string
  updatedAt: string
}

interface MoviesResponse {
  success: boolean
  statusCode: number
  message: string
  data: IMovies | IMovies[]
}

export const moviesApi = createApi({
  reducerPath: 'moviesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://ifmdb.vercel.app/v1/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as IRootState).auth.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Movies'],
  endpoints: (builder) => ({
    getMovies: builder.query<IMovies[], void>({
      query: () => '/movies',
      transformResponse: (response: MoviesResponse) => (Array.isArray(response.data) ? response.data : [response.data]),
      providesTags: ['Movies'],
    }),

    getMoviesById: builder.query<IMovies, string>({
      query: (id) => `/movies/${id}`,
      transformResponse: (response: MoviesResponse) => response.data as IMovies,
      providesTags: (result, error, id) => [{ type: 'Movies', id }],
    }),

    createMovie: builder.mutation<IMovies, Partial<IMovies>>({
      query: (data) => ({
        url: '/movies',
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      transformResponse: (response: MoviesResponse) => response.data as IMovies,
      invalidatesTags: ['Movies'],
    }),

    updateMovie: builder.mutation<IMovies, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/movies/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: MoviesResponse) => response.data as IMovies,
      invalidatesTags: (result, error, { id }) => [{ type: 'Movies', id }, 'Movies'],
    }),

    updateMovieJson: builder.mutation<IMovies, { id: string; data: Partial<IMovies> }>({
      query: ({ id, data }) => ({
        url: `/movies/${id}`,
        method: 'PUT',
        body: data,
        headers: { 'Content-Type': 'application/json' },
      }),
      transformResponse: (response: MoviesResponse) => response.data as IMovies,
      invalidatesTags: (result, error, { id }) => [{ type: 'Movies', id }, 'Movies'],
    }),

    deleteMovie: builder.mutation<IMovies, string>({
      query: (id) => ({
        url: `/movies/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: MoviesResponse) => response.data as IMovies,
      invalidatesTags: ['Movies'],
    }),
  }),
})

export const {
  useGetMoviesQuery,
  useGetMoviesByIdQuery,
  useCreateMovieMutation,
  useUpdateMovieMutation,
  useUpdateMovieJsonMutation,
  useDeleteMovieMutation,
} = moviesApi
