import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  token: string | null
  user: any | null
  isAuthenticated: boolean
}

// Helper to get initial state from localStorage
const getInitialState = (): AuthState => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken')
    const userStr = localStorage.getItem('authUser')
    const user = userStr ? JSON.parse(userStr) : null
    
    if (token) {
      return {
        token,
        user,
        isAuthenticated: true,
      }
    }
  }
  
  return {
    token: null,
    user: null,
    isAuthenticated: false,
  }
}

const initialState: AuthState = getInitialState()

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; user: any }>) => {
      state.token = action.payload.token
      state.user = action.payload.user
      state.isAuthenticated = true
      
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', action.payload.token)
        localStorage.setItem('authUser', JSON.stringify(action.payload.user))
      }
    },
    logout: (state) => {
      state.token = null
      state.user = null
      state.isAuthenticated = false
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')
      }
    },
    // Hydrate state from localStorage (for SSR)
    hydrateAuth: (state) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken')
        const userStr = localStorage.getItem('authUser')
        const user = userStr ? JSON.parse(userStr) : null
        
        if (token) {
          state.token = token
          state.user = user
          state.isAuthenticated = true
        }
      }
    },
  },
})

export const { setCredentials, logout, hydrateAuth } = authSlice.actions

export default authSlice.reducer
