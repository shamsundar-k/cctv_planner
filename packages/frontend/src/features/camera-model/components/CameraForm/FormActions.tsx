import { Link } from 'react-router'

interface Props {
  isPending: boolean
  submitLabel: string
}

export default function FormActions({ isPending, submitLabel }: Props) {
  return (
    <div className="flex gap-3 pt-2 border-t border-border">
      <button
        type="submit"
        disabled={isPending}
        className="px-6 py-2.5 bg-accent hover:bg-accent-hover disabled:bg-accent/50 text-on-accent text-sm font-semibold rounded-lg border-none cursor-pointer transition-colors disabled:cursor-not-allowed"
      >
        {isPending ? 'Saving…' : submitLabel}
      </button>
      <Link
        to="/admin/manage/cameras"
        className="px-6 py-2.5 bg-surface hover:bg-border text-primary text-sm font-semibold rounded-lg no-underline transition-colors"
      >
        Cancel
      </Link>
    </div>
  )
}
