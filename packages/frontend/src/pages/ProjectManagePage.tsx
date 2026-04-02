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
import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import Navbar from '../components/layout/Navbar'
import BasicInfoTab from '../components/project/manage/BasicInfoTab'
import MapLocationTab from '../components/project/manage/MapLocationTab'

import { useProject } from '../api/projects'

type Tab = 'basic' | 'map' | 'cameras'

const TABS: { id: Tab; label: string }[] = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'map', label: 'Map Location' },
  { id: 'cameras', label: 'Imported Cameras' },
]

export default function ProjectManagePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('basic')

  const { data: project, isLoading, isError } = useProject(id ?? '')

  if (!id) {
    navigate('/', { replace: true })
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="px-10 py-8">
          <div className="h-7 bg-slate-800 rounded w-48 animate-pulse mb-8" />
          <div className="h-10 bg-slate-800 rounded w-full animate-pulse" />
        </div>
      </div>
    )
  }

  if (isError || !project) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="px-10 py-8 text-slate-400">
          Project not found.{' '}
          <Link to="/" className="text-blue-400 hover:text-blue-300">
            Go back
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="px-10 py-8 max-w-5xl">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-4 no-underline"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Dashboard
        </Link>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-100 m-0">{project.name}</h1>
          <p className="text-sm text-slate-500 mt-1 m-0">Project settings</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-slate-700 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 text-sm font-medium border-none bg-transparent cursor-pointer transition-colors border-b-2 -mb-px ${activeTab === tab.id
                  ? 'text-blue-400 border-blue-500'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
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
