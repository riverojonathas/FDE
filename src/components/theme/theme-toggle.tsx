'use client'

import React from 'react'
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
        >
          <Sun className="h-4 w-4 mr-2 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="h-4 w-4 mr-2 absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span>Tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className="text-slate-400 hover:text-slate-100 focus:text-slate-100 hover:bg-slate-800 focus:bg-slate-800"
        >
          Claro
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className="text-slate-400 hover:text-slate-100 focus:text-slate-100 hover:bg-slate-800 focus:bg-slate-800"
        >
          Escuro
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className="text-slate-400 hover:text-slate-100 focus:text-slate-100 hover:bg-slate-800 focus:bg-slate-800"
        >
          Sistema
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 