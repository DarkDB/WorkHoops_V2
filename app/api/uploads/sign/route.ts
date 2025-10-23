import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { getServerSession } from 'next-auth'

export const dynamic = 'force-dynamic'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'
import { generatePresignedUrl, validateFileType, validateFileSize } from '@/lib/s3'

export const dynamic = 'force-dynamic'
import { fileUploadSchema } from '@/lib/validations'

export const dynamic = 'force-dynamic'
import { rateLimitByIP } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimit = await rateLimitByIP(ip, 5, 60 * 1000) // 5 requests per minute

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.reset.getTime().toString(),
          }
        }
      )
    }

    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = fileUploadSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { fileName, fileType, fileSize } = validation.data

    // Validate file type
    if (!validateFileType(fileType)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      )
    }

    // Validate file size
    if (!validateFileSize(fileSize)) {
      return NextResponse.json(
        { error: `File size exceeds ${process.env.MAX_FILE_SIZE_MB || 10}MB limit` },
        { status: 400 }
      )
    }

    // Determine folder based on file type
    let folder: 'profiles' | 'cvs' | 'logos' = 'profiles'
    if (fileType === 'application/pdf') {
      folder = 'cvs'
    } else if (fileType.startsWith('image/')) {
      // For now, all images go to profiles folder
      // In the future, you could differentiate between profile images and logos
      folder = 'profiles'
    }

    // Generate presigned URL
    const { uploadUrl, fileUrl, key } = await generatePresignedUrl(
      fileName,
      fileType,
      fileSize,
      folder
    )

    return NextResponse.json({
      uploadUrl,
      fileUrl,
      key,
    })

  } catch (error) {
    console.error('Upload sign error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}