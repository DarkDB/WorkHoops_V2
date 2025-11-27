import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    console.log('[UPLOAD] Starting image upload...')
    
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      console.log('[UPLOAD] No session found')
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    console.log('[UPLOAD] User:', session.user.email, 'Role:', session.user.role)

    if (session.user.role !== 'admin') {
      console.log('[UPLOAD] User is not admin')
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.log('[UPLOAD] No file in request')
      return NextResponse.json({ error: 'No file' }, { status: 400 })
    }

    console.log('[UPLOAD] File:', file.name, 'Type:', file.type, 'Size:', file.size)

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      console.log('[UPLOAD] Invalid file type')
      return NextResponse.json({ error: 'Tipo inválido. Use JPG, PNG o WEBP' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      console.log('[UPLOAD] File too large')
      return NextResponse.json({ error: 'Archivo muy grande. Máximo 5MB' }, { status: 400 })
    }

    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const fileExtension = file.name.split('.').pop()
    const fileName = `resources/${timestamp}-${randomString}.${fileExtension}`

    console.log('[UPLOAD] Generated filename:', fileName)

    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    console.log('[UPLOAD] Buffer size:', buffer.length)
    console.log('[UPLOAD] Uploading to Supabase bucket: uploads')

    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (error) {
      console.error('[UPLOAD] Supabase error:', JSON.stringify(error, null, 2))
      return NextResponse.json({ 
        error: 'Error al subir a Supabase',
        details: error.message,
        hint: 'Verifica que el bucket "uploads" existe y es público'
      }, { status: 500 })
    }

    console.log('[UPLOAD] Upload successful:', data)

    const { data: publicUrlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName)

    console.log('[UPLOAD] Public URL:', publicUrlData.publicUrl)

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      fileName,
    })
  } catch (error: any) {
    console.error('[UPLOAD] Exception:', error)
    return NextResponse.json({ 
      error: 'Error al procesar imagen',
      details: error.message 
    }, { status: 500 })
  }
}
