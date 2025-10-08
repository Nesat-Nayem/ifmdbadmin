import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from '@/store/apiSlice'
import authSlice from '@/store/authSlice'
import { moviesApi } from './moviesApi'
import { eventsApi } from './eventsApi'
import { moviesBookingsApi } from './movieBookings'
import { eventesTicketBookingsAPI } from './eventsBookings'
import { onboardingApi } from './onBoardingApi'
import { categoryApi } from './categoryApi'
import { homeBannerApi } from './homeBannerApi'
import { advertiseApi } from './advertiseApi'
import { enquiryApi } from './enquiryApi'
import { helpCenterApi } from './helpCenterApi'
import { privacyPolicyApi } from './privacyPolicyApi'
import { termsConditionsApi } from './termsConditionsApi'
import { faqApi } from './faqApi'
import { generalSettingsApi } from './generalSettingsApi'
import { subscriptionPlanApi } from './subscriptionPlanApi'
import { movieCategoryApi } from './movieCategory'
import { uploadApi } from './uploadApi'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    [apiSlice.reducerPath]: apiSlice.reducer,
    [moviesApi.reducerPath]: moviesApi.reducer,
    [eventsApi.reducerPath]: eventsApi.reducer,
    [moviesBookingsApi.reducerPath]: moviesBookingsApi.reducer,
    [eventesTicketBookingsAPI.reducerPath]: eventesTicketBookingsAPI.reducer,
    [onboardingApi.reducerPath]: onboardingApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [homeBannerApi.reducerPath]: homeBannerApi.reducer,
    [advertiseApi.reducerPath]: advertiseApi.reducer,
    [enquiryApi.reducerPath]: enquiryApi.reducer,
    [helpCenterApi.reducerPath]: helpCenterApi.reducer,
    [privacyPolicyApi.reducerPath]: privacyPolicyApi.reducer,
    [termsConditionsApi.reducerPath]: termsConditionsApi.reducer,
    [faqApi.reducerPath]: faqApi.reducer,
    [generalSettingsApi.reducerPath]: generalSettingsApi.reducer,
    [subscriptionPlanApi.reducerPath]: subscriptionPlanApi.reducer,
    [movieCategoryApi.reducerPath]: movieCategoryApi.reducer,
    [uploadApi.reducerPath]: uploadApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(
      apiSlice.middleware,
      moviesApi.middleware,
      eventsApi.middleware,
      moviesBookingsApi.middleware,
      eventesTicketBookingsAPI.middleware,
      onboardingApi.middleware,
      categoryApi.middleware,
      homeBannerApi.middleware,
      advertiseApi.middleware,
      enquiryApi.middleware,
      helpCenterApi.middleware,
      privacyPolicyApi.middleware,
      termsConditionsApi.middleware,
      faqApi.middleware,
      generalSettingsApi.middleware,
      subscriptionPlanApi.middleware,
      movieCategoryApi.middleware,
      uploadApi.middleware,
    ),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
