/*
 * FILE SUMMARY — src/App.tsx
 *
 * Root application component. Defines the entire client-side route tree using
 * React Router v7.
 *
 * App() — The sole exported component. Renders:
 *   - <ToastProvider> wrapping the whole tree so toast notifications are
 *     available on every page.
 *   - <BrowserRouter> with two route groups:
 *       • Public-only routes (wrapped in <PublicOnlyRoute>): /login and
 *         /accept-invite. Authenticated users visiting these are redirected to
 *         the dashboard.
 *       • Protected routes (wrapped in <ProtectedRoute>): /, /admin/manage,
 *         /admin/manage/cameras, /admin/manage/cameras/:id, and
 *         /project/manage/:id. Unauthenticated users are redirected to /login.
 *   - A wildcard fallback <Navigate to="/" replace /> for unknown URLs.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import LoginPage from './pages/LoginPage'
import AcceptInvitePage from './pages/AcceptInvitePage'
import ProtectedRoute from './components/ProtectedRoute'
import PublicOnlyRoute from './components/PublicOnlyRoute'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import AdminCamerasPage from './pages/AdminCamerasPage'
import AdminCameraEditPage from './pages/AdminCameraEditPage'
import ProjectManagePage from './pages/ProjectManagePage'
import ProjectMapViewPagenew from './pages/ProjectMapViewPagenew'
import { ToastProvider } from './components/ui/Toast'
import ThemeProvider from './context/ThemeProvider'

function App() {
  return (
    <ThemeProvider>
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
              <Route path="/project/manage/:id" element={<ProjectManagePage />} />
              <Route path="/projects/:id" element={<ProjectMapViewPagenew />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App

