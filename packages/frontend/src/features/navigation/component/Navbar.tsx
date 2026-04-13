import NavActions from './NavActions'
import NavLogo from './NavLogo'
import NavSearchBar from './NavSearchBar'

export default function Navbar() {
  return (
    <header
      className="sticky top-0 z-100 h-16 backdrop-blur-md border-b shadow-[0_2px_20px_rgba(0,0,0,0.4)] flex items-center px-10 gap-6"
      style={{
        background: 'color-mix(in srgb, var(--theme-bg-card) 95%, transparent)',
        borderColor: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)',
      }}
    >
      <NavLogo />
      <NavSearchBar />
      <NavActions />
    </header>
  )
}
