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
      <div
        className="rounded-2xl p-7 max-w-[420px] w-full shadow-[0_25px_50px_rgba(0,0,0,0.6)]"
        style={{ background: 'var(--theme-bg-card)', border: '1px solid color-mix(in srgb, var(--theme-surface) 30%, transparent)' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0" style={{ background: 'color-mix(in srgb, var(--theme-accent) 15%, transparent)', border: '1px solid color-mix(in srgb, var(--theme-accent) 30%, transparent)' }}>
            ⚠️
          </div>
          <h3 className="text-base font-bold m-0" style={{ color: 'var(--theme-text-primary)' }}>{copy.title}</h3>
        </div>

        <p className="text-sm mb-2" style={{ color: 'var(--theme-text-secondary)' }}>
          {copy.body}{' '}
          <strong style={{ color: 'var(--theme-text-primary)' }}>"{modal.name}"</strong>?
        </p>
        <p className="text-[13px] mb-6" style={{ color: 'color-mix(in srgb, var(--theme-text-secondary) 70%, transparent)' }}>
          This action cannot be undone.{copy.extra && ` ${copy.extra}`}
        </p>

        <div className="flex gap-2.5 justify-end">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2.5 text-sm font-semibold bg-transparent rounded-lg cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            style={{ color: 'var(--theme-text-secondary)', border: '1px solid color-mix(in srgb, var(--theme-surface) 30%, transparent)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--theme-surface) 15%, transparent)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2.5 text-sm font-bold border-none rounded-lg cursor-pointer flex items-center gap-2 transition-all disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: 'var(--theme-accent)', color: 'var(--theme-accent-text)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--theme-accent-hover)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--theme-bg-base)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--theme-accent)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--theme-accent-text)' }}
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
