// Server-side wrapper: produces a PPTX Buffer instead of triggering download.
//
// Kept in a separate module so the browser bundle doesn't try to require Node
// stream APIs.

import { buildPptxInstance } from './pptx'
import type { EditorPresentation } from '../types'

export async function buildPPTX(presentation: EditorPresentation): Promise<Buffer> {
  const pptx = await buildPptxInstance(presentation)
  // pptxgenjs supports `stream`/`outputType: 'nodebuffer'` for Node usage.
  const data = await pptx.write({ outputType: 'nodebuffer' })
  if (Buffer.isBuffer(data)) return data
  if (typeof data === 'string') return Buffer.from(data, 'binary')
  if (data instanceof Uint8Array) return Buffer.from(data)
  throw new Error(`unexpected pptxgenjs output type: ${typeof data}`)
}
