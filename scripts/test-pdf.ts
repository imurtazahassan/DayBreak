import fs from 'fs'
import path from 'path'
import { buildDemoEdition } from '../lib/demo-data'
import { renderEditionPDF } from '../lib/services/pdf-renderer'

async function run() {
  console.log('--- Generating DAYBREAK PDF Verification ---')
  const edition = buildDemoEdition()
  console.log(`Edition items count: ${edition.items.length}`)
  const buffer = await renderEditionPDF(edition)
  console.log(`Rendered PDF buffer size: ${buffer.length} bytes`)
  
  const outDir = path.join(process.cwd(), 'public')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, 'sample-edition.pdf')
  fs.writeFileSync(outPath, buffer)
  console.log(`Saved test PDF to: ${outPath}`)
  console.log('✅ PDF Generation TEST PASSED!')
}

run().catch((err) => {
  console.error('❌ PDF generation failed:', err)
  process.exit(1)
})
