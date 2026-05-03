const sharp = require('sharp')

const svg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="0" fill="#0F6E56"/>
  <g transform="translate(106, 106) scale(12.5)" fill="#9FE1CB">   
  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/> </g>
</svg>
`

async function generarIconos() {
  const svgBuffer = Buffer.from(svg)

  await sharp(svgBuffer).resize(192, 192).png().toFile('public/icon-192.png')
  console.log('✓ icon-192.png generado')

  await sharp(svgBuffer).resize(512, 512).png().toFile('public/icon-512.png')
  console.log('✓ icon-512.png generado')

  await sharp(svgBuffer).resize(32, 32).png().toFile('public/favicon.png')
  console.log('✓ favicon.png generado')

  console.log('¡Íconos listos!')
}

generarIconos().catch(console.error)