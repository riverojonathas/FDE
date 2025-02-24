'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  FileText, 
  CheckCircle2, 
  Settings,
  Menu,
  X,
  Users,
  Cog,
  Wand2
} from 'lucide-react'
import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Questões',
    href: '/questoes',
    icon: FileText
  },
  {
    name: 'Correções',
    href: '/correcoes',
    icon: CheckCircle2
  }
]

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">IA Correções</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center transition-colors hover:text-foreground/80",
                    pathname === item.href 
                      ? "text-foreground" 
                      : "text-foreground/60"
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold">IA Correções</span>
            </Link>
            <div className="my-4 divide-y divide-border">
              <nav className="flex flex-col space-y-2 py-4">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center py-2 text-sm transition-colors hover:text-foreground/80",
                        pathname === item.href 
                          ? "text-foreground" 
                          : "text-foreground/60"
                      )}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
          </div>
          <nav className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Configurações</span>
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
          </nav>
        </div>
      </div>
    </nav>
  )
} 