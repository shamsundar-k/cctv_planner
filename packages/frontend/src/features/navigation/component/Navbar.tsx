import NavActions from './NavActions'
import NavLogo from '../../../components/NavLogo'
import NavSearchBar from './NavSearchBar'

export default function Navbar() {
  return (
    <header
      className="sticky top-0 z-100 h-16 backdrop-blur-md border-b border-surface/20 bg-card/95 shadow-[0_2px_20px_rgba(0,0,0,0.4)] flex items-center px-10 gap-6"
    >
      <NavLogo />
      <NavSearchBar />
      <NavActions />
    </header>
  )
}
