'use client'
import React, { useState, useEffect } from "react"
import Link from "next/link"
import { FileText, Upload, CloudDownload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
const apiBackend = process.env.NEXT_PUBLIC_API_BACKEND || "https://datahub.dream10.in";

// Skeleton component for loading states
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-muted ${className}`} />
)

// Utility to format storage size into appropriate units
function formatStorage(size) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  let unitIndex = 0
  let formattedSize = Number(size)
  while (formattedSize >= 1024 && unitIndex < units.length - 1) {
    formattedSize /= 1024
    unitIndex++
  }
  return `${formattedSize.toFixed(1)} ${units[unitIndex]}`
}

export default function Dashboard() {
  const [storageData, setStorageData] = useState({ used: BigInt(0), total: BigInt(1) })
  const [recentFiles, setRecentFiles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user, logout } = useAuth()

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`${apiBackend}/api/file/my-files`, {
          headers: {
            Authorization: `Bearer ${user}`
          }
        })

        if (response.status === 401) {
          logout() // call your logout function here
          return
        }

        if (!response.ok) throw new Error('Failed to fetch data')

        const data = await response.json()

        setStorageData({
          used: BigInt(data.stats?.storageUsed || data.stats?.totalStorage || '0'),
          total: BigInt(data.stats?.storageTotal || '1099511627776') // 1TB default
        })

        setRecentFiles(data.data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user])


  // Calculate percentage using Number conversion for display
  const storagePercentage = (Number(storageData.used) / Number(storageData.total)) * 100

  // Convert storage to readable format
  const usedStorage = formatStorage(storageData.used)
  const totalStorage = formatStorage(storageData.total)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8" />
                    <div>
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24 mt-1" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return <div className="text-destructive text-center">{error}</div>
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your storage overview</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/dashboard/upload">
            <Upload className="h-4 w-4" />
            Upload File
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-2">
            <CardTitle>Storage</CardTitle>
            <CardDescription>Your storage usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">
                {usedStorage} of {totalStorage} used
              </span>
              <span className="text-sm font-bold text-primary">{storagePercentage.toFixed(0)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500" style={{ width: `${storagePercentage}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-2">
            <CardTitle>Files</CardTitle>
            <CardDescription>Total files in your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <span className="block text-3xl font-bold">{recentFiles.length}</span>
                <span className="text-xs text-muted-foreground">files stored</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="pb-2">
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button asChild variant="outline" className="justify-start hover:bg-primary hover:text-primary-foreground transition-colors">
              <Link href="/dashboard/upload">
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start hover:bg-primary hover:text-primary-foreground transition-colors">
              <Link href="/dashboard/files">
                <FileText className="mr-2 h-4 w-4" />
                View All Files
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Files</CardTitle>
              <CardDescription>Recently uploaded or modified files</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/files">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No files yet</p>
              <Button asChild variant="link" className="mt-2">
                <Link href="/dashboard/upload">Upload your first file</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentFiles.slice(0, 5).map((file) => (
                <div
                  key={file._id}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate group-hover:text-primary transition-colors">{file.original_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {file.download || 0} downloads • {new Date(file.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={async () => {
                    try {
                      const res = await fetch(`${apiBackend}/api/file/download/${file.message_id}`, {
                        headers: { Authorization: `Bearer ${user}` }
                      });
                      if (!res.ok) throw new Error('Download failed');
                      const blob = await res.blob();
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url; a.download = file.original_name; a.click();
                      URL.revokeObjectURL(url);
                    } catch(e) { console.error(e); }
                  }}>
                    <CloudDownload size={20} />
                    <span className="sr-only">Download</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}