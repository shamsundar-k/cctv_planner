import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import LoginPage from './pages/LoginPage'
import AcceptInvitePage from './pages/AcceptInvitePage'
import ProtectedRoute from './components/ProtectedRoute'
import PublicOnlyRoute from './components/PublicOnlyRoute'
import DashboardPage from './pages/DashboardPage'

function App() {
  return (
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
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
