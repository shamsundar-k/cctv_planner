import { useState } from 'react'
import {
  useSearchUsers,
  useProjectStats,
  usePasswordResetRequests,
} from '../api/admin'
import { useAllInvites } from '../../invites/api/invites'
import { useAllCameraSpecs } from '@/hooks/useCameraSpecs'

export function useAdminData() {
  const [userSearch, setUserSearch] = useState('')

  const { data: filteredUsers = [], isLoading: usersLoading } = useSearchUsers(userSearch)
  const { data: projectStats, isLoading: projectStatsLoading } = useProjectStats()
  const { data: allCameraSpecs = [] } = useAllCameraSpecs()
  const { data: adminInvites = [], isLoading: invitesLoading } = useAllInvites()
  const {
    data: passwordResetRequests = [],
    isLoading: passwordResetRequestsLoading,
  } = usePasswordResetRequests()

  const totalCameraModels = allCameraSpecs.length

  return {
    filteredUsers,
    usersLoading,
    projectStats,
    projectStatsLoading,
    adminInvites,
    invitesLoading,
    passwordResetRequests,
    passwordResetRequestsLoading,
    totalCameraModels,
    userSearch,
    setUserSearch,
  }
}
