import React from "react"
import styles from "./Grid.module.css"

interface ColumnResponsive {
  base?: number
  sm?: number
  md?: number
  lg?: number
}

interface GridProps {
  columns?: number | ColumnResponsive
  gap?: string
  minItemWidth?: string
  as?: React.ElementType
  className?: string
  children: React.ReactNode
}

export function Grid({
  columns = { base: 2, md: 3, lg: 4 },
  gap = "clamp(16px, 3vw, 32px)",
  minItemWidth,
  as: Component = "div",
  className,
  children,
}: GridProps) {
  const isResponsive = typeof columns === "object"
  const gridClass = [styles.grid, className].filter(Boolean).join(" ")

  const style: React.CSSProperties & Record<string, any> = {}

  if (minItemWidth) {
    style.display = "grid"
    style.gridTemplateColumns = `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`
    style.gap = gap
  } else if (isResponsive) {
    const responsive = columns as ColumnResponsive
    style["--grid-cols-base"] = String(responsive.base ?? 2)
    style["--grid-cols-sm"] = String(responsive.sm ?? responsive.base ?? 2)
    style["--grid-cols-md"] = String(responsive.md ?? 3)
    style["--grid-cols-lg"] = String(responsive.lg ?? 4)
    style.gap = gap
  } else {
    style.display = "grid"
    style.gridTemplateColumns = `repeat(${columns}, 1fr)`
    style.gap = gap
  }

  return (
    <Component className={gridClass} style={style}>
      {children}
    </Component>
  )
}
