import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { Toaster } from 'react-hot-toast'

import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import NotFoundPage from './pages/NotFoundPage'

import Navbar from './components/Navbar'

function App() {
  const { checkAuth, user, onlineUsers } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <div data-theme="" className="flex flex-col h-screen w-screen">
      <Navbar />
      <main className="flex-1 overflow-auto bg-base-100">
        <Toaster />
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
      </main>
    </div>
  )
}

export default App
