import React from "react"
import styles from "./Container.module.css"

type ContainerSize = "sm" | "md" | "lg" | "full"

interface ContainerProps {
  size?: ContainerSize
  center?: boolean
  as?: React.ElementType
  className?: string
  children: React.ReactNode
}

export function Container({
  size = "md",
  center = false,
  as: Component = "div",
  className,
  children,
}: ContainerProps) {
  const containerClass = [
    styles.container,
    styles[`container--${size}`],
    center && styles["container--center"],
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <Component className={containerClass}>
      {children}
    </Component>
  )
}
