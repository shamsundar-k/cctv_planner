import { ChevronLeft } from "lucide-react";
import { Link } from "react-router";
import Navbar from "../navigation/component/Navbar";
import FovVisualiserLayout from "./components/FovVisualiserLayout";

export default function FovVisualiserPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-text-primary">
      <Navbar />

      <main className="w-full px-2 py-2 sm:px-3 sm:py-3 lg:px-4">
        <Link
          to="/"
          className="mb-2 inline-flex h-8 items-center gap-1 rounded-md border border-panel-border bg-panel px-2.5 text-xs font-semibold text-text-secondary no-underline shadow-sm transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ChevronLeft size={15} aria-hidden="true" />
          Back to dashboard
        </Link>

        <FovVisualiserLayout />
      </main>
    </div>
  );
}
