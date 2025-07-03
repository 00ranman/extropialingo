import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from './providers'

const inter = Inter({ subsets: ['latin'] })
const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-extropian'
})

export const metadata: Metadata = {
  title: 'ExtropiaLingo - Learn the Extropian Language',
  description: 'Master the revolutionary Extropian language through gamified learning with physics-based XP rewards and entropy reduction tracking.',
  keywords: 'extropian, language learning, entropy reduction, xp rewards, physics-based learning, loop construction',
  authors: [{ name: 'Extropy Technologies' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0ea5e9',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} ${jetbrainsMono.variable} bg-gray-900 text-white min-h-screen`}>
        <AuthProvider session={null}>
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-extropy-900">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}