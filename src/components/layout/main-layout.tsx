'use client'

import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { useAppStore } from "@/store/useAppStore"
import { cn } from "@/lib/utils"
import React from "react"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isSidebarCollapsed, toggleSidebar } = useAppStore()

  return (
    <div className="min-h-screen transition-colors duration-300 ease-in-out bg-background text-foreground">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className={cn(
          "flex-1 p-6 mt-14 transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "md:ml-16" : "md:ml-64"
        )}>
          {children}
        </main>
      </div>
    </div>
  )
} 