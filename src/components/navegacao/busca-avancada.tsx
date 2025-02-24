'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function BuscaAvancada() {
  const [filters, setFilters] = useState({
    type: 'all',
    searchTerm: '',
  })

  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    setLoading(true)
    try {
      // Implementar busca baseada nos filtros
      const { data, error } = await supabase
        .from(filters.type === 'all' ? 'schools' : filters.type)
        .select('*')
        .ilike('name', `%${filters.searchTerm}%`)
        .limit(20)

      if (error) throw error
      setResults(data || [])
    } catch (error) {
      console.error('Erro na busca:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Busca Avançada</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Select
              value={filters.type}
              onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="cities">Cidades</SelectItem>
                <SelectItem value="schools">Escolas</SelectItem>
                <SelectItem value="teachers">Professores</SelectItem>
                <SelectItem value="students">Alunos</SelectItem>
                <SelectItem value="classes">Turmas</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Digite sua busca..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            />

            <Button onClick={handleSearch} disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>

          <div className="mt-4">
            {results.map((item) => (
              <div key={item.id} className="p-2 border-b">
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 