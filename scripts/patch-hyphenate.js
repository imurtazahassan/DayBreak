const fs = require('fs')
const path = require('path')

const target = path.join(
  process.cwd(),
  'node_modules',
  '@react-pdf',
  'hyphenate',
  'package.json'
)

if (fs.existsSync(target)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(target, 'utf-8'))
    if (pkg.exports && pkg.exports['./*'] && !pkg.exports['./*'].default) {
      pkg.exports['.'].default = pkg.exports['.'].import || './lib/index.js'
      pkg.exports['./*'].default = pkg.exports['./*'].import || './lib/*.js'
      fs.writeFileSync(target, JSON.stringify(pkg, null, 2), 'utf-8')
      console.log('✓ Successfully patched @react-pdf/hyphenate for Node 20+ compatibility')
    }
  } catch (err) {
    console.warn('Notice: patch-hyphenate check skipped:', err.message)
  }
}
