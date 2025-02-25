'use client'

import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: ReactNode
}

export function PageHeader({ title, description, icon }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {description && (
        <p className="text-muted-foreground">{description}</p>
      )}
    </div>
  )
} 