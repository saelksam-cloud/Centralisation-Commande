import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  try {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      // Dynamic import to avoid issues with edge runtime
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfParse = ((await import('pdf-parse')) as any).default ?? (await import('pdf-parse'))
      const data = await pdfParse(buffer)
      return NextResponse.json({ text: data.text, pages: data.numpages })
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const text = buffer.toString('utf-8')
      return NextResponse.json({ text, pages: 1 })
    } else {
      // Try to read as text anyway
      const text = buffer.toString('utf-8')
      return NextResponse.json({ text, pages: 1 })
    }
  } catch (err) {
    console.error('PDF parse error:', err)
    return NextResponse.json({ error: 'Impossible de lire ce fichier' }, { status: 422 })
  }
}
