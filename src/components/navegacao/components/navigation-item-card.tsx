'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ItemHierarquico } from "@/types/navigation"
import { InfoTooltip } from "./info-tooltip"
import { DetailsDialog } from "./details-dialog"
import { Eye } from 'lucide-react'

interface NavigationItemCardProps {
  item: ItemHierarquico
  viewType: 'grid' | 'list' | 'table'
  selected?: boolean
  onSelect?: () => void
  detalhes?: React.ReactNode
}

export function NavigationItemCard({ 
  item, 
  viewType,
  selected,
  onSelect,
  detalhes 
}: NavigationItemCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDetails(true)
  }

  if (viewType === 'table') {
    return (
      <>
        <tr className={`hover:bg-muted/50 ${selected ? 'bg-muted' : ''}`}>
          <td className="p-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={onSelect}
                className="flex items-center gap-2 text-left flex-1"
              >
                <span className="font-medium">{item.nome}</span>
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDetailsClick}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </td>
        </tr>
        <DetailsDialog 
          item={item}
          open={showDetails}
          onOpenChange={setShowDetails}
        />
      </>
    )
  }

  if (viewType === 'list') {
    return (
      <>
        <div 
          className={`flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg ${
            selected ? 'bg-muted' : ''
          }`}
        >
          <button 
            onClick={onSelect}
            className="flex items-center gap-2 flex-1"
          >
            <span className="font-medium">{item.nome}</span>
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDetailsClick}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
        <DetailsDialog 
          item={item}
          open={showDetails}
          onOpenChange={setShowDetails}
        />
      </>
    )
  }

  return (
    <>
      <Card 
        className={`hover:shadow-md transition-shadow ${
          selected ? 'border-primary' : ''
        }`}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <button 
            onClick={onSelect}
            className="flex-1 text-left"
          >
            <h3 className="font-medium">{item.nome}</h3>
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDetailsClick}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">{item.descricao}</p>
        </CardContent>
      </Card>
      <DetailsDialog 
        item={item}
        open={showDetails}
        onOpenChange={setShowDetails}
      />
    </>
  )
} 