
/**
 * api/parse-nfce.js
 * Vercel Serverless Function — Parser de NFC-e (SEFAZ-RJ)
 *
 * Recebe a URL do QR Code da NFC-e, faz o fetch no servidor (evitando CORS),
 * extrai dados do estabelecimento, data, chave de acesso (44 dígitos) e itens,
 * retornando um JSON limpo para o painel de gestão.
 *
 * Ajustes para layout oficial da NFC-e Rio de Janeiro (fazenda.rj.gov.br):
 * - Timeout de 12 segundos (AbortController)
 * - Suporte a redirecionamentos e cookies básicos
 * - Seletores específicos da SEFAZ-RJ: #tabResult tr, .txtTit, .Rqtd, .RUN, .RvlUnit, .valor
 * - Normalização segura de números brasileiros ("1.250,50" -> 1250.50)
 */

import { load } from 'cheerio'

function normalizeBRLNumber(text) {
  if (!text) return 0
  // Remove tudo exceto digitos, virgula e ponto
  const cleaned = String(text).replace(/[^\d,.-]/g, '').trim()
  if (!cleaned) return 0
  // Se tem virgula, e formato brasileiro: ponto = separador milhar, virgula = decimal
  if (cleaned.includes(',')) {
    // Remove pontos (separador de milhar)
    const withoutDots = cleaned.replace(/\./g, '')
    // Substitui virgula por ponto
    const normalized = withoutDots.replace(',', '.')
    const val = parseFloat(normalized)
    return isNaN(val) ? 0 : val
  }
  // Sem virgula: pode ser inteiro ou ja em formato ponto
  const val = parseFloat(cleaned)
  return isNaN(val) ? 0 : val
}

