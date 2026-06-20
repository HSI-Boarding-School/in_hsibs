import { Icon } from "@iconify/react";
import { registerIcons } from "./register-icons";

registerIcons();

interface IconifyProps {
  icon: string;
  width?: number;
  height?: number;
  className?: string;
}

export function Iconify({ icon, width = 20, height, className }: IconifyProps) {
  return (
    <span className={`inline-flex ${className ?? ""}`}>
      <Icon icon={icon} width={width} height={height ?? width} />
    </span>
  );
}
