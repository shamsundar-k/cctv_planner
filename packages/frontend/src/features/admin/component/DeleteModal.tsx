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
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000] p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-[420px] rounded-2xl border border-panel-border bg-panel p-7 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="admin-delete-title">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-warning/30 bg-warning/10 text-lg">
            ⚠️
          </div>
          <h3 id="admin-delete-title" className="m-0 text-base font-bold text-text-primary">{copy.title}</h3>
        </div>

        <p className="mb-2 text-sm text-text-muted">
          {copy.body}{' '}
          <strong className="text-text-primary">"{modal.name}"</strong>?
        </p>
        <p className="mb-6 text-[13px] text-text-muted">
          This action cannot be undone.{copy.extra && ` ${copy.extra}`}
        </p>

        <div className="flex gap-2.5 justify-end">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="cursor-pointer rounded-lg border border-panel-border bg-background px-5 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-divider disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-error bg-error px-5 py-2.5 text-sm font-bold text-error-foreground transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
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
