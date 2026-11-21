
/**
 * parseNfceText.js
 * Parser nativo de texto copiado da página da SEFAZ-RJ (resultadoQRCode2.faces).
 *
 * Abordagem linha a linha, resiliente a tabulações (\t), espaços duplos
 * e quebras de linha do celular.
 */

/** Normaliza número brasileiro: "3,49" → 3.49, "1.250,50" → 1250.50 */
function normalizeBRLNumber(text) {
  if (!text) return 0
  const cleaned = String(text).replace(/[^\d,.-]/g, '').trim()
  if (!cleaned) return 0
  if (cleaned.includes(',')) {
    const withoutDots = cleaned.replace(/\./g, '')
    const normalized = withoutDots.replace(',', '.')
    const val = parseFloat(normalized)
    return isNaN(val) ? 0 : val
  }
  const val = parseFloat(cleaned)
  return isNaN(val) ? 0 : val
}

/** Arredonda para 2 casas decimais */
function round2(v) {
  return Math.round(v * 100) / 100
}

/** Extrai a chave de acesso (44 dígitos) após "Chave de acesso:" */
function extractAccessKey(text) {
  const match = text.match(/Chave\s*de\s*acesso\s*:/i)
  if (!match) return null
  const after = text.slice(match.index + match[0].length)
  const digits = after.replace(/\D/g, '')
  return digits.length >= 44 ? digits.slice(0, 44) : null
}

/** Extrai o nome do estabelecimento: linha imediatamente anterior à que começa com "CNPJ:" */
function extractStoreName(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  for (let i = 0; i < lines.length; i++) {
    if (/^CNPJ/i.test(lines[i])) {
      if (i > 0) {
        return lines[i - 1].replace(/\(Código\s*:\s*[^)]+\)/i, '').trim()
      }
    }
  }
  // Fallback: primeira linha substancial que não seja cabeçalho
  for (const line of lines) {
    if (/DOCUMENTO\s*AUXILIAR/i.test(line)) continue
    if (/^DANFE/i.test(line)) continue
    if (/^NFC-e/i.test(line)) continue
    if (/^CNPJ/i.test(line)) continue
    if (line.length > 3 && !/^[\d\s\-:/]+$/.test(line)) {
      return line
    }
  }
  return ''
}

/** Extrai data de emissão: "Emissão: DD/MM/YYYY" → "YYYY-MM-DD" */
function extractIssueDate(text) {
  const match = text.match(/Emiss[ãa]o:\s*(\d{2})\/(\d{2})\/(\d{4})/i)
  if (!match) return null
  const [, d, m, y] = match
  return `${y}-${m}-${d}`
}

/** Extrai valor total: "Valor a pagar R$:175,59" ou "Valor total R$:175,59" */
function extractTotalAmount(text) {
  const match = text.match(/Valor\s+a\s*pagar\s*R?\$?:\s*([\d.,]+)/i)
  if (match) return normalizeBRLNumber(match[1])
  const match2 = text.match(/Valor\s+total\s*R?\$?:\s*([\d.,]+)/i)
  if (match2) return normalizeBRLNumber(match2[1])
  return 0
}

/**
 * Extrai itens por âncora "Qtde.".
 * Formato esperado:
 *   DESCRICAO (Código: 12345 )
 *   Qtde.:6  UN: UN  Vl. Unit.:   3,49	Vl. Total
 *   20,94
 */
