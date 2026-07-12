"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Download, FileText, MoreVertical, UserPlus, Search, Share2, Link2, Eye, Trash, Upload, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/contexts/auth-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

// Skeleton component for loading states
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-muted ${className}`} />
)

const apiBackend = process.env.NEXT_PUBLIC_API_BACKEND || "https://datahub.dream10.in";
// Utility function to format file size
function formatFileSize(sizeInBytes) {
  if (sizeInBytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(sizeInBytes) / Math.log(1024))
  return `${(sizeInBytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

export default function Files() {
  const [searchQuery, setSearchQuery] = useState("")
  const { user } = useAuth()
  const [files, setFiles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sharingFile, setSharingFile] = useState(null)
  const [shareEmail, setShareEmail] = useState('')
  const [isSharing, setIsSharing] = useState(false)
  const [shareError, setShareError] = useState(null)
  const [sortColumn, setSortColumn] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [deletingFile, setDeletingFile] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!user) return
    const fetchFiles = async () => {
      try {
        const response = await fetch(`${apiBackend}/api/file/my-files`, {
          headers: {
            Authorization: `Bearer ${user}`
          }
        })
        if (!response.ok) throw new Error('Failed to fetch files')
        const data = await response.json()

        const transformedFiles = data.data.map(file => ({
          id: file._id,
          name: file.original_name,
          type: file.extension.slice(1).toUpperCase(),
          size: formatFileSize(file.file_size),
          sizeInBytes: file.file_size,
          updatedAt: new Date(file.updatedAt).toLocaleDateString(),
          updatedAtDate: new Date(file.updatedAt),
          message_id: file.message_id,
          download: file.download || 0
        }))
        setFiles(transformedFiles)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFiles()
  }, [user])

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortColumn === 'name') {
      return sortDirection === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    } else if (sortColumn === 'type') {
      return sortDirection === 'asc' ? a.type.localeCompare(b.type) : b.type.localeCompare(a.type)
    } else if (sortColumn === 'size') {
      return sortDirection === 'asc' ? a.sizeInBytes - b.sizeInBytes : b.sizeInBytes - a.sizeInBytes
    } else if (sortColumn === 'updatedAt') {
      return sortDirection === 'asc' ? a.updatedAtDate - b.updatedAtDate : b.updatedAtDate - a.updatedAtDate
    } else if (sortColumn === 'download') {
      return sortDirection === 'asc' ? a.download - b.download : b.download - a.download
    }
    return 0
  })

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const handleDownload = async (fileId) => {
    const file = files.find(f => f.id === fileId)
    if (file) {
      try {
        const res = await fetch(`${apiBackend}/api/file/download/${file.message_id}`, {
          headers: { Authorization: `Bearer ${user}` }
        });
        if (!res.ok) throw new Error('Download failed');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = file.name; a.click();
        URL.revokeObjectURL(url);
      } catch(e) { console.error(e); }
    }
  }

  const handleDelete = (file) => {
    setDeletingFile(file)
  }

  const handleConfirmDelete = async () => {
    if (!deletingFile) return
    setIsDeleting(true)
    try {
      const response = await fetch(`${apiBackend}/api/file/${deletingFile.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user}`
        }
      })
      if (!response.ok) throw new Error('Failed to delete file')
      setFiles(files.filter(f => f.id !== deletingFile.id))
      toast({
        title: "Success",
        description: "File deleted successfully"
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
      setDeletingFile(null)
    }
  }

  const handleShareSubmit = async () => {
    if (!sharingFile) return
    if (!shareEmail || !/^\S+@\S+\.\S+$/.test(shareEmail)) {
      setShareError('Please enter a valid email address')
      return
    }
    setIsSharing(true)
    setShareError(null)
    try {
      const response = await fetch(`${apiBackend}/api/file/share/${sharingFile.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user}`
        },
        body: JSON.stringify({ email: shareEmail })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to share file')
      toast({
        title: "Success",
        description: "File shared successfully"
      })
      setSharingFile(null)
      setShareEmail('')
    } catch (err) {
      setShareError(err.message)
    } finally {
      setIsSharing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-10 flex-1" />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) return <div className="text-destructive">{error}</div>

  return (
    <div className="space-y-6">
      {/* Share Dialog */}
      <Dialog open={sharingFile !== null} onOpenChange={(open) => { if (!open) { setSharingFile(null); setShareEmail(''); setShareError(null); } }}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-wide">
              Share "{sharingFile?.name}" with User
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Grant access by entering an email address. The user will be notified and gain immediate access.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                User Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter user's email address"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                className="px-4 py-2 text-base border-muted rounded-xl shadow-sm"
              />
              <p className="text-xs text-muted-foreground">
                The user will receive a notification and access to this file.
              </p>
            </div>
          </div>
          {shareError && <p className="text-destructive text-sm">{shareError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSharingFile(null)}>Cancel</Button>
            <Button onClick={handleShareSubmit} disabled={isSharing}>
              {isSharing ? 'Sharing...' : 'Share File'}
              <Share2 className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deletingFile !== null} onOpenChange={(open) => { if (!open) setDeletingFile(null); }}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-wide">
              Delete File Permanently
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Are you sure you want to delete "{deletingFile?.name}"? This action cannot be undone, and any users you have shared this file with will lose access.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingFile(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My Files</h1>
        <Button asChild>
          <Link href="/dashboard/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload File
          </Link>
        </Button>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Files</CardTitle>
          <CardDescription>Manage your uploaded files</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              className="flex-1 rounded-xl shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                    Name {sortColumn === 'name' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 inline" /> : <ChevronDown className="h-4 w-4 inline" />)}
                  </TableHead>
                  <TableHead className="hidden sm:table-cell cursor-pointer" onClick={() => handleSort('type')}>
                    Type {sortColumn === 'type' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 inline" /> : <ChevronDown className="h-4 w-4 inline" />)}
                  </TableHead>
                  <TableHead className="hidden sm:table-cell cursor-pointer" onClick={() => handleSort('size')}>
                    Size {sortColumn === 'size' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 inline" /> : <ChevronDown className="h-4 w-4 inline" />)}
                  </TableHead>
                  <TableHead className="hidden md:table-cell cursor-pointer" onClick={() => handleSort('updatedAt')}>
                    Updated {sortColumn === 'updatedAt' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 inline" /> : <ChevronDown className="h-4 w-4 inline" />)}
                  </TableHead>
                  <TableHead className="hidden md:table-cell cursor-pointer" onClick={() => handleSort('download')}>
                    Downloads {sortColumn === 'download' && (sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 inline" /> : <ChevronDown className="h-4 w-4 inline" />)}
                  </TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedFiles.length > 0 ? (
                  sortedFiles.map((file) => (
                    <TableRow key={file.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {file.name}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{file.type}</TableCell>
                      <TableCell className="hidden sm:table-cell">{file.size}</TableCell>
                      <TableCell className="hidden md:table-cell">{file.updatedAt}</TableCell>
                      <TableCell className="hidden md:table-cell">{file.download}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDownload(file.id)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download File
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSharingFile(file)}>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Share with User
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled>
                              <Link2 className="mr-2 h-4 w-4" />
                              Generate Share Link
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled>
                              <Eye className="mr-2 h-4 w-4" />
                              Set File Visibility
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(file)}>
                              <Trash className="mr-2 h-4 w-4" />
                              Delete File
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No files found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}