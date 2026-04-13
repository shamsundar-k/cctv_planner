import NavUserAvatar from './NavUserAvatar'

export default function NavActions() {
  return (
    <div className="flex items-center gap-5 ml-auto shrink-0">
      {/* Bell — placeholder, not yet functional */}
      <svg
        width="18" height="18" viewBox="0 0 24 24"
        fill="none" xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="cursor-pointer transition-colors"
        style={{ color: 'var(--theme-text-secondary)' }}
      >
        <path d="M12 2a7 7 0 0 0-7 7v4l-2 2v1h18v-1l-2-2V9a7 7 0 0 0-7-7z" fill="currentColor" />
        <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>

      <NavUserAvatar />

      {/* Help */}
      <a
        href="#"
        aria-label="Help"
        className="flex items-center transition-colors"
        style={{ color: 'var(--theme-text-secondary)' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 4"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
          />
          <circle cx="12" cy="17" r="0.75" fill="currentColor" />
        </svg>
      </a>
    </div>
  )
}
