import { useState } from 'react'
import {
  useSearchUsers,
  useSearchProjects,
  useAllProjects,
} from '../api/admin'
import { useAllInvites } from '../../invites/api/invites'
import { useAllCameraSpecs } from '@/hooks/useCameraSpecs'

export function useAdminData() {
  const [userSearch, setUserSearch] = useState('')
  const [projectSearch, setProjectSearch] = useState('')

  const { data: filteredUsers = [], isLoading: usersLoading } = useSearchUsers(userSearch)
  const { data: filteredProjects = [], isLoading: projectsLoading } = useSearchProjects(projectSearch)
  const { data: allProjects = [] } = useAllProjects()
  const { data: allCameraSpecs = [] } = useAllCameraSpecs()
  const { data: adminInvites = [], isLoading: invitesLoading } = useAllInvites()

  const totalCameraModels = allCameraSpecs.length

  return {
    filteredUsers,
    usersLoading,
    filteredProjects,
    projectsLoading,
    allProjects,
    adminInvites,
    invitesLoading,
    totalCameraModels,
    userSearch,
    setUserSearch,
    projectSearch,
    setProjectSearch,
  }
}
