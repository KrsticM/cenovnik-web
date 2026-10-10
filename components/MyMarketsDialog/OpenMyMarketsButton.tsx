"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { useMyMarketsDialog } from "./MyMarketsDialogProvider";

export function OpenMyMarketsButton(props: Omit<ComponentProps<typeof Button>, "onClick" | "asChild">) {
  const { open } = useMyMarketsDialog();
  return <Button type="button" {...props} onClick={open} />;
}
