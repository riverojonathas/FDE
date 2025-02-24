'use client'

import { Button } from "@/components/ui/button"
import { LayoutGrid, List, Table } from "lucide-react"

type ViewType = 'grid' | 'list' | 'table'

interface ViewSelectorProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
}

export function ViewSelector({ currentView, onViewChange }: ViewSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={currentView === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('grid')}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={currentView === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('list')}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant={currentView === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('table')}
      >
        <Table className="h-4 w-4" />
      </Button>
    </div>
  )
} 