import { type ReactNode } from "react";
import { Icon } from "./Icon";

export function Button({
  children,
  variant = "primary",
  icon,
  onClick,
  disabled,
  className = "",
}: {
  children: ReactNode;
  variant?: string;
  icon?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button className={`btn btn-${variant} ${className}`} onClick={onClick} disabled={disabled}>
      {icon && <Icon name={icon} size={17} />}
      {children}
    </button>
  );
}
