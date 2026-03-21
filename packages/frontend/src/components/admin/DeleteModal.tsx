/*
 * FILE SUMMARY — src/components/admin/DeleteModal.tsx
 *
 * Reusable confirmation modal for destructive admin actions (delete user,
 * delete project, revoke invite).
 *
 * DeleteModal({ modal, onClose, onConfirm, isDeleting }) — Renders a centred
 *   overlay modal with:
 *   - A warning icon, a dynamic title, and a body message that vary based on
 *     `modal.type` ('user' | 'project' | 'invite') using the MODAL_COPY map.
 *   - The target entity's name displayed in bold within the body text.
 *   - An "This action cannot be undone" warning plus optional extra context
 *     (e.g. data loss warning for projects, link-deactivation note for
 *     invites).
 *   - A "Cancel" button (calls `onClose`) and a red confirm button
 *     ("Confirm Delete" or "Revoke Invite" depending on type).
 *   - Both buttons are disabled while `isDeleting` is true; the confirm button
 *     shows a <Spinner> and in-progress text during the mutation.
 *   - Clicking the backdrop (outside the dialog box) calls `onClose`.
 *
 * MODAL_COPY — Internal constant map from entity type to title/body/extra
 *   strings, keeping UI copy co-located with the modal component.
 */
import type { DeleteModalState } from './types'
import Spinner from './Spinner'

interface DeleteModalProps {
  modal: DeleteModalState & { open: true }
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
}

const MODAL_COPY: Record<'user' | 'project' | 'invite', { title: string; body: string; extra?: string }> = {
  user: {
    title: 'Delete User',
    body: 'Are you sure you want to delete',
    extra: undefined,
  },
  project: {
    title: 'Delete Project',
    body: 'Are you sure you want to delete',
    extra: 'All cameras and data in this project will be permanently removed.',
  },
  invite: {
    title: 'Revoke Invite',
    body: 'Are you sure you want to revoke the invite for',
    extra: 'The invite link will stop working immediately.',
  },
}

export default function DeleteModal({ modal, onClose, onConfirm, isDeleting }: DeleteModalProps) {
  const copy = MODAL_COPY[modal.type]

  return (
    <div
      className="fixed inset-0 bg-black/65 flex items-center justify-center z-[1000] p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-slate-800 rounded-2xl p-7 max-w-[420px] w-full border border-slate-700 shadow-[0_25px_50px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center text-lg shrink-0">
            ⚠️
          </div>
          <h3 className="text-base font-bold text-slate-100 m-0">{copy.title}</h3>
        </div>

        <p className="text-sm text-slate-400 mb-2">
          {copy.body}{' '}
          <strong className="text-slate-100">"{modal.name}"</strong>?
        </p>
        <p className="text-[13px] text-slate-500 mb-6">
          This action cannot be undone.{copy.extra && ` ${copy.extra}`}
        </p>

        <div className="flex gap-2.5 justify-end">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2.5 text-sm font-medium bg-transparent text-slate-400 border border-slate-700 rounded-lg cursor-pointer transition-colors hover:bg-slate-700 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2.5 text-sm font-semibold bg-red-500 hover:bg-red-600 disabled:bg-red-800 text-white border-none rounded-lg cursor-pointer flex items-center gap-2 transition-colors disabled:cursor-not-allowed"
          >
            {isDeleting
              ? <><Spinner /> {modal.type === 'invite' ? 'Revoking…' : 'Deleting…'}</>
              : modal.type === 'invite' ? 'Revoke Invite' : 'Confirm Delete'
            }
          </button>
        </div>
      </div>
    </div>
  )
}
