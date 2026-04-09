import { useState } from 'react'
import { useToast } from '../../../components/ui/Toast'
import { useDeleteUser, useDeleteProject } from '../api/admin'
import { useRevokeInvite } from '../../invites/api/invites'
import type { DeleteModalState } from '../component/types'

export function useAdminActions() {
  const showToast = useToast()

  const [activeTab, setActiveTab] = useState<import('../component/types').Tab>('overview')
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({ open: false })

  const deleteUser = useDeleteUser()
  const deleteProject = useDeleteProject()
  const revokeInvite = useRevokeInvite()

  async function handleConfirmDelete() {
    if (!deleteModal.open) return
    try {
      if (deleteModal.type === 'user') {
        await deleteUser.mutateAsync(deleteModal.id)
        showToast(`User "${deleteModal.name}" deleted`, 'success')
      } else if (deleteModal.type === 'project') {
        await deleteProject.mutateAsync(deleteModal.id)
        showToast(`Project "${deleteModal.name}" deleted`, 'success')
      } else {
        await revokeInvite.mutateAsync(deleteModal.id)
        showToast(`Invite for "${deleteModal.name}" revoked`, 'success')
      }
      setDeleteModal({ open: false })
    } catch {
      showToast('Action failed. Please try again.', 'error')
    }
  }

  const isDeleting =
    deleteUser.isPending || deleteProject.isPending || revokeInvite.isPending

  return {
    activeTab,
    setActiveTab,
    deleteModal,
    setDeleteModal,
    handleConfirmDelete,
    isDeleting,
  }
}
