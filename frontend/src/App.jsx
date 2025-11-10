import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
// import ProtectedRoute from './components/ProtectedRoute'

import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import NotFoundPage from './pages/NotFoundPage'

import Navbar from './components/Navbar'

function App() {
  const { checkAuth, user } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  console.log({ user })

  return (
    <div data-theme="">
      <Navbar />
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <LoginPage />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/" /> : <SignUpPage />}
        />
        <Route
          path="/"
          element={user ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={user ? <ProfilePage /> : <Navigate to="/login" />}
        />
        <Route path="/settings" element={<SettingsPage />} />
        {/* Route 404*/}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )

  // return (
  //   <Routes>
  //     <Route
  //       path="/login"
  //       element={user ? <Navigate to="/" /> : <LoginPage />}
  //     />
  //     <Route
  //       path="/signup"
  //       element={user ? <Navigate to="/" /> : <SignUpPage />}
  //     />

  //     <Route
  //       path="/"
  //       element={
  //         <ProtectedRoute>
  //           <HomePage />
  //         </ProtectedRoute>
  //       }
  //     />

  //     <Route
  //       path="/profile"
  //       element={
  //         <ProtectedRoute>
  //           <ProfilePage />
  //         </ProtectedRoute>
  //       }
  //     />

  //     <Route
  //       path="/settings"
  //       element={
  //         <ProtectedRoute>
  //           <SettingsPage />
  //         </ProtectedRoute>
  //       }
  //     />

  //     {/* Route 404*/}
  //     <Route path="*" element={<NotFoundPage />} />
  //   </Routes>
  // )
}

export default App
