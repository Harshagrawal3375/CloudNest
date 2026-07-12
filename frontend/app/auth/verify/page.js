"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const apiBackend = process.env.NEXT_PUBLIC_API_BACKEND || "http://localhost:5000"

function VerifyContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [status, setStatus] = useState("loading")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      return
    }
    fetch(`${apiBackend}/api/auth/verify?token=${token}`)
      .then((res) => {
        if (res.ok) setStatus("success")
        else setStatus("error")
      })
      .catch(() => setStatus("error"))
  }, [token])

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 py-6">
          {status === "loading" && (
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          )}
          {status === "success" && (
            <>
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <p className="text-muted-foreground">Email verified successfully!</p>
              <Button asChild><Link href="/auth/login">Go to Login</Link></Button>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="h-12 w-12 text-destructive mx-auto" />
              <p className="text-muted-foreground">Invalid or expired verification link.</p>
              <Button asChild><Link href="/">Back to Home</Link></Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={<div className="flex min-h-[100dvh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <VerifyContent />
    </Suspense>
  )
}
