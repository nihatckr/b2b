import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

export interface ActionButton {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export interface ActionButtonsProps {
  buttons: ActionButton[];
  align?: "left" | "center" | "right";
  className?: string;
}

export function ActionButtons({
  buttons,
  align = "right",
  className,
}: ActionButtonsProps) {
  const alignClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  return (
    <div className={`flex gap-2 ${alignClass[align]} ${className || ""}`}>
      {buttons.map((button, index) => {
        const Icon = button.icon;
        return (
          <Button
            key={index}
            variant={button.variant || "default"}
            size={button.size || "default"}
            onClick={button.onClick}
            disabled={button.disabled || button.loading}
            className={button.className}
          >
            {button.loading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Loading...
              </>
            ) : (
              <>
                {Icon && <Icon className="h-4 w-4 mr-2" />}
                {button.label}
              </>
            )}
          </Button>
        );
      })}
    </div>
  );
}
