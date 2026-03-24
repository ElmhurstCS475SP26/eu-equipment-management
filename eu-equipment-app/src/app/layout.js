// src/app/layout.js
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata = {
  title: 'EU Equipment App',
  description: 'Elmhurst University Media Equipment Management',
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}