import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import LoginPage from './pages/LoginPage'
import AcceptInvitePage from './pages/AcceptInvitePage'
import ProtectedRoute from './components/ProtectedRoute'
import PublicOnlyRoute from './components/PublicOnlyRoute'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import AdminCamerasPage from './pages/AdminCamerasPage'
import AdminCameraEditPage from './pages/AdminCameraEditPage'
import { ToastProvider } from './components/ui/Toast'

function App() {
  return (
    <ToastProvider>
    <BrowserRouter>
      <Routes>
        {/* Public-only routes — redirect to / if already logged in */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/accept-invite" element={<AcceptInvitePage />} />
        </Route>

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/admin/manage" element={<AdminPage />} />
          <Route path="/admin/manage/cameras" element={<AdminCamerasPage />} />
          <Route path="/admin/manage/cameras/:id" element={<AdminCameraEditPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </ToastProvider>
  )
}

export default App
