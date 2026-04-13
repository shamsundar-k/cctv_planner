/*
 * FILE SUMMARY — src/pages/AdminPage.tsx
 *
 * Route-level admin guard page rendered at /admin/manage. Ensures only admin
 * users can access the admin dashboard.
 *
 * AdminPage() — Reads the current user from the Zustand auth store.
 *   - On mount (and whenever the user changes), redirects non-admin users to /
 *     using useNavigate with replace:true, preventing back-navigation to the
 *     admin page.
 *   - Returns null during the redirect to avoid a flash of admin content for
 *     non-admin users.
 *   - For admin users, renders a full-screen container with <Navbar> and
 *     <AdminDashboard>.
 */
import Navbar from '../features/navigation/component/Navbar'
import AdminDashboard from '../features/admin/component/AdminDashboard'

export default function AdminPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      <Navbar />
      <AdminDashboard />
    </div>
  )
}
