// src/utils/axiosClient.js
import axios from 'axios'
import { API_ROOT } from '../utils/constants'

const axiosClient = axios.create({
  baseURL: API_ROOT,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request Interceptor
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor - SỬA QUAN TRỌNG
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('🔴 Axios Error:', {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    })

    // CHỈ redirect nếu KHÔNG phải login request và đang ở trang khác login
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login')
      const isLoginPage = window.location.pathname === '/login'
      
      console.log('🔍 401 Check:', { isLoginRequest, isLoginPage })
      
      // Chỉ redirect nếu:
      // - KHÔNG phải request login 
      // - Và KHÔNG đang ở trang login
      if (!isLoginRequest && !isLoginPage) {
        console.log('🔄 Redirecting to login...')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      } else {
        console.log('⏸️ Skipping redirect - already on login page or login request')
        // Chỉ clear token, không redirect
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    if (status === 403 || message.includes('access denied') || message.includes('forbidden')) {
      console.log('🚫 Access denied detected, redirecting...')
      
      // Chỉ redirect nếu chưa ở trang access-denied
      if (window.location.pathname !== '/access-denied') {
        localStorage.setItem('last_attempted_url', window.location.pathname)
        window.location.href = '/access-denied'
        return Promise.reject(new Error('Access denied'))
      }
    }
    // Throw error để component xử lý
    const serverMessage = error.response?.data?.message
    if (serverMessage) {
      return Promise.reject(new Error(serverMessage))
    }
    
    return Promise.reject(error)
  }
)

export default axiosClient