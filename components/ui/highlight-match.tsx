import { splitByQuery } from "@/lib/searchHighlight"
import { cn } from "@/lib/utils"

// The typed part stays regular and the rest is emphasised, so what differs between suggestions stands out.
function HighlightMatch({ text, query, className }: { text: string; query: string; className?: string }) {
  return (
    <span className={className}>
      {splitByQuery(text, query).map((part, i) => (
        <span key={i} className={cn(!part.match && "font-semibold")}>
          {part.text}
        </span>
      ))}
    </span>
  )
}

export { HighlightMatch }
