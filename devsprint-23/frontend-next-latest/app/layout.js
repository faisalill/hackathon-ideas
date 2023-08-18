"use client"
import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from '@/components/Navbar'
import { useState } from 'react'
import { UserContext } from './context.js'

const inter = Inter({ subsets: ['latin'] })

const metadata = {
  title: 'DevSprint Idea',
  description: 'Implemention Devsprint Hackathon Idea',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
            <Navbar />
            <div className="xl:px-64">
            {children}
            </div>
      </body>
    </html>
  )
}
