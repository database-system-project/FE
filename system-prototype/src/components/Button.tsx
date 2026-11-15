import { type ReactNode } from "react";
import { Icon } from "./Icon";

export function Button({
  children,
  variant = "primary",
  icon,
  onClick,
  disabled,
  className = "",
  type,
}: {
  children: ReactNode;
  variant?: string;
  icon?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  /** 폼 안에서 제출하지 않는 버튼은 "button" */
  type?: "button" | "submit";
}) {
  return (
    <button type={type} className={`btn btn-${variant} ${className}`} onClick={onClick} disabled={disabled}>
      {icon && <Icon name={icon} size={17} />}
      {children}
    </button>
  );
}
