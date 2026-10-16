import type { ReactNode } from "react";
import { Heading, Text } from "@/components/ui/typography";

export function StepHeading({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <Heading className="mt-6">{title}</Heading>
      <Text className="mt-2.5">{children}</Text>
    </>
  );
}
