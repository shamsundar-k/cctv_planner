import { useState } from 'react'
import { useParams } from 'react-router'
import { useProject } from '../../../api/projects'

export type Tab = 'basic' | 'map' | 'cameras'

export const TABS: { id: Tab; label: string }[] = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'map', label: 'Map Location' },
]

export function useProjectManage() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState<Tab>('basic')

  const { data: project, isLoading, isError } = useProject(id ?? '')

  return { id, project, isLoading, isError, activeTab, setActiveTab }
}
