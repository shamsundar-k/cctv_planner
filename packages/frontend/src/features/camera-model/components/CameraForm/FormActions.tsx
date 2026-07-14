import { Link } from 'react-router'

interface Props {
  isPending: boolean
  submitLabel: string
}

export default function FormActions({ isPending, submitLabel }: Props) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-divider pt-5 sm:flex-row">
      <button
        type="submit"
        disabled={isPending}
        className="min-h-10 cursor-pointer rounded-lg border border-primary bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground disabled:shadow-none"
      >
        {isPending ? 'Saving…' : submitLabel}
      </button>
      <Link
        to="/admin/manage/camera_specs"
        className="inline-flex min-h-10 items-center justify-center rounded-lg border border-panel-border bg-panel px-6 py-2.5 text-sm font-semibold text-text-primary no-underline transition-colors hover:bg-divider focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Cancel
      </Link>
    </div>
  )
}
