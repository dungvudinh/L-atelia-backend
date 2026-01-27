// src/App.jsx
import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import { privateRoutes, publicRoutes } from './routes'
import authService from './services/authService'
import usePermission from './hooks/usePermission'
import Loading from './components/Loading'

// Component wrapper cho private routes
const PrivateRoute = ({ children, path }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const location = useLocation()

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated()
      setIsAuthenticated(authenticated)
    }
    
    checkAuth()
  }, [location])

  // Hiển thị loading trong khi kiểm tra
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Nếu chưa đăng nhập, redirect đến login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

// Component wrapper cho permission check
const PermissionRoute = ({ children, path }) => {
  // Map route paths đến permissions
  const getRequiredPermission = (routePath) => {
    const permissionMap = {
      '/dashboard': 'dashboard',
      '/projects': 'projects',
      '/projects/create': 'projects_create',
      '/projects/:id': 'projects_edit',
      '/projects/:id/edit': 'projects_edit',
      '/media': 'media',
      '/media/create': 'media_create', 
      '/media/:id/edit': 'media_edit',
      '/rent': 'rents',
      '/rent/create': 'rents_create',
      '/rent/:id/edit': 'rents_edit',
      '/booking': 'bookings',
      '/booking/:id': 'bookings_edit',
      '/users': 'users_manage'
    }
    
    return permissionMap[routePath] || null
  }

  const requiredPermission = getRequiredPermission(path)
  const { hasPermission, loading } = usePermission(requiredPermission)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!hasPermission) {
    return null // Hook sẽ tự động redirect đến /access-denied
  }

  return children
}

function App() {
  const location = useLocation()

  return (
    <>
      <Routes>
        {/* Public Routes (không cần đăng nhập) */}
        {publicRoutes.map((route, index) => {
          const Page = route.component
          let Layout = route.layout || MainLayout
          if (route.layout === null) {
            Layout = ({ children }) => <>{children}</>
          }
          return (
            <Route 
              key={index} 
              path={route.path} 
              element={
                <Layout routePath={route.path}>
                  <Page />
                </Layout>
              } 
            />
          )
        })}

        {/* Private Routes (cần đăng nhập và permission) */}
        {privateRoutes.map((route, index) => {
          const Page = route.component
          let Layout = route.layout || MainLayout
          if (route.layout === null) {
            Layout = ({ children }) => <>{children}</>
          }
          
          return (
            <Route 
              key={index} 
              path={route.path} 
              element={
                <PrivateRoute path={route.path}>
                  <PermissionRoute path={route.path}>
                    <Layout routePath={route.path}>
                      <Page />
                    </Layout>
                  </PermissionRoute>
                </PrivateRoute>
              } 
            />
          )
        })}

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* 404 page */}
        <Route path="*" element={
          <MainLayout>
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600 mb-8">Page not found</p>
                <button 
                  onClick={() => window.history.back()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                >
                  Go Back
                </button>
              </div>
            </div>
          </MainLayout>
        } />
      </Routes>
      <Loading />
    </>
  )
}

export default App