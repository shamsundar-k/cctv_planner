import type { ButtonHTMLAttributes, ReactNode } from "react";

export type SecondaryButtonVariant = "solid" | "soft" | "outline" | "ghost";
export type SecondaryButtonSize =
  | "compact"
  | "small"
  | "medium"
  | "large"
  | "xlarge";
export type SecondaryButtonShape = "default" | "rounded";
export type SecondaryButtonTone = "neutral" | "danger";

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: SecondaryButtonVariant;
  size?: SecondaryButtonSize;
  shape?: SecondaryButtonShape;
  tone?: SecondaryButtonTone;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  loading?: boolean;
}

const baseClasses =
  "inline-flex items-center justify-center gap-2 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground disabled:shadow-none disabled:hover:bg-disabled";

const neutralVariantClasses: Record<SecondaryButtonVariant, string> = {
  solid:
    "border border-secondary bg-secondary text-secondary-foreground shadow-md shadow-secondary/15 hover:bg-secondary-hover",
  soft:
    "border border-secondary/45 bg-secondary/15 text-text-primary hover:border-secondary/65 hover:bg-secondary/25",
  outline:
    "border border-secondary/65 bg-transparent text-text-primary hover:border-secondary hover:bg-secondary/15",
  ghost:
    "border border-transparent bg-transparent text-text-primary hover:bg-secondary/15 hover:text-text-primary",
};

const dangerVariantClasses: Record<SecondaryButtonVariant, string> = {
  solid:
    "border border-error bg-error text-error-foreground shadow-md shadow-error/15 hover:bg-error/85",
  soft:
    "border border-error/50 bg-error/15 text-text-primary hover:border-error/70 hover:bg-error/25",
  outline:
    "border border-error/70 bg-transparent text-text-primary hover:border-error hover:bg-error/15",
  ghost:
    "border border-transparent bg-transparent text-error hover:bg-error/15 hover:text-error",
};

const sizeClasses: Record<SecondaryButtonSize, string> = {
  compact: "h-9 px-4 text-sm",
  small: "h-8 px-3 text-xs",
  medium: "h-10 px-4 text-sm",
  large: "h-12 px-5 text-base",
  xlarge: "h-14 px-4 text-base",
};

const shapeClasses: Record<SecondaryButtonShape, string> = {
  default: "rounded-md",
  rounded: "rounded-full",
};

export default function SecondaryButton({
  variant = "outline",
  size = "medium",
  shape = "default",
  tone = "neutral",
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  loading = false,
  disabled,
  className = "",
  children,
  ...props
}: SecondaryButtonProps) {
  const isDisabled = disabled || loading;
  const toneClasses = tone === "danger" ? dangerVariantClasses : neutralVariantClasses;
  const classes = [
    baseClasses,
    toneClasses[variant],
    sizeClasses[size],
    shapeClasses[shape],
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
