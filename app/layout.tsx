import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono, Outfit } from 'next/font/google'
import { Toaster } from 'sonner'
import { MouseGlow } from '@/components/mouse-glow'
import { Protection } from '@/components/protection'


import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const _outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })
const _jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

export const metadata: Metadata = {
  title: 'ROGUEX - Control Panel',
  description: 'License management system with HWID binding, expiration and Discord integration',
}

export const viewport: Viewport = {
  themeColor: '#8b5cf6',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${_inter.variable} ${_outfit.variable} ${_jetbrainsMono.variable} font-sans antialiased text-foreground bg-background`}>
        <MouseGlow />
        <Protection />
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: 'hsl(0 0% 0%)',
              border: '1px solid hsl(0 0% 8.2%)',
              color: 'hsl(0 0% 100%)',
            },
          }}
        />
      </body>
    </html>
  )
}
