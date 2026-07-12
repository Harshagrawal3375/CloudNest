"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, FileText, Shield, Upload, Menu, LogOut, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/auth-context"

export default function Home() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header className={`px-4 lg:px-6 h-16 flex items-center border-b transition-all duration-200 ${scrolled ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" : ""}`}>
        <Link href="/" className="flex items-center justify-center hover:opacity-80 transition-opacity">
          <FileText className="h-6 w-6 mr-2" />
          <span className="font-bold text-xl">CloudNest</span>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="ml-auto md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="flex flex-col gap-4">
              <Link href="/#features" className="text-sm font-medium hover:underline underline-offset-4">
                Features
              </Link>
              <Link href="/#pricing" className="text-sm font-medium hover:underline underline-offset-4">
                Pricing
              </Link>
              <Link href="/#about" className="text-sm font-medium hover:underline underline-offset-4">
                About
              </Link>
              {user ? (
                <>
                  <Button asChild className="w-full">
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/auth/login">Login</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/auth/register">Sign Up</Link>
                  </Button>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
        <nav className="ml-auto hidden md:flex gap-4 sm:gap-6 items-center">
          <Link href="/#features" className="text-sm font-medium hover:underline underline-offset-4 transition-colors">
            Features
          </Link>
          <Link href="/#pricing" className="text-sm font-medium hover:underline underline-offset-4 transition-colors">
            Pricing
          </Link>
          <Link href="/#about" className="text-sm font-medium hover:underline underline-offset-4 transition-colors">
            About
          </Link>
          {/* <ThemeToggle /> */}
          {user ? (
            <>
              <Button asChild variant="outline" className="gap-2">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="ghost" className="gap-2" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline">
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Sign Up</Link>
              </Button>
            </>
          )}
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_500px]">
              <div className="flex flex-col justify-center space-y-4 animate-in fade-in slide-in-from-left-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Secure File Storage for Everyone
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Upload, store, and share your files with confidence. Our platform provides secure storage with easy
                    access from anywhere.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="gap-1.5 hover:gap-2.5 transition-all">
                    <Link href={user ? "/dashboard/upload" : "/auth/register"}>
                      {user ? "Upload File" : "Get Started"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/#features">Learn More</Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center animate-in fade-in slide-in-from-right-4 delay-200">
                <div className="relative w-full aspect-square">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl blur-2xl"></div>
                  <img
                    src="/placeholder.svg?height=550&width=550"
                    width={550}
                    height={550}
                    alt="Hero"
                    className="relative aspect-square overflow-hidden rounded-xl object-cover shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center animate-in fade-in">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Our platform offers everything you need to manage your files securely and efficiently.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              <div className="grid gap-2 text-center group cursor-pointer hover:shadow-lg transition-all duration-300 p-6 rounded-lg hover:bg-background">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Upload className="h-10 w-10 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold">Easy Uploads</h3>
                <p className="text-muted-foreground">
                  Drag and drop your files for quick and easy uploads from any device.
                </p>
              </div>
              <div className="grid gap-2 text-center group cursor-pointer hover:shadow-lg transition-all duration-300 p-6 rounded-lg hover:bg-background">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary mx-auto group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-10 w-10 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold">Secure Storage</h3>
                <p className="text-muted-foreground">
                  Your files are encrypted and stored securely in our cloud infrastructure.
                </p>
              </div>
              <div className="grid gap-2 text-center group cursor-pointer hover:shadow-lg transition-all duration-300 p-6 rounded-lg hover:bg-background">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary mx-auto group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-10 w-10 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold">File Management</h3>
                <p className="text-muted-foreground">
                  Organize, share, and access your files from anywhere with our intuitive interface.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3 animate-in fade-in">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Ready to get started?</h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                Join thousands of users who trust us with their files. Sign up today and get started with our free plan.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2 animate-in fade-in delay-200">
              <Button asChild className="w-full" size="lg">
                <Link href={user ? "/dashboard/upload" : "/auth/register"}>
                  {user ? "Start Uploading" : "Sign Up Now"}
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground">No credit card required.</p>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-muted/50 hover:bg-muted/70 transition-colors">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} CloudNest. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4 transition-colors">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4 transition-colors">
            Privacy
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4 transition-colors">
            Contact
          </Link>
        </nav>
      </footer>
    </div>
  )
}
