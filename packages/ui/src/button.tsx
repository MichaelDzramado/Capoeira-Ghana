import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
} from "react";

type ButtonVariant = "primary" | "secondary" | "outline";

type CommonProps = {
  variant?: ButtonVariant;
  className?: string;
  children?: React.ReactNode;
};

type ButtonElementProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type LinkElementProps = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

type ButtonProps = ButtonElementProps | LinkElementProps;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
  "bg-[var(--primary)] !text-white hover:bg-[var(--primary-dark)]",
  secondary:
    "bg-[var(--accent)] text-black hover:opacity-90",
  outline:
    "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-muted)]",
};

const baseClasses = [
  "inline-flex min-h-12 items-center justify-center rounded-full px-7",
  "font-semibold transition-colors",
  "focus-visible:outline-3 focus-visible:outline-[var(--accent)]",
  "focus-visible:outline-offset-3",
];

export function Button(props: ButtonProps) {
  const classes = [
    ...baseClasses,
    variantClasses[props.variant ?? "primary"],
    props.className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  if (props.href !== undefined) {
    const linkProps = props as LinkElementProps;

    return (
      <a
        href={linkProps.href}
        className={classes}
        target={linkProps.target}
        rel={linkProps.rel}
        aria-label={linkProps["aria-label"]}
      >
        {linkProps.children}
      </a>
    );
  }

  const buttonProps = props as ButtonElementProps;

  return (
    <button
      type={buttonProps.type}
      disabled={buttonProps.disabled}
      onClick={buttonProps.onClick}
      aria-label={buttonProps["aria-label"]}
      className={classes}
    >
      {buttonProps.children}
    </button>
  );
}