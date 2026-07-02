import NavActions from "./NavActions";
import NavLogo from "../../../components/NavLogo";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-100 h-16 backdrop-blur-md border-b border-panel-border bg-panel/95 shadow-[0_2px_20px_rgba(15,23,42,0.14)] flex items-center px-10 gap-6">
      <NavLogo />

      <NavActions />
    </header>
  );
}