export default async function handler(req, res) {
  // Apenas permite POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' })
  }

  const { url, accessKey } = req.body || {}

  if (!url && !accessKey) {
    return res.status(400).json({
      error: 'Informe a URL do QR Code da NFC-e ou a chave de acesso (44 dígitos).',
    })
  }

  // Se apenas a chave foi fornecida, monta a URL de consulta da SEFAZ-RJ
  const targetUrl = url || `https://www.fazenda.rj.gov.br/consultaNFCe/ConsultaNFCe.aspx?chNFe=${accessKey}`

  // Timeout de 12 segundos
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 12000)

  try {
    // Faz o fetch no servidor para evitar bloqueios de CORS do navegador
    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'pt-BR,pt;q=0.9',
        'Connection': 'keep-alive',
      },
      redirect: 'follow',
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return res.status(502).json({
        error: `Não foi possível acessar a NFC-e (HTTP ${response.status}). Verifique a URL ou a chave de acesso.`,
      })
    }

    const html = await response.text()
    const $ = load(html)

    // Extrai chave de acesso (44 dígitos) — pode vir da URL ou do HTML
    let extractedAccessKey = accessKey
    if (!extractedAccessKey) {
      const keyMatch = html.match(/[0-9]{44}/)
      if (keyMatch) {
        extractedAccessKey = keyMatch[0]
      }
    }

    // --- Extração de dados da SEFAZ-RJ ---

    // Razão social do emitente — seletores oficiais da SEFAZ-RJ
    let storeName = ''
    const emitSelectors = ['#u20', '.txtTopo', '#emit', '#dest', '.emitente', '.razao-social', '[id*="emit"]']
    for (const sel of emitSelectors) {
      const el = $(sel).first()
      if (el && el.length) {
        const text = el.text().trim()
        if (text && text.length > 3) {
          storeName = text
          break
        }
      }
    }

    // Fallback: procura por padrão de razão social no texto
    if (!storeName) {
      const text = $('body').text()
      const storeMatch = text.match(/RAZÃO\s+SOCIAL\s*:?\s*([^\n\r]{3,100})/i)
      if (storeMatch) {
        storeName = storeMatch[1].trim()
      }
    }

    // Extrai data de emissão — padrão brasileiro DD/MM/AAAA
    let issueDate = null
    const dateMatch = html.match(/(\d{2}\/\d{2}\/\d{4})/)
    if (dateMatch) {
      const [d, m, y] = dateMatch[1].split('/')
      issueDate = `${y}-${m}-${d}`
    }

    // Extrai valor total da nota — seletor #linhaTotal .totalNumb ou regex
    let totalAmount = 0
    const totalSelector = $('#linhaTotal .totalNumb, .valorTotal, #totalNFe')
    if (totalSelector.length) {
      totalAmount = normalizeBRLNumber(totalSelector.first().text())
    } else {
      const totalMatch = html.match(/VALOR\s+TOTAL\s*:?\s*R?\$?\s*([\d.,]+)/i)
      if (totalMatch) {
        totalAmount = normalizeBRLNumber(totalMatch[1])
      }
    }

    // --- Extração de itens da nota ---
    const items = []

    // Estrutura oficial da SEFAZ-RJ: #tabResult tr com classes .txtTit, .Rqtd, .RUN, .RvlUnit, .valor
    $('#tabResult tr').each((_, el) => {
      const $row = $(el)
      const descEl = $row.find('.txtTit').first()
      const qtyEl = $row.find('.Rqtd').first()
      const unitEl = $row.find('.RUN').first()
      const priceEl = $row.find('.RvlUnit').first()
      const totalEl = $row.find('.valor').first()

      const desc = descEl.text().trim()
      const quantity = normalizeBRLNumber(qtyEl.text())
      const unitPrice = normalizeBRLNumber(priceEl.text())
      const totalPrice = normalizeBRLNumber(totalEl.text())

      if (desc && desc.length > 2 && (quantity > 0 || unitPrice > 0 || totalPrice > 0)) {
        items.push({
          raw_description: desc,
          quantity,
          unit_price: unitPrice,
          total_price: totalPrice,
        })
      }
    })

    // Fallback: parsing genérico de tabela se nao encontrou via seletores oficiais
    if (items.length === 0) {
      $('tr, .item, .produto').each((_, el) => {
        const rowText = $(el).text().trim()
        if (
          !rowText ||
          rowText.includes('PRODUTO') ||
          rowText.includes('DESCRIÇÃO') ||
          rowText.includes('TOTAL') ||
          rowText.includes('CNPJ') ||
          rowText.includes('CHAVE') ||
          rowText.length < 5
        ) {
          return
        }

        const cells = $(el).find('td, th')
        if (cells.length >= 3) {
          const desc = $(cells.eq(0)).text().trim() || rowText.split(/\s{2,}/)[0] || ''
          const qtyText = $(cells.eq(1)).text().trim()
          const priceText = $(cells.eq(2)).text().trim()
          const totalText = $(cells.eq(3)).text().trim() || priceText

          const quantity = normalizeBRLNumber(qtyText)
          const unitPrice = normalizeBRLNumber(priceText)
          const totalPrice = normalizeBRLNumber(totalText)

          if (desc && desc.length > 2 && (quantity > 0 || unitPrice > 0 || totalPrice > 0)) {
            items.push({
              raw_description: desc,
              quantity,
              unit_price: unitPrice,
              total_price: totalPrice,
            })
          }
        }
      })
    }

    // Remove itens duplicados (mesma descricao)
    const uniqueItems = items.filter(
      (item, index) =>
        index ===
        items.findIndex(
          (i) => i.raw_description.toLowerCase() === item.raw_description.toLowerCase()
        )
    )

    return res.status(200).json({
      success: true,
      accessKey: extractedAccessKey || '',
      storeName: storeName || 'Estabelecimento não identificado',
      issueDate,
      totalAmount,
      items: uniqueItems,
      rawUrl: targetUrl,
      message: 'NFC-e processada com sucesso.',
    })
  } catch (err) {
    clearTimeout(timeoutId)
    console.error('[parse-nfce]', err)

    if (err.name === 'AbortError') {
      return res.status(504).json({
        error: 'Tempo esgotado ao acessar a NFC-e. A SEFAZ-RJ pode estar lenta ou indisponível.',
      })
    }

    return res.status(500).json({
      error: 'Erro interno ao processar a NFC-e.',
      details: err.message,
    })
  }
}
