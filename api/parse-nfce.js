
/**
 * api/parse-nfce.js
 * Vercel Serverless Function — Parser de NFC-e (SEFAZ-RJ)
 *
 * Recebe a URL do QR Code da NFC-e ou a chave de acesso (44 dígitos),
 * faz o fetch no servidor (evitando CORS), segue redirecionamentos/iframes
 * da SEFAZ-RJ, extrai dados do estabelecimento, data, chave de acesso e itens,
 * retornando um JSON limpo para o painel de gestão.
 */

import { load } from 'cheerio'

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

function resolveRelativeUrl(baseUrl, href) {
  try {
    return new URL(href, baseUrl).href
  } catch (_) {
    return href
  }
}

function extractStoreName($) {
  const emitSelectors = ['#u20', '.txtTopo', '#emit', '#dest', '.emitente', '.razao-social', '[id*="emit"]']
  for (const sel of emitSelectors) {
    const el = $(sel).first()
    if (el && el.length) {
      const text = el.text().trim()
      if (text && text.length > 3) {
        return text
      }
    }
  }
  // Fallback: primeiro bloco em negrito antes do CNPJ
  const text = $('body').text()
  const storeMatch = text.match(/RAZÃO\s+SOCIAL\s*:?\s*([^\n\r]{3,100})/i)
  if (storeMatch) {
    return storeMatch[1].trim()
  }
  return ''
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' })
  }

  const { url, accessKey } = req.body || {}

  if (!url && !accessKey) {
    return res.status(400).json({
      error: 'Informe a URL do QR Code da NFC-e ou a chave de acesso (44 dígitos).',
    })
  }

  // Se apenas a chave foi fornecida (44 dígitos), monta a URL da SEFAZ-RJ
  let targetUrl = url
  if (!targetUrl && accessKey) {
    // Tenta a URL pública de QR Code da SEFAZ-RJ primeiro (SP)
    targetUrl = `https://consultadfe.fazenda.rj.gov.br/consultaNFCe/QRCode?p=${accessKey}|2|1|1`
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 12000)

  let firstResponse = null
  let html = ''
  let lastError = null

  try {
    // PRIMEIRO fetch: pode retornar iframe com o conteúdo real
    firstResponse = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      redirect: 'follow',
    })

    clearTimeout(timeoutId)

    if (!firstResponse.ok) {
      lastError = new Error(`HTTP ${firstResponse.status}`)
    } else {
      html = await firstResponse.text()
    }

    // Se a primeira URL falhou (timeout ou erro de região), tenta o fallback www4
    if (!html && accessKey && lastError) {
      const fallbackUrl = `http://www4.fazenda.rj.gov.br/consultaNFCe/QRCode?p=${accessKey}|2|1|1`
      const controllerFallback = new AbortController()
      const timeoutIdFallback = setTimeout(() => controllerFallback.abort(), 12000)

      try {
        const fbResponse = await fetch(fallbackUrl, {
          signal: controllerFallback.signal,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
          },
          redirect: 'follow',
        })

        clearTimeout(timeoutIdFallback)

        if (fbResponse.ok) {
          html = await fbResponse.text()
          targetUrl = fallbackUrl
          lastError = null
        }
      } catch (_) {
        // ignora erro do fallback
      }
    }

    if (!html) {
      throw lastError || new Error('Não foi obter conteúdo da NFC-e')
    }

    const $ = load(html)

    // --- DETECÇÃO DE IFRAME (SEFAZ-RJ costuma envolver o conteúdo em iframe) ---
    const iframeSrc = $('iframe').first().attr('src')
    if (iframeSrc) {
      const iframeUrl = resolveRelativeUrl(targetUrl, iframeSrc)

      // Segundo fetch para o iframe, repassando cookies da primeira resposta
      const cookies = firstResponse.headers.get('set-cookie') || ''
      const controller2 = new AbortController()
      const timeoutId2 = setTimeout(() => controller2.abort(), 12000)

      try {
        const secondResponse = await fetch(iframeUrl, {
          signal: controller2.signal,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml',
            'Accept-Language': 'pt-BR,pt;q=0.9',
            'Connection': 'keep-alive',
            ...(cookies ? { Cookie: cookies } : {}),
            Referer: targetUrl,
          },
          redirect: 'follow',
        })

        clearTimeout(timeoutId2)

        if (secondResponse.ok) {
          html = await secondResponse.text()
        }
      } catch (_) {
        // Mantém o HTML do primeiro fetch se o iframe falhar
      }
    }

    const $$ = load(html)

    // --- Extração de dados ---

    // Chave de acesso (44 dígitos)
    let extractedAccessKey = accessKey
    if (!extractedAccessKey) {
      const keyMatch = html.match(/[0-9]{44}/)
      if (keyMatch) {
        extractedAccessKey = keyMatch[0]
      }
    }

    // Estabelecimento / emitente
    const storeName = extractStoreName($$)

    // Data de emissão
    let issueDate = null
    const dateMatch = html.match(/(\d{2}\/\d{2}\/\d{4})/)
    if (dateMatch) {
      const [d, m, y] = dateMatch[1].split('/')
      issueDate = `${y}-${m}-${d}`
    }

    // Valor total da nota
    let totalAmount = 0
    const totalSelector = $$('#linhaTotal .totalNumb, .totalNumb, .valorTotal, #totalNFe').first()
    if (totalSelector.length) {
      totalAmount = normalizeBRLNumber(totalSelector.text())
    } else {
      const totalMatch = html.match(/VALOR\s+TOTAL\s*:?\s*R?\$?\s*([\d.,]+)/i)
      if (totalMatch) {
        totalAmount = normalizeBRLNumber(totalMatch[1])
      }
    }

    // --- Extração de itens ---
    const items = []

    // Estrutura oficial da SEFAZ-RJ: #tabResult tr com classes .txtTit, .Rqtd, .RUN, .RvlUnit, .valor
    $$('#tabResult tr').each((_, el) => {
      const $row = $$(el)
      const descEl = $row.find('.txtTit, .txtTit2').first()
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

    // Fallback: parsing genérico de tabela
    if (items.length === 0) {
      $$('tr, .item, .produto').each((_, el) => {
        const rowText = $$(el).text().trim()
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

        const cells = $$(el).find('td, th')
        if (cells.length >= 3) {
          const desc = $$(cells.eq(0)).text().trim() || rowText.split(/\s{2,}/)[0] || ''
          const qtyText = $$(cells.eq(1)).text().trim()
          const priceText = $$(cells.eq(2)).text().trim()
          const totalText = $$(cells.eq(3)).text().trim() || priceText

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

    // Remove duplicados
    const uniqueItems = items.filter(
      (item, index) =>
        index ===
        items.findIndex(
          (i) => i.raw_description.toLowerCase() === item.raw_description.toLowerCase()
        )
    )

    // Se não encontrou itens, retorna erro claro com debugHint
    if (uniqueItems.length === 0) {
      const bodyText = $$('body').text().trim()
      const debugHint = bodyText.substring(0, 300)
      return res.status(200).json({
        success: false,
        error: 'Nenhum item encontrado na NFC-e. O layout da SEFAZ-RJ pode ter mudado ou a nota pode estar vazia.',
        accessKey: extractedAccessKey || '',
        storeName: storeName || 'Estabelecimento não identificado',
        issueDate,
        totalAmount,
        items: [],
        rawUrl: targetUrl,
        debugHint,
      })
    }

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
