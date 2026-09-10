/**
 * Diccionario y Parser de Formatos Bancarios Argentinos
 * Extrae de forma determinística en el cliente: CUIT, CBU/CVU, Alias, Nro Operación / Coelsa ID,
 * Monto, Fecha, Concepto y Banco Emisor/Receptor.
 */

// Normalización de texto y limpieza de caracteres invisibles / non-breaking spaces
function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/\u00A0/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ');
}

/**
 * Parsea el texto crudo de un comprobante de transferencia bancaria
 * @param {string} rawText 
 * @returns {object|null}
 */
export function parsearComprobanteBancarioTexto(rawText) {
  if (!rawText || typeof rawText !== 'string' || rawText.length < 15) {
    return null;
  }

  const text = cleanText(rawText);

  let destinatario_nombre = null;
  let destinatario_cuit_cuil = null;
  let emisor_cuit_cuil = null;
  let destinatario_cbu_alias = null;
  let destinatario_banco = null;
  let monto_transferido = 0;
  let fecha_transferencia = null;
  let numero_operacion = null;
  let concepto = null;
  let estado_transferencia = 'Acreditada';

  // 1. CUIT / CUIL (Destinatario vs Emisor)
  // Priorizar CUIT explícito de destino / destinatario / beneficiario
  const cuitDestinoRegexes = [
    /(?:cuit|cuil|c\.u\.i\.t|c\.u\.i\.l|identificaci[oó]n|dni\/cuit)\s*(?:del\s*destinatario|destino|beneficiario|titular\s*de\s*destino|hacia)\s*[:=\-]?\s*\b((?:20|23|24|27|30|33|34)[-\s]?\d{8}[-\s]?\d)\b/i,
    /(?:destinatario|beneficiario|para)[^\n\r]{0,40}?\b((?:20|23|24|27|30|33|34)[-\s]?\d{8}[-\s]?\d)\b/i
  ];

  for (const reg of cuitDestinoRegexes) {
    const match = text.match(reg);
    if (match) {
      destinatario_cuit_cuil = match[1].replace(/[\s\-]/g, '');
      break;
    }
  }

  // Detectar CUIT del emisor si está especificado para no confundirlo
  const cuitEmisorMatch = text.match(/(?:cuit|cuil)\s*(?:del\s*emisor|origen|ordenante|desde)\s*[:=\-]?\s*\b((?:20|23|24|27|30|33|34)[-\s]?\d{8}[-\s]?\d)\b/i);
  if (cuitEmisorMatch) {
    emisor_cuit_cuil = cuitEmisorMatch[1].replace(/[\s\-]/g, '');
  }

  // Si no se encontró CUIT con prefijo de destino, buscar el último o único CUIT que no sea el emisor
  if (!destinatario_cuit_cuil) {
    const allCuits = Array.from(text.matchAll(/\b((?:20|23|24|27|30|33|34)[-\s]?\d{8}[-\s]?\d)\b/g)).map(m => m[1].replace(/[\s\-]/g, ''));
    if (allCuits.length > 0) {
      const candidates = allCuits.filter(c => c !== emisor_cuit_cuil);
      destinatario_cuit_cuil = candidates.length > 0 ? candidates[candidates.length - 1] : allCuits[0];
    }
  }

  // 2. MONTO TRANSFERIDO
  const montoPatterns = [
    /(?:monto\s*transferido|importe\s*transferido|monto\s*debitado|dinero\s*transferido|total\s*transferido|importe\s*a\s*transferir|importe\s*de\s*la\s*transferencia|monto\s*total|importe\s*total)\s*[:=\-]?\s*\$?\s*([\d\.\s]{1,12},\d{2})/i,
    /(?:monto|importe|total)\s*[:=\-]?\s*\$?\s*([\d\.\s]{1,12},\d{2})/i,
    /\$\s*([\d\.\s]{1,12},\d{2})/,
    /(?:monto|importe|total)\s*[:=\-]?\s*\$?\s*(\d+(?:\.\d{3})*(?:,\d{2})?)/i
  ];

  for (const reg of montoPatterns) {
    const match = text.match(reg);
    if (match) {
      const cleanVal = match[1].replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
      const parsed = parseFloat(cleanVal);
      if (!isNaN(parsed) && parsed > 0) {
        monto_transferido = parsed;
        break;
      }
    }
  }

  // 3. NÚMERO DE OPERACIÓN / COELSA ID / REFERENCIA
  const opPatterns = [
    /(?:coelsa\s*id|id\s*coelsa|id\s*de\s*coelsa)\s*[:=\-]?\s*([A-Za-z0-9\-]{6,})/i,
    /(?:n[uú]mero\s*de\s*operaci[oó]n|nro\.?\s*de\s*operaci[oó]n|n[uú]m\.\s*operaci[oó]n|nro\s*op|n[uú]m\s*op)\s*[:=\-]?\s*([A-Za-z0-9\-]{4,})/i,
    /(?:n[uú]mero\s*de\s*comprobante|nro\.?\s*de\s*comprobante|nro\s*comp)\s*[:=\-]?\s*([A-Za-z0-9\-]{4,})/i,
    /(?:c[oó]digo\s*de\s*transferencia|c[oó]digo\s*de\s*identificaci[oó]n|c[oó]d\.\s*identificaci[oó]n)\s*[:=\-]?\s*([A-Za-z0-9\-]{4,})/i,
    /(?:n[uú]mero\s*de\s*transacci[oó]n|nro\.?\s*transacci[oó]n)\s*[:=\-]?\s*([A-Za-z0-9\-]{4,})/i,
    /(?:referencia|ref\.)\s*[:=\-]?\s*([A-Za-z0-9\-]{4,})/i
  ];

  for (const reg of opPatterns) {
    const match = text.match(reg);
    if (match) {
      numero_operacion = match[1].trim();
      break;
    }
  }

  // 4. CBU / CVU / ALIAS
  const cbuMatch = text.match(/\b\d{22}\b/);
  if (cbuMatch) {
    destinatario_cbu_alias = cbuMatch[0];
  } else {
    const aliasMatch = text.match(/(?:alias|alias\s*cbu|alias\s*cvu|cbu\/cvu\/alias)\s*[:=\-]?\s*([a-zA-Z0-9\.\-_]{4,30})/i);
    if (aliasMatch) {
      destinatario_cbu_alias = aliasMatch[1].trim();
    }
  }

  // 5. BANCO / BILLETERA (Diccionario ampliado Argentina)
  if (/mercado\s*pago/i.test(text)) {
    destinatario_banco = 'Mercado Pago';
  } else if (/cuenta\s*dni|bapro|banco\s*provincia/i.test(text)) {
    destinatario_banco = 'Banco Provincia (Cuenta DNI)';
  } else if (/modo/i.test(text)) {
    destinatario_banco = 'MODO';
  } else if (/galicia/i.test(text)) {
    destinatario_banco = 'Banco Galicia';
  } else if (/santander/i.test(text)) {
    destinatario_banco = 'Banco Santander';
  } else if (/bbva|franc[eé]s/i.test(text)) {
    destinatario_banco = 'Banco BBVA';
  } else if (/macro/i.test(text)) {
    destinatario_banco = 'Banco Macro';
  } else if (/naranja\s*x/i.test(text)) {
    destinatario_banco = 'Naranja X';
  } else if (/brubank/i.test(text)) {
    destinatario_banco = 'Brubank';
  } else if (/ual[aá]/i.test(text)) {
    destinatario_banco = 'Ualá';
  } else if (/reba|transatl[aá]ntica/i.test(text)) {
    destinatario_banco = 'Reba';
  } else if (/openbank/i.test(text)) {
    destinatario_banco = 'Openbank';
  } else if (/prex/i.test(text)) {
    destinatario_banco = 'Prex';
  } else if (/naci[oó]n|bna\b/i.test(text)) {
    destinatario_banco = 'Banco Nación';
  } else if (/icbc/i.test(text)) {
    destinatario_banco = 'Banco ICBC';
  } else if (/ciudad/i.test(text)) {
    destinatario_banco = 'Banco Ciudad';
  } else if (/hipotecario/i.test(text)) {
    destinatario_banco = 'Banco Hipotecario';
  } else if (/credicoop/i.test(text)) {
    destinatario_banco = 'Banco Credicoop';
  } else if (/supervielle/i.test(text)) {
    destinatario_banco = 'Banco Supervielle';
  } else if (/patagonia/i.test(text)) {
    destinatario_banco = 'Banco Patagonia';
  } else if (/bancor|c[oó]rdoba/i.test(text)) {
    destinatario_banco = 'Bancor';
  }

  // 6. FECHA (DD/MM/YYYY o YYYY-MM-DD o con nombre de mes)
  const fechaNumMatch = text.match(/\b(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})\b/);
  if (fechaNumMatch) {
    const d = fechaNumMatch[1].padStart(2, '0');
    const m = fechaNumMatch[2].padStart(2, '0');
    const y = fechaNumMatch[3];
    fecha_transferencia = `${y}-${m}-${d}`;
  } else {
    const fechaTextoMatch = text.match(/(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+de?\s*(\d{4})/i);
    if (fechaTextoMatch) {
      const meses = {
        enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05', junio: '06',
        julio: '07', agosto: '08', septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12'
      };
      const d = fechaTextoMatch[1].padStart(2, '0');
      const m = meses[fechaTextoMatch[2].toLowerCase()] || '01';
      const y = fechaTextoMatch[3];
      fecha_transferencia = `${y}-${m}-${d}`;
    }
  }

  // 7. CONCEPTO / MOTIVO / REFERENCIA QUIRÚRGICA
  const conceptoMatch = text.match(/(?:concepto|motivo|referencia|descripci[oó]n|mensaje)\s*[:=\-]?\s*([^\n\r]{3,80})/i);
  if (conceptoMatch) {
    const cClean = conceptoMatch[1].trim();
    if (!/^\d+$/.test(cClean) && !/^[A-Z0-9\-]{10,}$/.test(cClean)) {
      concepto = cClean;
    }
  }

  // 8. ESTADO DE LA TRANSFERENCIA
  if (/rechazad[oa]|anulad[oa]|fallid[oa]/i.test(text)) {
    estado_transferencia = 'Rechazada';
  } else if (/programad[oa]|en\s*proceso|pendiente/i.test(text)) {
    estado_transferencia = 'Pendiente';
  } else {
    estado_transferencia = 'Acreditada';
  }

  // 9. NOMBRE DEL DESTINATARIO
  const nombrePatterns = [
    /(?:destinatario|para|titular\s*de\s*destino|beneficiario|nombre\s*del\s*titular|transferiste\s*a|le\s*transferiste\s*a)\s*[:=\-]?\s*([A-Za-zÁÉÍÓÚáéíóúñÑ\s\.\'\-]{3,50})/i,
    /(?:cuenta\s*destino|hacia)\s*[:=\-]?\s*([A-Za-zÁÉÍÓÚáéíóúñÑ\s\.\'\-]{3,50})/i
  ];

  for (const reg of nombrePatterns) {
    const match = text.match(reg);
    if (match) {
      const candidate = match[1].trim().replace(/\s{2,}/g, ' ');
      // Filtrar palabras clave falsas
      if (!/^(cuit|cuil|cbu|cvu|alias|banco|pesos|importe|monto|cuenta)/i.test(candidate) && candidate.length > 2) {
        destinatario_nombre = candidate;
        break;
      }
    }
  }

  if (monto_transferido > 0 || destinatario_cuit_cuil || numero_operacion || destinatario_cbu_alias) {
    return {
      destinatario_nombre,
      destinatario_cuit_cuil,
      destinatario_cbu_alias,
      destinatario_banco,
      monto_transferido,
      fecha_transferencia,
      numero_operacion,
      concepto,
      estado_transferencia,
      metodo_extraccion: 'parser_bancario_local'
    };
  }

  return null;
}

/**
 * Algoritmo Subset Sum de alto rendimiento (Programación Dinámica + Heurística)
 * Encuentra una combinación exacta de cirugías cuya suma sea igual al monto objetivo
 * 
 * @param {Array} cirugias - Lista de cirugías pendientes { id, monto, fecha_cirugia, ... }
 * @param {number} targetAmount - Monto de la transferencia
 * @param {string} [concepto] - Texto de referencia para priorizar desempates
 * @param {string} [targetDate] - Fecha de la transferencia para priorizar proximidad
 * @returns {Array|null} Lista de cirugías que suman exactamente targetAmount, o null si no existe
 */
export function findExactSurgerySubset(cirugias, targetAmount, concepto = '', targetDate = null) {
  if (!cirugias || cirugias.length === 0 || targetAmount <= 0) return null;

  // 1. Filtrar y preparar items con centavos para evitar errores de coma flotante
  const items = cirugias.map(c => {
    const valor = Number(c.monto_a_pagar || c.monto) || 0;
    return {
      ...c,
      valor: valor,
      cents: Math.round(valor * 100)
    };
  }).filter(c => c.cents > 0);

  if (items.length === 0) return null;

  const targetCents = Math.round(targetAmount * 100);

  // 2. Coincidencia directa de 1 cirugía
  const single = items.find(c => c.cents === targetCents);
  if (single) return [single];

  // 3. Coincidencia con la suma total de todas
  const totalCents = items.reduce((sum, c) => sum + c.cents, 0);
  if (totalCents === targetCents) {
    return items;
  }
  if (totalCents < targetCents) {
    return null; // Imposible alcanzar target si la suma total es menor
  }

  // 4. Ordenamiento heurístico inicial: Concepto > Proximidad de fecha > Monto descendente
  const cNorm = concepto ? concepto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';
  const targetTimestamp = targetDate ? new Date(targetDate).getTime() : null;

  items.sort((a, b) => {
    // A. Concepto match
    if (cNorm) {
      const aName = (a.paciente || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const bName = (b.paciente || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const aMatch = aName && cNorm.includes(aName);
      const bMatch = bName && cNorm.includes(bName);
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
    }

    // B. Proximidad de fecha
    if (targetTimestamp && a.fecha_cirugia && b.fecha_cirugia) {
      const diffA = Math.abs(new Date(a.fecha_cirugia).getTime() - targetTimestamp);
      const diffB = Math.abs(new Date(b.fecha_cirugia).getTime() - targetTimestamp);
      if (diffA !== diffB) return diffA - diffB;
    }

    // C. Monto mayor primero para podar el árbol rápidamente
    return b.cents - a.cents;
  });

  // 5. Resolución por Programación Dinámica (0/1 Subset Sum con recuperación de camino)
  // dp[s] guarda el índice del item que permitió alcanzar la suma 's'
  const dp = new Map();
  dp.set(0, -1);

  for (let i = 0; i < items.length; i++) {
    const itemCents = items[i].cents;
    if (itemCents > targetCents) continue;

    // Iterar sobre las sumas existentes alcanzables
    const currentSums = Array.from(dp.keys());
    for (const s of currentSums) {
      const newSum = s + itemCents;
      if (newSum <= targetCents && !dp.has(newSum)) {
        dp.set(newSum, i);
        if (newSum === targetCents) {
          break; // ¡Encontramos la combinación exacta!
        }
      }
    }

    if (dp.has(targetCents)) break;
  }

  // 6. Reconstrucción del subconjunto óptimo
  if (dp.has(targetCents)) {
    const result = [];
    let curr = targetCents;
    while (curr > 0) {
      const itemIdx = dp.get(curr);
      if (itemIdx === undefined || itemIdx === -1) break;
      result.push(items[itemIdx]);
      curr -= items[itemIdx].cents;
    }
    return result;
  }

  return null;
}
