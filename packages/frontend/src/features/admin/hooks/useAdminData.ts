import { useState } from 'react'
import {
  useSearchUsers,
  useSearchProjects,
  useAllProjects,
} from '../api/admin'
import { useAllInvites } from '../../invites/api/invites'

export function useAdminData() {
  const [userSearch, setUserSearch] = useState('')
  const [projectSearch, setProjectSearch] = useState('')

  const { data: filteredUsers = [], isLoading: usersLoading } = useSearchUsers(userSearch)
  const { data: filteredProjects = [], isLoading: projectsLoading } = useSearchProjects(projectSearch)
  const { data: allProjects = [] } = useAllProjects()
  const { data: adminInvites = [], isLoading: invitesLoading } = useAllInvites()

  const totalCameras = allProjects.reduce((sum, p) => sum + p.camera_count, 0)

  return {
    filteredUsers,
    usersLoading,
    filteredProjects,
    projectsLoading,
    allProjects,
    adminInvites,
    invitesLoading,
    totalCameras,
    userSearch,
    setUserSearch,
    projectSearch,
    setProjectSearch,
  }
}
