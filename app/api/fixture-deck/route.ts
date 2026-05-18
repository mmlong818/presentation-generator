import { NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import path from 'node:path'

export const runtime = 'nodejs'

// Serves the 21-layout test deck for /edit smoke testing.
export async function GET() {
  const filePath = path.join(process.cwd(), 'pptx-service', 'converter', 'sample_all_layouts.json')
  try {
    const buf = await fs.readFile(filePath, 'utf-8')
    return NextResponse.json(JSON.parse(buf))
  }
  catch (err) {
    return NextResponse.json(
      { error: `read failed: ${(err as Error).message}` },
      { status: 500 },
    )
  }
}
