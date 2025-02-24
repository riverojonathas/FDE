'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  ChevronDown, 
  ChevronUp, 
  ChevronsUpDown,
  Search
} from 'lucide-react'

interface DataTableProps<T> {
  data: T[]
  columns: {
    key: string
    title: string
    sortable?: boolean
    render?: (item: T) => React.ReactNode
  }[]
  searchable?: boolean
  height?: string
}

export function DataTable<T extends Record<string, any>>({ 
  data,
  columns,
  searchable = true,
  height = "400px"
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc' | null
  }>({ key: '', direction: null })
  const [searchTerm, setSearchTerm] = useState('')

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc'
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') direction = 'desc'
      else if (sortConfig.direction === 'desc') direction = null
    }

    setSortConfig({ key, direction })
  }

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <ChevronsUpDown className="h-4 w-4" />
    if (sortConfig.direction === 'asc') return <ChevronUp className="h-4 w-4" />
    if (sortConfig.direction === 'desc') return <ChevronDown className="h-4 w-4" />
    return <ChevronsUpDown className="h-4 w-4" />
  }

  let sortedData = [...data]
  if (sortConfig.key && sortConfig.direction) {
    sortedData.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) 
        return sortConfig.direction === 'asc' ? -1 : 1
      if (a[sortConfig.key] > b[sortConfig.key]) 
        return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }

  if (searchTerm) {
    sortedData = sortedData.filter(item => 
      Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      )}
      
      <ScrollArea style={{ height }} className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(column.key)}
                      className="h-8 px-2 py-1 font-medium"
                    >
                      {column.title}
                      <span className="ml-2">
                        {getSortIcon(column.key)}
                      </span>
                    </Button>
                  ) : (
                    column.title
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.render 
                        ? column.render(item)
                        : item[column.key]
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
} 