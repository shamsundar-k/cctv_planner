/*
 * FILE SUMMARY — src/pages/ProjectManagePage.tsx
 *
 * Project settings page rendered at /project/manage/:id. Provides a tabbed
 * interface for editing project details, map location, and imported cameras.
 *
 * ProjectManagePage() — Reads the project id from the URL params and fetches
 *   the project via useProject(id). Handles three states:
 *   - Loading: shows animated skeleton placeholders for the header and tabs.
 *   - Error / not found: shows a "Project not found" message with a link back
 *     to the dashboard.
 *   - Loaded: renders the full tabbed settings UI.
 *
 * Tab navigation — Three tabs are available (type Tab = 'basic' | 'map' |
 *   'cameras'), each rendering the corresponding sub-component:
 *   - 'basic'   → <BasicInfoTab project={project} />
 *   - 'map'     → <MapLocationTab project={project} />
 *   - 'cameras' → <ImportedCamerasTab projectId={project.id} />
 *
 * A breadcrumb "← Dashboard" link navigates back to /.
 * The page title shows the project name.
 * If `id` is absent from params, the user is immediately redirected to /.
 */
import { useNavigate, Link } from 'react-router'
import Navbar from '../features/navigation/component/Navbar'
import BasicInfoTab from '../features/project-manage/components/BasicInfoTab'
import MapLocationTab from '../features/project-manage/components/MapLocationTab'
import { useProjectManage, TABS } from '../features/project-manage/hooks/useProjectManage'

export default function ProjectManagePage() {
  const navigate = useNavigate()
  const { id, project, isLoading, isError, activeTab, setActiveTab } = useProjectManage()

  if (!id) {
    navigate('/', { replace: true })
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-canvas to-card/40">
        <Navbar />
        <div className="px-10 py-8">
          <div className="h-7 bg-card rounded w-48 animate-pulse mb-8" />
          <div className="h-10 bg-card rounded w-full animate-pulse" />
        </div>
      </div>
    )
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-canvas to-card/40">
        <Navbar />
        <div className="px-10 py-8 text-muted">
          Project not found.{' '}
          <Link to="/" className="text-accent hover:text-accent-hover">
            Go back
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-canvas to-card/40">
      <Navbar />
      <div className="px-10 py-8 max-w-5xl">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors mb-4 no-underline"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Dashboard
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary m-0">{project.name}</h1>
          <p className="text-sm text-muted/70 mt-1 m-0">Project settings</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-surface/30 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 text-sm font-medium border-none bg-transparent cursor-pointer transition-colors border-b-2 -mb-px ${activeTab === tab.id
                  ? 'text-accent border-accent'
                  : 'text-muted border-transparent hover:text-primary'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'basic' && <BasicInfoTab project={project} />}
        {activeTab === 'map' && <MapLocationTab project={project} />}

      </div>
    </div>
  )
}
