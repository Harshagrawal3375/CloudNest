"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { FileText, Home, LogOut, Menu, Settings, Upload, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/contexts/auth-context"
export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const { user, loading, logout } = useAuth()
  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "My Files", href: "/dashboard/files", icon: FileText },
    { name: "Upload", href: "/dashboard/upload", icon: Upload },

  ]
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 transition-all duration-200 ease-in-out sm:px-6">
        <div className="flex items-center gap-4">
          <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-r p-0">
              <nav className="flex h-full flex-col">
                <div className="border-b p-4">
                  <Link
                    href="/"
                    className="flex items-center gap-2 text-lg font-semibold"
                    onClick={() => setIsMobileNavOpen(false)}
                  >
                    <FileText className="h-6 w-6" />
                    <span>CloudNest</span>
                  </Link>
                </div>
                <div className="flex-1 overflow-auto p-4">
                  <nav className="grid gap-2 p-4 text-sm">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 ${pathname === item.href ? "bg-muted font-medium" : "hover:bg-muted"
                          }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </div>
                <div className="border-t p-4">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      setIsMobileNavOpen(false)
                      handleLogout()
                    }}
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2 font-semibold transition-opacity hover:opacity-80">
            <FileText className="h-6 w-6" />
            <span className="hidden md:inline">CloudNest</span>
          </Link>
        </div>
        {/* <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted" asChild>
            <Link href="/dashboard/profile">
              <User className="h-5 w-5" />
              <span className="sr-only">Profile</span>
            </Link>
          </Button>
        </div> */}
      </header>
      <div className="grid flex-1 md:grid-cols-[220px_1fr]">
        <aside className="hidden border-r md:block">
          <nav className="grid gap-2 p-4 text-sm">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 ${pathname === item.href ? "bg-muted font-medium" : "hover:bg-muted"
                  }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="mt-auto p-4">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </div>
        </aside>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
