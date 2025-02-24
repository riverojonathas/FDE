'use client'

import { Settings, Users, Cog, Wand2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

export function NavBar() {
  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="ml-auto flex items-center space-x-4">
          {/* ... outros itens do menu ... */}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Cog className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center">
                  <Cog className="mr-2 h-4 w-4" />
                  <span>Todas as Configurações</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Acesso Rápido</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/settings/profile" className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings/prompts" className="flex items-center">
                    <Wand2 className="mr-2 h-4 w-4" />
                    <span>Calibração de Prompts</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
} 