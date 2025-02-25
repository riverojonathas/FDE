import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'
import { Header } from '@/components/layout/header'
import { ThemeProvider } from "@/components/theme/theme-provider"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Correção IA',
  description: 'Sistema de correção automática com inteligência artificial',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <div className="relative flex min-h-screen flex-col bg-background">
              <Header />
              <main className="flex-1 mt-14 px-4">
                {children}
              </main>
              <Toaster />
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
