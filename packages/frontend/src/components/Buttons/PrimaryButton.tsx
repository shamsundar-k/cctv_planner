import type { ButtonHTMLAttributes, ReactNode } from "react";

export type PrimaryButtonVariant = "solid" | "soft" | "outline" | "ghost";
export type PrimaryButtonSize = "small" | "medium" | "large";

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PrimaryButtonVariant;
  size?: PrimaryButtonSize;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  loading?: boolean;
}

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground disabled:shadow-none disabled:hover:bg-disabled";

const variantClasses: Record<PrimaryButtonVariant, string> = {
  solid:
    "border border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary-hover",
  soft:
    "border border-primary/50 bg-primary/20 text-text-primary hover:border-primary/70 hover:bg-primary/30",
  outline:
    "border border-primary/70 bg-transparent text-text-primary hover:bg-primary/15 hover:border-primary",
  ghost:
    "border border-transparent bg-transparent text-text-primary hover:bg-primary/15 hover:text-text-primary",
};

const sizeClasses: Record<PrimaryButtonSize, string> = {
  small: "h-8 px-3 text-xs",
  medium: "h-10 px-4 text-sm",
  large: "h-12 px-5 text-base",
};

export default function PrimaryButton({
  variant = "solid",
  size = "medium",
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  loading = false,
  disabled,
  className = "",
  children,
  ...props
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;
  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} disabled={isDisabled} {...props}>
      {loading ? (
        <span
          aria-hidden="true"
          className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin"
        />
      ) : (
        leadingIcon
      )}
      <span>{children}</span>
      {!loading && trailingIcon}
    </button>
  );
}
