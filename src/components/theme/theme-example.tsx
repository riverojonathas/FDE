'use client'

import React from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function ThemeExample() {
  const { theme } = useTheme()
  
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Exemplo de Tema</h2>
        <p className="text-muted-foreground">
          Este componente demonstra como os elementos respondem ao tema atual: {theme || 'não definido'}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card de exemplo */}
        <Card>
          <CardHeader>
            <CardTitle>Card com tema</CardTitle>
            <CardDescription>Este card usa as variáveis de tema</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">Texto principal usando text-foreground</p>
            <p className="text-muted-foreground mt-2">Texto secundário usando text-muted-foreground</p>
            <div className="bg-accent p-3 rounded-md mt-4">
              <p className="text-accent-foreground">Área de destaque usando bg-accent</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Cancelar</Button>
            <Button>Salvar</Button>
          </CardFooter>
        </Card>
        
        {/* Tabs de exemplo */}
        <Card>
          <CardHeader>
            <CardTitle>Componentes com tema</CardTitle>
            <CardDescription>Exemplos de componentes usando variáveis de tema</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="botoes" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="botoes">Botões</TabsTrigger>
                <TabsTrigger value="cores">Cores</TabsTrigger>
              </TabsList>
              <TabsContent value="botoes" className="space-y-4 mt-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="default">Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </TabsContent>
              <TabsContent value="cores" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <Label>Background</Label>
                    <div className="h-10 w-full bg-background border border-border rounded-md"></div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label>Foreground</Label>
                    <div className="h-10 w-full bg-foreground rounded-md"></div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label>Primary</Label>
                    <div className="h-10 w-full bg-primary rounded-md"></div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label>Secondary</Label>
                    <div className="h-10 w-full bg-secondary rounded-md"></div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label>Accent</Label>
                    <div className="h-10 w-full bg-accent rounded-md"></div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label>Muted</Label>
                    <div className="h-10 w-full bg-muted rounded-md"></div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 