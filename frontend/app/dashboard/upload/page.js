"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { File, Upload, X, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast"

const apiBackend = process.env.NEXT_PUBLIC_API_BACKEND || "https://datahub.dream10.in"
export default function UploadFile() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState(null)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 50 * 1024 * 1024) {
        setError("File size exceeds 50MB limit")
        setSelectedFile(null)
        return
      }
      setSelectedFile(file)
      setError(null)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.size > 50 * 1024 * 1024) {
        setError("File size exceeds 50MB limit")
        setSelectedFile(null)
        return
      }
      setSelectedFile(file)
      setError(null)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setError(null)
    setUploadProgress(0)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    const formData = new FormData()
    formData.append("file", selectedFile)

    const xhr = new XMLHttpRequest()
    xhr.open("POST", `${apiBackend}/api/file/upload`, true)
    xhr.setRequestHeader("Authorization", `Bearer ${user}`)
    xhr.setRequestHeader("Accept", "application/json")

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100
        setUploadProgress(Math.round(percentComplete))
      }
    }

    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        setUploadComplete(true)
        toast({
          title: "Success",
          description: "File uploaded successfully!"
        })
        setTimeout(() => {
          setIsUploading(false)
          router.push("/dashboard/files")
        }, 1500)
      } else {
        setError("Failed to upload file. Please try again.")
        setIsUploading(false)
      }
    }

    xhr.onerror = () => {
      setError("An error occurred during upload. Please try again.")
      setIsUploading(false)
    }

    xhr.send(formData)
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload File</h1>
          <p className="text-muted-foreground mt-1">Add new files to your storage</p>
        </div>
      </div>
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle>Upload a new file</CardTitle>
          <CardDescription>Drag and drop or select a file. Maximum file size is 50MB.</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 transition-all duration-300 ${isDragging
                ? "border-primary bg-primary/5 scale-105"
                : selectedFile
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-primary/50"
              }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {!selectedFile || uploadComplete ? (
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                {uploadComplete ? (
                  <>
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium text-lg">Upload Complete!</h3>
                      <p className="text-sm text-muted-foreground">Your file has been uploaded successfully</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 group-hover:scale-110 transition-transform">
                      <Upload className="h-10 w-10 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">Drag and drop your file here</h3>
                      <p className="text-sm text-muted-foreground">or click to browse from your computer</p>
                    </div>
                    <Label
                      htmlFor="file-upload"
                      className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Select File
                    </Label>
                    <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 flex-shrink-0">
                      <File className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleRemoveFile} disabled={isUploading} className="ml-2 flex-shrink-0">
                    <X className="h-5 w-5" />
                    <span className="sr-only">Remove file</span>
                  </Button>
                </div>
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Uploading...</span>
                      <span className="font-medium text-primary">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
              </div>
            )}
          </div>
          {error && (
            <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-destructive text-sm font-medium">{error}</p>
            </div>
          )}
        </CardContent>
        {!uploadComplete && (
          <CardFooter className="flex justify-between bg-muted/50">
            <Button variant="outline" onClick={() => router.back()} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFile || isUploading} className="gap-2">
              {isUploading ? (
                <>
                  <Upload className="h-4 w-4 animate-pulse" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload File
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}