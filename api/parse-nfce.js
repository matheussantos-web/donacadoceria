
/**
 * api/parse-nfce.js
 * Vercel Serverless Function — Parser de NFC-e (SEFAZ-RJ)
 *
 * Recebe a URL do QR Code da NFC-e ou a chave de acesso (44 dígitos),
 * faz o fetch no servidor (evitando CORS), segue redirecionamentos/iframes
 * da SEFAZ-RJ preservando o cookie JSESSIONID, extrai dados do estabelecimento,
 * data, chave de acesso e itens, retornando um JSON limpo para o painel de gestão.
 *
 * Contingência: se o fetch direto falhar (bloqueio/timeout da SEFAZ-RJ em
 * servidores gratuitos nos EUA), tenta via proxy allorigins.win.
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
  const text = $('body').text()
  const storeMatch = text.match(/RAZÃO\s+SOCIAL\s*:?\s*([^\n\r]{3,100})/i)
  if (storeMatch) {
    return storeMatch[1].trim()
  }
  return ''
}

/** Fetch com timeout via proxy allorigins.win (contingência para firewall da SEFAZ-RJ) */
async function fetchViaAllOrigins(targetUrl) {
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 12000)

  try {
    const response = await fetch(proxyUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9',
        'Connection': 'keep-alive',
      },
      redirect: 'follow',
    })
    clearTimeout(timeoutId)
    if (response.ok) {
      return await response.text()
    }
    return null
  } catch (_) {
    clearTimeout(timeoutId)
    return null
  }
}

/**
 * Fetch com preservação de cookie JSESSIONID.
 * A SEFAZ-RJ retorna redirect 302 para resultadoQRCode2.faces;
 * precisamos capturar o set-cookie da primeira resposta e repassar no segundo fetch.
 */
async function fetchWithCookies(url, opts = {}, maxHops = 5) {
  let currentUrl = url
  let cookies = ''
  let html = ''

  for (let hop = 0; hop < maxHops; hop++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 7000)

    try {
      const response = await fetch(currentUrl, {
        signal: controller.signal,
        ...opts,
        headers: {
          ...(opts.headers || {}),
          ...(cookies ? { Cookie: cookies } : {}),
        },
        redirect: 'manual', // não segue automaticamente para controlar cookies
      })

      clearTimeout(timeoutId)

      // Captura cookies da resposta
      const setCookie = response.headers.get('set-cookie')
      if (setCookie) {
        cookies = setCookie.split(',').map((c) => c.split(';')[0]).join('; ')
      }

      // Se é redirect (301/302/303/307/308), segue manualmente
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location')
        if (location) {
          currentUrl = resolveRelativeUrl(currentUrl, location)
          continue
        }
      }

      html = await response.text()
      return { html, cookies, status: response.status }
    } catch (_) {
      clearTimeout(timeoutId)
      break
    }
  }

  return { html, cookies, status: 0 }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' })
  }

  const { url, accessKey, rawText } = req.body || {}

  if (!url && !accessKey && !rawText) {
    return res.status(400).json({
      error: 'Informe a URL do QR Code da NFC-e, a chave de acesso (44 dígitos) ou cole o texto da nota fiscal.',
    })
  }

  // --- CAMINHO: texto colado da SEFAZ-RJ (processa localmente, sem rede) ---
  if (rawText && !url && !accessKey) {
    const $ = load(rawText)
    const html = rawText

    // Chave de acesso (44 dígitos) no texto colado
    let extractedAccessKey = ''
    const keyMatch = html.match(/Chave\s*de\s*acesso\s*:\s*\n?\s*([\d\s]{40,60})/i)
    if (keyMatch) {
      extractedAccessKey = keyMatch[1].replace(/\s/g, '')
    }
    if (!extractedAccessKey) {
      const keyMatch2 = html.match(/[0-9]{44}/)
      if (keyMatch2) {
        extractedAccessKey = keyMatch2[0]
      }
    }

    // Estabelecimento / emitente
    const storeName = extractStoreName($)

    // Data de emissão
    let issueDate = null
    const dateMatch = html.match(/Emissão\s*:\s*(\d{2})\/(\d{2})\/(\d{4})/i)
    if (dateMatch) {
      const [, d, m, y] = dateMatch
      issueDate = `${y}-${m}-${d}`
    }

    // Valor total da nota
    let totalAmount = 0
    const totalMatch = html.match(/Valor\s+a\s*pagar\s*R?\$?:\s*([\d.,]+)/i)
    if (totalMatch) {
      totalAmount = normalizeBRLNumber(totalMatch[1])
    } else {
      const totalMatch2 = html.match(/Valor\s+total\s*R?\$?:\s*([\d.,]+)/i)
      if (totalMatch2) {
        totalAmount = normalizeBRLNumber(totalMatch2[1])
      }
    }

    // --- Extração de itens ---
    const items = []
    const lines = html.split('\n')

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

    if (uniqueItems.length === 0) {
      return res.status(200).json({
        success: false,
        error: 'Nenhum item encontrado no texto colado. Verifique se copiou o conteúdo completo da nota fiscal.',
        accessKey: extractedAccessKey || '',
        storeName: storeName || 'Estabelecimento não identificado',
        issueDate,
        totalAmount,
        items: [],
        rawUrl: 'texto-colado',
        debugHint: rawText.substring(0, 300),
      })
    }

    return res.status(200).json({
      success: true,
      accessKey: extractedAccessKey || '',
      storeName: storeName || 'Estabelecimento não identificado',
      issueDate,
      totalAmount,
      items: uniqueItems,
      rawUrl: 'texto-colado',
      message: 'Nota fiscal processada com sucesso (texto colado).',
    })
  }

  // --- CAMINHO: URL ou chave de acesso (fetch na SEFAZ-RJ) ---
  let targetUrl = url
  if (!targetUrl && accessKey) {
    targetUrl = `https://consultadfe.fazenda.rj.gov.br/consultaNFCe/QRCode?p=${accessKey}|2|1|1`
  }

  let html = ''
  let lastError = null

  try {
    // PRIMEIRO fetch: direto na SEFAZ-RJ com preservação de JSESSIONID
    const first = await fetchWithCookies(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    })

    html = first.html || ''

    if (first.status >= 400) {
      lastError = new Error(`HTTP ${first.status}`)
    }

    // SECOND fallback: www4.fazenda.rj.gov.br
    if (!html && accessKey && lastError) {
      const fallbackUrl = `http://www4.fazenda.rj.gov.br/consultaNFCe/QRCode?p=${accessKey}|2|1|1`
      const fb = await fetchWithCookies(fallbackUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
      })

      if (fb.html && fb.status < 400) {
        html = fb.html
        targetUrl = fallbackUrl
        lastError = null
      }
    }

    // THIRD fallback: proxy allorigins.win
    if (!html && accessKey && lastError) {
      const proxyHtml = await fetchViaAllOrigins(targetUrl)
      if (proxyHtml) {
        html = proxyHtml
        lastError = null
      }
    }

    if (!html) {
      throw lastError || new Error('Não foi obter conteúdo da NFC-e')
    }

    const $ = load(html)

    // --- DETECÇÃO DE IFRAME (resultadoQRCode2.faces) ---
    const iframeSrc = $('iframe').first().attr('src')
    if (iframeSrc) {
      const iframeUrl = resolveRelativeUrl(targetUrl, iframeSrc)
      const second = await fetchWithCookies(iframeUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'pt-BR,pt;q=0.9',
          'Connection': 'keep-alive',
          Referer: targetUrl,
        },
      })

      if (second.html && second.status < 400) {
        html = second.html
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
