"use client";

import { useId } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PillSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  className?: string;
}

const SIZES = {
  sm: {
    track: "h-6 w-[38px] px-[3px]",
    thumb: "h-[18px] w-[18px] data-[state=checked]:translate-x-[14px]",
  },
  md: {
    track: "h-7 w-12 px-[3px]",
    thumb: "h-[22px] w-[22px] data-[state=checked]:translate-x-5",
  },
} as const;

type DesignSwitchProps = React.ComponentProps<typeof Switch> & { size?: keyof typeof SIZES };

// shadcn Switch restyled to the design's track (sage-dark on / toggle-off off) and knob.
export function DesignSwitch({ size = "sm", className, ...props }: DesignSwitchProps) {
  return (
    <Switch
      {...props}
      className={cn(
        "border-0 shadow-none transition-colors duration-150 data-[state=checked]:bg-sage-dark data-[state=unchecked]:bg-toggle-off",
        SIZES[size].track,
        className
      )}
      thumbClassName={cn(
        "bg-white shadow-[0_1px_3px_rgba(26,26,26,0.25)] duration-150 ease-[cubic-bezier(0.32,0.72,0,1)]",
        SIZES[size].thumb
      )}
    />
  );
}

export function PillSwitch({ checked, onCheckedChange, label, className }: PillSwitchProps) {
  const id = useId();
  return (
    <Label
      htmlFor={id}
      className={cn(
        "flex h-10 cursor-pointer items-center gap-2.5 whitespace-nowrap rounded-[20px] border border-line bg-white pl-1.5 pr-3.5 text-sm font-medium leading-normal text-ink transition-colors hover:border-sage",
        className
      )}
    >
      <DesignSwitch id={id} checked={checked} onCheckedChange={onCheckedChange} />
      {label}
    </Label>
  );
}