function extractItems(text) {
  // Normaliza quebras de linha do Windows/mobile e divide em linhas
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = normalized.split('\n').map((l) => l.trim()).filter(Boolean)

  const items = []

  // Regex da âncora Qtde.
  const qtdeRegex = /Qtde\.?\s*:\s*([\d.,]+)\s+UN\s*:\s*([A-Za-z0-9ãçõé]+)\s+Vl\.?\s*Unit\.?\s*:\s*([\d.,]+)/i

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const m = line.match(qtdeRegex)
    if (!m) continue

    // Descrição: linha anterior (i-1), remove "(Código: ...)" do final
    let description = ''
    if (i > 0) {
      description = lines[i - 1].replace(/\(Código\s*:\s*[^)]+\)/i, '').trim()
    }
    if (!description || description.length < 2) continue

    const quantity = normalizeBRLNumber(m[1])
    const unit = m[2]
    const unitPrice = normalizeBRLNumber(m[3])

    // Valor total: verifica se há após "Vl. Total" na mesma linha
    let totalPrice = 0
    const totalSameLine = line.match(/Vl\.?\s*Total\.?\s*:?\s*([\d.,]+)/i)
    if (totalSameLine) {
      totalPrice = normalizeBRLNumber(totalSameLine[1])
    } else if (lines[i + 1]) {
      // Valor total na linha seguinte
      const nextLine = lines[i + 1]
      const totalNextMatch = nextLine.match(/^([\d.,]+)$/)
      if (totalNextMatch) {
        totalPrice = normalizeBRLNumber(totalNextMatch[1])
      }
    }

    // Fallback: quantidade × preço unitário
    if (!totalPrice && quantity > 0 && unitPrice > 0) {
      totalPrice = round2(quantity * unitPrice)
    }

    items.push({
      raw_description: description,
      quantity,
      unit: unit,
      unit_price: unitPrice,
      total_price: totalPrice,
    })
  }

  // Remove duplicados
  const uniqueItems = items.filter(
    (item, index) =>
      index ===
      items.findIndex(
        (i) => i.raw_description.toLowerCase() === item.raw_description.toLowerCase()
      )
  )

  return uniqueItems
}

/** Inferência inteligente de embalagem a partir da descrição */
function inferPackageInfo(description) {
  if (!description) return { packageSize: 1, baseUnit: 'un', purchaseUnit: 'un' }

  const desc = description.toUpperCase()

  const patterns = [
    [/([\d.,]+)\s*KG\b/i, 'g', (v) => Math.round(v * 1000)],
    [/([\d.,]+)\s*K\b/i, 'g', (v) => Math.round(v * 1000)],
    [/([\d.,]+)\s*G\b/i, 'g', (v) => v],
    [/([\d.,]+)\s*ML\b/i, 'ml', (v) => v],
    [/([\d.,]+)\s*L\b/i, 'ml', (v) => Math.round(v * 1000)],
    [/([\d.,]+)\s*UN\b/i, 'un', (v) => v],
    [/([\d.,]+)\s*U\b/i, 'un', (v) => v],
  ]

  for (const [regex, baseUnit, converter] of patterns) {
    const match = desc.match(regex)
    if (match) {
      const rawValue = match[1].replace(',', '.')
      const value = parseFloat(rawValue)
      if (!isNaN(value)) {
        return {
          packageSize: converter(value),
          baseUnit,
          purchaseUnit: baseUnit === 'g' || baseUnit === 'ml' ? 'cx' : 'un',
        }
      }
    }
  }

  const isolatedNumber = desc.match(/\b(\d{2,4})\b/)
  if (isolatedNumber) {
    const value = parseInt(isolatedNumber[1], 10)
    if (value >= 10 && value <= 5000) {
      return { packageSize: value, baseUnit: 'g', purchaseUnit: 'cx' }
    }
  }

  return { packageSize: 1, baseUnit: 'un', purchaseUnit: 'un' }
}

/** Função principal: parseia texto copiado da página da SEFAZ-RJ */
export function parseNfceCopiedText(rawText) {
  if (!rawText || !rawText.trim()) {
    return {
      success: false,
      error: 'Texto vazio. Cole o conteúdo completo da nota fiscal.',
      items: [],
    }
  }

  const storeName = extractStoreName(rawText)
  const issueDate = extractIssueDate(rawText)
  const accessKey = extractAccessKey(rawText)
  const totalAmount = extractTotalAmount(rawText)
  const items = extractItems(rawText)

  // Fallback do total: soma dos itens se não encontrou no texto
  let finalTotal = totalAmount
  if (!finalTotal && items.length > 0) {
    finalTotal = round2(items.reduce((sum, it) => sum + it.total_price, 0))
  }

  if (items.length === 0) {
    return {
      success: false,
      error: 'Nenhum item encontrado no texto colado. Verifique se copiou o conteúdo completo da nota fiscal.',
      accessKey: accessKey || '',
      storeName: storeName || 'Estabelecimento não identificado',
      issueDate,
      totalAmount: finalTotal,
      debugHint: rawText.substring(0, 300),
    }
  }

  return {
    success: true,
    accessKey: accessKey || '',
    storeName: storeName || 'Estabelecimento não identificado',
    issueDate,
    totalAmount: finalTotal,
    items: items.map((item) => ({
      ...item,
      suggestedPackage: inferPackageInfo(item.raw_description),
    })),
    message: 'Nota fiscal processada com sucesso (texto colado).',
  }
}
