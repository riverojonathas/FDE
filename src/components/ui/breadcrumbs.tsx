'use client'

import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbsProps {
  children: React.ReactNode
  className?: string
}

interface BreadcrumbItemProps {
  children: React.ReactNode
  onClick?: () => void
  active?: boolean
  className?: string
}

export function Breadcrumbs({ children, className }: BreadcrumbsProps) {
  return (
    <nav 
      className={cn(
        "flex items-center space-x-2 text-sm text-muted-foreground",
        className
      )}
    >
      {children}
    </nav>
  )
}

export function BreadcrumbItem({ 
  children, 
  onClick, 
  active, 
  className 
}: BreadcrumbItemProps) {
  return (
    <div className="flex items-center">
      <button
        onClick={onClick}
        className={cn(
          "hover:text-foreground transition-colors",
          active && "text-foreground font-medium",
          onClick && "cursor-pointer",
          !onClick && "cursor-default",
          className
        )}
      >
        {children}
      </button>
      <ChevronRight className="h-4 w-4 mx-2" />
    </div>
  )
} 