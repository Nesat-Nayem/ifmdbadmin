'use client'

import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { hydrateAuth } from '@/store/authSlice'

// Component to hydrate auth state on mount
function AuthHydrator({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(hydrateAuth())
  }, [])
  
  return <>{children}</>
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthHydrator>{children}</AuthHydrator>
    </Provider>
  )
}
