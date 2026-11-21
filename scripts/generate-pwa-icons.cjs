#!/usr/bin/env node
/**
 * Script de geração de ícones PWA para o projeto Dona Cá Doceria — Confeitaria Artesanal.
 *
 * Pré-requisito: npm install -D sharp
 * Fonte: src/assets/logo-donaca.jpg
 *
 * Saída (em public/):
 *   - apple-touch-icon.png  (180x180, fundo sólido)
 *   - icon-192.png          (192x192, fundo sólido)
 *   - icon-512.png          (512x512, fundo sólido)
 */

const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const ROOT_DIR = path.resolve(__dirname, '..')
const PUBLIC_DIR = path.resolve(ROOT_DIR, 'public')
const SOURCE_LOGO = path.resolve(ROOT_DIR, 'src', 'assets', 'logo-donaca.jpg')
const BACKGROUND_COLOR = '#FFFFFF' // cor de fundo da marca (sem transparência)

const ICONS = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
]

async function main() {
  if (!fs.existsSync(SOURCE_LOGO)) {
    console.error(`✗ Logo fonte não encontrada: ${SOURCE_LOGO}`)
    process.exit(1)
  }

  for (const icon of ICONS) {
    // Redimensiona a logo para ocupar até 80% do quadrado (mantendo proporção exata)
    const innerSize = Math.round(icon.size * 0.8)

    const resizedLogo = await sharp(SOURCE_LOGO)
      .resize({
        width: innerSize,
        height: innerSize,
        fit: 'inside',
        withoutEnlargement: false,
      })
      .toBuffer()

    // Cria o fundo sólido #FAF7F5, centraliza a logo e salva em PNG sem transparência
    await sharp({
      create: {
        width: icon.size,
        height: icon.size,
        channels: 3,
        background: BACKGROUND_COLOR,
      },
    })
      .composite([{ input: resizedLogo, gravity: 'center' }])
      .png()
      .toFile(path.resolve(PUBLIC_DIR, icon.name))

    console.log(`✓ Gerado: public/${icon.name} (${icon.size}x${icon.size})`)
  }
}

main().catch((err) => {
  console.error('✗ Erro ao gerar ícones:', err.message)
  process.exit(1)
})