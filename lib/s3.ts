import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { nanoid } from 'nanoid'

type S3Config = {
  region: string
  accessKeyId: string
  secretAccessKey: string
  bucketName: string
}

let s3Client: S3Client | null = null
let s3Config: S3Config | null = null

function getS3Config(): S3Config {
  if (s3Config) {
    return s3Config
  }

  const region = process.env.AWS_REGION?.trim()
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim()
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim()
  const bucketName = process.env.AWS_S3_BUCKET_NAME?.trim()

  if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error(
      'AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY and AWS_S3_BUCKET_NAME are required'
    )
  }

  s3Config = { region, accessKeyId, secretAccessKey, bucketName }
  return s3Config
}

export function getS3Client(): S3Client {
  if (s3Client) {
    return s3Client
  }

  const config = getS3Config()
  s3Client = new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  })

  return s3Client
}

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
  const config = getS3Config()

  // Create presigned URL for upload
  const command = new PutObjectCommand({
    Bucket: config.bucketName,
    Key: key,
    ContentType: fileType,
    ContentLength: fileSize,
    Metadata: {
      'original-name': fileName,
      'upload-date': new Date().toISOString(),
    },
  })

  const uploadUrl = await getSignedUrl(getS3Client(), command, {
    expiresIn: 3600 // 1 hour
  })

  const fileUrl = `https://${config.bucketName}.s3.${config.region}.amazonaws.com/${key}`

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
