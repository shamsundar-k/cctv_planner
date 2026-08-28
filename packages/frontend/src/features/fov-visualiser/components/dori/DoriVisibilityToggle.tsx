import { CircleHelp } from "lucide-react";

interface DoriVisibilityToggleProps {
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}

const HELP_TEXT =
  "Theoretical pixel-density limits. Actual identification also depends on lighting, focus, viewing angle, motion blur, and compression.";

export default function DoriVisibilityToggle({
  checked,
  disabled,
  onChange,
}: DoriVisibilityToggleProps) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className="group inline-flex items-center gap-2 rounded-md text-xs font-semibold text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-panel disabled:cursor-not-allowed disabled:text-text-disabled"
      >
        <span
          className={`relative inline-flex h-5 w-9 rounded-full border-2 border-transparent transition-colors ${
            checked && !disabled ? "bg-primary" : "bg-divider"
          }`}
          aria-hidden="true"
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
              checked ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </span>
        Show DORI regions
      </button>
      <span
        className="inline-flex cursor-help text-text-muted"
        title={HELP_TEXT}
        aria-label={HELP_TEXT}
        tabIndex={0}
      >
        <CircleHelp size={15} aria-hidden="true" />
      </span>
    </div>
  );
}
