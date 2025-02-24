import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Navbar } from '@/components/layout/navbar'
import { Sidebar } from '@/components/layout/sidebar'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="flex">
              <Sidebar />
              <main className="flex-1 p-6">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
} 