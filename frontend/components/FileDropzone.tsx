'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface FileDropzoneProps {
  onFileSelect: (file: File) => void
  onFileRemove?: () => void
  accept?: Record<string, string[]>
  maxSize?: number
  currentFile?: string | null
  className?: string
  disabled?: boolean
}

export function FileDropzone({
  onFileSelect,
  onFileRemove,
  accept = {
    'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
    'application/pdf': ['.pdf'],
  },
  maxSize = 10 * 1024 * 1024, // 10MB
  currentFile,
  className,
  disabled = false,
}: FileDropzoneProps) {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        const firstRejection = rejectedFiles[0]
        if (firstRejection.errors[0]?.code === 'file-too-large') {
          setError(`El archivo es demasiado grande. Máximo ${maxSize / (1024 * 1024)}MB`)
        } else if (firstRejection.errors[0]?.code === 'file-invalid-type') {
          setError('Tipo de archivo no permitido')
        } else {
          setError('Error al subir el archivo')
        }
        setUploadStatus('error')
        return
      }

      if (acceptedFiles.length > 0) {
        setError(null)
        setUploadStatus('uploading')
        setUploadProgress(0)

        // Simulate upload progress
        const interval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 100) {
              clearInterval(interval)
              setUploadStatus('success')
              onFileSelect(acceptedFiles[0])
              return 100
            }
            return prev + 10
          })
        }, 100)
      }
    },
    [onFileSelect, maxSize]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled: disabled || uploadStatus === 'uploading',
  })

  const handleRemove = () => {
    setUploadStatus('idle')
    setUploadProgress(0)
    setError(null)
    onFileRemove?.()
  }

  if (currentFile && uploadStatus === 'idle') {
    return (
      <Card className={cn("p-4", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-medium">Archivo subido</p>
              <p className="text-xs text-muted-foreground">
                {currentFile.split('/').pop()}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className={cn("w-full", className)}>
      <Card
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed cursor-pointer transition-colors p-6",
          isDragActive && "border-workhoops-accent bg-workhoops-accent/5",
          uploadStatus === 'error' && "border-red-300 bg-red-50",
          uploadStatus === 'success' && "border-green-300 bg-green-50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="text-center">
          {uploadStatus === 'uploading' ? (
            <div className="space-y-3">
              <Upload className="w-8 h-8 mx-auto text-workhoops-accent animate-pulse" />
              <div>
                <p className="text-sm font-medium">Subiendo archivo...</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-workhoops-accent h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {uploadProgress}%
                </p>
              </div>
            </div>
          ) : uploadStatus === 'error' ? (
            <div className="space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-600">Error al subir archivo</p>
                <p className="text-xs text-red-500">{error}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setError(null)
                  setUploadStatus('idle')
                }}
              >
                Intentar de nuevo
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <File className="w-8 h-8 mx-auto text-gray-400" />
              <div>
                <p className="text-sm font-medium">
                  {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra un archivo o haz clic para seleccionar'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Máximo {maxSize / (1024 * 1024)}MB - Imágenes y PDFs
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}