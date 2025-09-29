import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { nanoid } from 'nanoid'

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/webp'
]

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf'
]

export interface PresignedUrlResponse {
  uploadUrl: string
  fileUrl: string
  key: string
}

export async function generatePresignedUrl(
  fileName: string,
  fileType: string,
  fileSize: number,
  folder: 'profiles' | 'cvs' | 'logos' = 'profiles'
): Promise<PresignedUrlResponse> {
  // Validate file size
  if (fileSize > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`)
  }

  // Validate file type
  const isImage = ALLOWED_IMAGE_TYPES.includes(fileType)
  const isDocument = ALLOWED_DOCUMENT_TYPES.includes(fileType)
  
  if (!isImage && !isDocument) {
    throw new Error(`File type ${fileType} not allowed`)
  }

  // Generate safe file name
  const fileExtension = fileName.split('.').pop()
  const safeFileName = `${nanoid(12)}.${fileExtension}`
  const key = `${folder}/${safeFileName}`

  // Create presigned URL for upload
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: fileType,
    ContentLength: fileSize,
    Metadata: {
      'original-name': fileName,
      'upload-date': new Date().toISOString(),
    },
  })

  const uploadUrl = await getSignedUrl(s3Client, command, { 
    expiresIn: 3600 // 1 hour
  })

  const fileUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`

  return {
    uploadUrl,
    fileUrl,
    key,
  }
}

export function validateFileType(fileType: string): boolean {
  return [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES].includes(fileType)
}

export function validateFileSize(fileSize: number): boolean {
  return fileSize <= MAX_FILE_SIZE
}

export function getFileTypeCategory(fileType: string): 'image' | 'document' | 'unknown' {
  if (ALLOWED_IMAGE_TYPES.includes(fileType)) return 'image'
  if (ALLOWED_DOCUMENT_TYPES.includes(fileType)) return 'document'
  return 'unknown'
}