import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState as IRootState } from '@/store'

// Types
export interface IVendorPackage {
  _id: string
  name: string
  description: string
  price: number
  duration: number
  durationType: 'days' | 'months' | 'years'
  features: string[]
  serviceType: 'film_trade'
  isPopular: boolean
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface IPlatformSetting {
  _id: string
  key: string
  value: number
  label: string
  description: string
  updatedAt: string
}

export interface ISelectedService {
  serviceType: 'film_trade' | 'events' | 'movie_watch'
  packageId?: string
  packageName?: string
  packagePrice?: number
  platformFee?: number
}

export interface IPaymentInfo {
  transactionId?: string
  amount: number
  status: 'pending' | 'completed' | 'failed'
  paymentMethod?: string
  paidAt?: string
}

export interface IVendorApplication {
  _id: string
  userId?: string
  vendorName: string
  businessType: string
  gstNumber?: string
  country: string
  address: string
  email: string
  phone: string
  // India specific KYC
  aadharFrontUrl?: string
  aadharBackUrl?: string
  panImageUrl?: string
  // International KYC
  nationalIdUrl?: string
  passportUrl?: string
  selectedServices: ISelectedService[]
  paymentInfo?: IPaymentInfo
  requiresPayment: boolean
  totalAmount: number
  status: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
  vendorUserId?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
}

interface ApiResponse<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
}

export const vendorApi = createApi({
  reducerPath: 'vendorApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.moviemart.orgv1/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as IRootState).auth.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['VendorPackage', 'PlatformSetting', 'VendorApplication'],
  endpoints: (builder) => ({
    // ============ PACKAGES ============
    getVendorPackages: builder.query<IVendorPackage[], { activeOnly?: boolean } | void>({
      query: (params) => ({
        url: '/vendors/packages',
        params: params || {},
      }),
      transformResponse: (response: ApiResponse<IVendorPackage[]>) => response.data,
      providesTags: ['VendorPackage'],
    }),

    getVendorPackageById: builder.query<IVendorPackage, string>({
      query: (id) => `/vendors/packages/${id}`,
      transformResponse: (response: ApiResponse<IVendorPackage>) => response.data,
      providesTags: (result, error, id) => [{ type: 'VendorPackage', id }],
    }),

    createVendorPackage: builder.mutation<IVendorPackage, Partial<IVendorPackage>>({
      query: (data) => ({
        url: '/vendors/packages',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<IVendorPackage>) => response.data,
      invalidatesTags: ['VendorPackage'],
    }),

    updateVendorPackage: builder.mutation<IVendorPackage, { id: string; data: Partial<IVendorPackage> }>({
      query: ({ id, data }) => ({
        url: `/vendors/packages/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<IVendorPackage>) => response.data,
      invalidatesTags: (result, error, { id }) => [{ type: 'VendorPackage', id }, 'VendorPackage'],
    }),

    deleteVendorPackage: builder.mutation<void, string>({
      query: (id) => ({
        url: `/vendors/packages/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['VendorPackage'],
    }),

    // ============ PLATFORM SETTINGS ============
    getPlatformSettings: builder.query<IPlatformSetting[], void>({
      query: () => '/vendors/settings',
      transformResponse: (response: ApiResponse<IPlatformSetting[]>) => response.data,
      providesTags: ['PlatformSetting'],
    }),

    updatePlatformSetting: builder.mutation<IPlatformSetting, { key: string; value: number }>({
      query: (data) => ({
        url: '/vendors/settings',
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<IPlatformSetting>) => response.data,
      invalidatesTags: ['PlatformSetting'],
    }),

    // ============ VENDOR APPLICATIONS ============
    getVendorApplications: builder.query<IVendorApplication[], { status?: string } | void>({
      query: (params) => ({
        url: '/vendors/applications',
        params: params || {},
      }),
      transformResponse: (response: ApiResponse<IVendorApplication[]>) => response.data,
      providesTags: ['VendorApplication'],
    }),

    getVendorApplicationById: builder.query<IVendorApplication, string>({
      query: (id) => `/vendors/applications/${id}`,
      transformResponse: (response: ApiResponse<IVendorApplication>) => response.data,
      providesTags: (result, error, id) => [{ type: 'VendorApplication', id }],
    }),

    approveVendorApplication: builder.mutation<IVendorApplication, string>({
      query: (id) => ({
        url: `/vendors/applications/${id}/decision`,
        method: 'PATCH',
        body: { decision: 'approve' },
      }),
      transformResponse: (response: ApiResponse<IVendorApplication>) => response.data,
      invalidatesTags: ['VendorApplication'],
    }),

    rejectVendorApplication: builder.mutation<IVendorApplication, { id: string; rejectionReason: string }>({
      query: ({ id, rejectionReason }) => ({
        url: `/vendors/applications/${id}/decision`,
        method: 'PATCH',
        body: { decision: 'reject', rejectionReason },
      }),
      transformResponse: (response: ApiResponse<IVendorApplication>) => response.data,
      invalidatesTags: ['VendorApplication'],
    }),

    deleteVendorApplication: builder.mutation<void, string>({
      query: (id) => ({
        url: `/vendors/applications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['VendorApplication'],
    }),
  }),
})

export const {
  // Packages
  useGetVendorPackagesQuery,
  useGetVendorPackageByIdQuery,
  useCreateVendorPackageMutation,
  useUpdateVendorPackageMutation,
  useDeleteVendorPackageMutation,
  // Settings
  useGetPlatformSettingsQuery,
  useUpdatePlatformSettingMutation,
  // Applications
  useGetVendorApplicationsQuery,
  useGetVendorApplicationByIdQuery,
  useApproveVendorApplicationMutation,
  useRejectVendorApplicationMutation,
  useDeleteVendorApplicationMutation,
} = vendorApi
