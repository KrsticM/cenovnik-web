import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StoreCardProps extends React.HTMLAttributes<HTMLDivElement> {
  retailerName: string;
  highlight?: boolean;
  leading?: React.ReactNode;
  eyebrow?: React.ReactNode;
  badge?: React.ReactNode;
  subtitle?: React.ReactNode;
  aside?: React.ReactNode;
  align?: "center" | "start";
}

export const StoreCard = React.forwardRef<HTMLDivElement, StoreCardProps>(
  (
    { retailerName, highlight = false, leading, eyebrow, badge, subtitle, aside, align = "start", className, children, ...props },
    ref
  ) => (
    <Card
      ref={ref}
      className={cn("rounded-[14px] bg-white p-4 shadow-none", highlight ? "border-sage" : "border-line", className)}
      {...props}
    >
      {/* A narrow card puts the price under the name instead of over it. */}
      <div className={cn("flex flex-wrap gap-x-3.5 gap-y-2", align === "center" ? "items-center" : "items-start")}>
        <div className={cn("flex min-w-[180px] flex-1 gap-3.5", align === "center" ? "items-center" : "items-start")}>
          {leading}
          <div className="min-w-0 flex-1">
            {eyebrow && <div className="mb-2">{eyebrow}</div>}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[15px] font-semibold text-ink">{retailerName}</span>
              {badge}
            </div>
            {subtitle}
          </div>
        </div>
        {aside && <div className="ml-auto">{aside}</div>}
      </div>
      {children}
    </Card>
  )
);
StoreCard.displayName = "StoreCard";
