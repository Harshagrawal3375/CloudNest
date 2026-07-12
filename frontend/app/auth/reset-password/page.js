"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

const apiBackend = process.env.NEXT_PUBLIC_API_BACKEND || "http://localhost:5000"

export default function ResetPassword() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [done, setDone] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch(`${apiBackend}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed")
      setDone(true)
      toast({ title: "Success", description: "Password reset successful" })
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-6">
            <p className="text-muted-foreground mb-4">Invalid reset link.</p>
            <Button asChild><Link href="/auth/forgot-password">Request a new link</Link></Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>Enter your new password</CardDescription>
        </CardHeader>
        {done ? (
          <CardContent className="text-center py-6">
            <p className="text-muted-foreground mb-4">Password reset! You can now log in.</p>
            <Button asChild><Link href="/auth/login">Go to Login</Link></Button>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input id="password" type="password" className="pl-10" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}
