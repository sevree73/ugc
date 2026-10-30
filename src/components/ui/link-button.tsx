import Link, { type LinkProps } from "next/link";
import { buttonClasses, type ButtonVariant, type ButtonSize } from "./button";

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: LinkProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
  }) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}
