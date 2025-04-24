import type React from "react"

import { Link } from "wouter"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"

interface PlayerLayoutProps {
  title: string
  children: React.ReactNode
}

export function PlayerLayout({ title, children }: PlayerLayoutProps) {
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-stone-100">
      {/* Fixed header */}
      <header className="flex justify-between items-center p-4 bg-stone-800 text-white shadow-md z-10">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white hover:bg-stone-700">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
      </header>

      {/* Main content area - will be modified by each player component */}
      <main className="flex-grow overflow-auto relative">{children}</main>
    </div>
  )
}
