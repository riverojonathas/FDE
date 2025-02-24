'use client'

import { Header } from "./header"
import { Sidebar } from "./sidebar"
import { useAppStore } from "@/store/useAppStore"
import { cn } from "@/lib/utils"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isSidebarCollapsed } = useAppStore()

  return (
    <div className="min-h-screen bg-[#0A0F1C]">
      <Header />
      <Sidebar />
      <div className={cn(
        "pt-14", // altura do header
        isSidebarCollapsed ? "md:pl-16" : "md:pl-64"
      )}>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
} 