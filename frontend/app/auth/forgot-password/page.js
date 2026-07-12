"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

const apiBackend = process.env.NEXT_PUBLIC_API_BACKEND || "http://localhost:5000"

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch(`${apiBackend}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      setSent(true)
      toast({ title: "Check your email", description: data.msg || "If an account exists, a reset link has been sent" })
    } catch {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>Enter your email and we&apos;ll send you a reset link</CardDescription>
        </CardHeader>
        {sent ? (
          <CardContent className="text-center py-6">
            <p className="text-muted-foreground mb-4">Reset link sent! Check your inbox.</p>
            <Button asChild variant="outline">
              <Link href="/auth/login">Back to Login</Link>
            </Button>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input id="email" placeholder="name@example.com" type="email" className="pl-10" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
              <Link href="/auth/login" className="text-sm font-medium underline underline-offset-4">
                Back to Login
              </Link>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}
