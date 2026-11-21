
/**
 * parseNfceText.js
 * Parser nativo de texto copiado da página da SEFAZ-RJ (resultadoQRCode2.faces).
 *
 * O texto copiado do portal da SEFAZ-RJ segue o formato:
 *
 *   RFC COMERCIO DE MIUDEZAS LTDA
 *   CNPJ: 26.514.797/0014-53
 *   ...
 *   CREME LEITE 20 P.1.C.200 (Código: 255929 )
 *   Qtde.:6  UN: UN  Vl. Unit.:   3,49	Vl. Total
 *   20,94
 *   ...
 *   Valor a pagar R$:175,59
 *   ...
 *   Emissão: 20/11/2026 09:53:36-03:00
 *   Chave de acesso:
 *   3326 1126 5147 9700 1453 6510 5000 0067 0910 0006 7345
 */

/** Normaliza número brasileiro "3,49" -> 3.49, "1.250,50" -> 1250.50 */
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

/**
 * Extrai informações da chave de acesso: 44 dígitos.
 * O texto pode ter espaços a cada 4 dígitos.
 */
function extractAccessKey(text) {
  const match = text.match(/Chave de\s*acesso\s*:\s*\n?\s*([\d\s]{40,60})/i)
  if (!match) return null
  const digits = match[1].replace(/\s/g, '')
  return digits.length === 44 ? digits : null
}

/** Extrai a razão social: primeira linha válida antes de "CNPJ:" */
function extractStoreName(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // Pula cabeçalhos do documento auxiliar
    if (/DOCUMENTO\s*AUXILIAR/i.test(line)) continue
    if (/^DANFE/i.test(line)) continue
    if (/^NFC-e/i.test(line)) continue
    if (/CNPJ/.test(line)) {
      // A linha anterior (ou a atual se não tiver CNPJ na mesma linha) é o nome
      if (i > 0) return lines[i - 1]
      // Se o CNPJ está na mesma linha, tenta extrair o nome antes
      const namePart = line.split(/CNPJ/i)[0].trim()
      if (namePart.length > 3) return namePart
      continue
    }
    // Primeira linha substancial que não seja cabeçalho
    if (line.length > 3 && !/^[\d\s\-:/]+$/.test(line)) {
      return line
    }
  }
  return ''
}

/** Extrai data de emissão: "Emissão: DD/MM/YYYY HH:MM:SS-TZ" */
function extractIssueDate(text) {
  const match = text.match(/Emissão\s*:\s*(\d{2})\/(\d{2})\/(\d{4})/i)
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
 * Extrai itens da nota fiscal.
 * Formato esperado:
 *   DESCRICAO (Código: 12345 )
 *   Qtde.:6  UN: UN  Vl. Unit.:   3,49	Vl. Total
 *   20,94
 */
function extractItems(text) {
  const items = []
  const lines = text.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Detecta linha com "(Código: ...)"
    const codeMatch = line.match(/\(Código\s*:\s*([^)]+)\)/i)
    if (!codeMatch) continue

    const rawDesc = line.replace(/\(Código\s*:\s*[^)]+\)/i, '').trim()
    if (!rawDesc || rawDesc.length < 2) continue

    // Próxima linha deve conter Qtde/UN/Vl. Unit.
    const qtyLine = lines[i + 1] || ''
    const qtyMatch = qtyLine.match(/Qtde\s*:\s*([\d.,]+)/i)
    const unitMatch = qtyLine.match(/UN\s*:\s*(\S+)/i)
    const priceMatch = qtyLine.match(/Vl\.\s*Unit\.\s*:\s*([\d.,]+)/i)

    if (!qtyMatch) continue

    const quantity = normalizeBRLNumber(qtyMatch[1])
    const unitPrice = priceMatch ? normalizeBRLNumber(priceMatch[1]) : 0

    // O valor total pode estar na mesma linha (após Vl. Total) ou na linha seguinte
    let totalPrice = 0
    const totalSameLine = qtyLine.match(/Vl\.\s*Total\s*:\s*([\d.,]+)/i)
    if (totalSameLine) {
      totalPrice = normalizeBRLNumber(totalSameLine[1])
    } else if (lines[i + 2]) {
      // Valor total na linha seguinte
      const nextLine = lines[i + 2].trim()
      const totalNextMatch = nextLine.match(/^([\d.,]+)$/)
      if (totalNextMatch) {
        totalPrice = normalizeBRLNumber(totalNextMatch[1])
      }
    }

    items.push({
      raw_description: rawDesc,
      quantity,
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

/**
 * Inferência inteligente de embalagem a partir da descrição.
 * Detecta pesos/volumes comuns:
 *   395 → 395g
 *   200M → 200ml
 *   1L → 1000ml
 *   1,05K → 1050g
 *   100G → 100g
 *   50U / 20UN → 50un / 20un
 *
 * Retorna { packageSize, baseUnit, purchaseUnit } sugerido.
 */
function inferPackageInfo(description) {
  if (!description) return { packageSize: 1, baseUnit: 'un', purchaseUnit: 'un' }

  const desc = description.toUpperCase()

  // Padrão: número + sufixo (ex: 395G, 200ML, 1L, 1,05KG, 50U, 20UN)
  const patterns = [
    // Kg / K
    [/([\d.,]+)\s*KG\b/i, 'g', (v) => Math.round(v * 1000)],
    [/([\d.,]+)\s*K\b/i, 'g', (v) => Math.round(v * 1000)],
    // g / G
    [/([\d.,]+)\s*G\b/i, 'g', (v) => v],
    // ml / ml
    [/([\d.,]+)\s*ML\b/i, 'ml', (v) => v],
    // L
    [/([\d.,]+)\s*L\b/i, 'ml', (v) => Math.round(v * 1000)],
    // un / U
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

  // Se encontrou apenas um número isolado (ex: "395" sem sufixo), assume gramas
  const isolatedNumber = desc.match(/\b(\d{2,4})\b/)
  if (isolatedNumber) {
    const value = parseInt(isolatedNumber[1], 10)
    if (value >= 10 && value <= 5000) {
      return { packageSize: value, baseUnit: 'g', purchaseUnit: 'cx' }
    }
  }

  return { packageSize: 1, baseUnit: 'un', purchaseUnit: 'un' }
}

/**
 * Função principal: parseia texto copiado da página da SEFAZ-RJ.
 * Retorna objeto compatível com o fluxo de conciliação do painel de gestão.
 */
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

  if (items.length === 0) {
    return {
      success: false,
      error: 'Nenhum item encontrado no texto colado. Verifique se copiou o conteúdo completo da nota fiscal.',
      accessKey: accessKey || '',
      storeName: storeName || 'Estabelecimento não identificado',
      issueDate,
      totalAmount,
      debugHint: rawText.substring(0, 300),
    }
  }

  return {
    success: true,
    accessKey: accessKey || '',
    storeName: storeName || 'Estabelecimento não identificado',
    issueDate,
    totalAmount,
    items: items.map((item) => ({
      ...item,
      suggestedPackage: inferPackageInfo(item.raw_description),
    })),
    message: 'Nota fiscal processada com sucesso (texto colado).',
  }
}
