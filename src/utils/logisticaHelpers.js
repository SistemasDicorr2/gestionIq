// src/utils/logisticaHelpers.js

/**
 * Normaliza cualquier valor nulo, vacío, "-", "Sin proveedor", "sin_proveedor" o "propio"
 * al valor estándar "LOGISTICA CIRUGIA".
 * 
 * @param {string|null|undefined} val 
 * @returns {string}
 */
export function normalizeProveedor(val) {
  if (!val) return 'LOGISTICA CIRUGIA';
  const str = String(val).trim();
  if (!str || str === '-' || str === 'null' || str === 'undefined') {
    return 'LOGISTICA CIRUGIA';
  }
  const clean = str.toLowerCase().replace(/_/g, ' ');
  if (
    clean === 'sin proveedor' || 
    clean === 'propio' || 
    clean === 'propia' || 
    clean === 'sin_proveedor' ||
    clean === 'sin datos'
  ) {
    return 'LOGISTICA CIRUGIA';
  }
  return str.toUpperCase();
}

/**
 * Analiza un listado de movimientos o guías de envío y calcula la "Zona Concurrida"
 * (ubicación de destino más frecuente) por cada empresa de logística o proveedor,
 * agregando cantidad de bultos/envíos, % de participación, cuenta corriente y pago directo.
 * 
 * @param {Array} records Array de movimientos/guías (ej. de logistica_informe_movimientos y/o logistica_guias_envio)
 * @returns {Array} Listado de estadísticas consolidadas por proveedor
 */
export function getMostFrequentDestination(records = []) {
  if (!Array.isArray(records) || records.length === 0) {
    return [];
  }

  // Agrupador por proveedor
  const statsMap = {};

  records.forEach(r => {
    const rawProv = r.transporte || r.proveedor || r.proveedor_snapshot || r.empresa;
    const prov = normalizeProveedor(rawProv);

    const dest = (
      r.lugar_entrega || 
      r.institucion_snapshot || 
      r.lugar_entrega_snapshot || 
      r.institucion || 
      'Sin especificar'
    ).trim();

    if (!statsMap[prov]) {
      statsMap[prov] = {
        proveedor: prov,
        destinations: {},
        bultos: 0,
        cuentaCorriente: 0,
        pagoDirecto: 0
      };
    }

    // Incrementar bultos/movimientos
    const bultosCount = Number(r.cantidad_imagenes || r.bultos || r.cantidad || 1);
    statsMap[prov].bultos += bultosCount > 0 ? bultosCount : 1;

    // Frecuencia de destino
    if (dest && dest !== 'Sin especificar' && dest !== '-') {
      statsMap[prov].destinations[dest] = (statsMap[prov].destinations[dest] || 0) + 1;
    }

    // Clasificación de modalidad
    const tipo = (r.tipo_gestion || r.modalidad || r.tipo || '').toLowerCase();
    const esEncomiendaCC = (
      prov !== 'LOGISTICA CIRUGIA' || 
      tipo.includes('encomienda') || 
      tipo.includes('cuenta_corriente') || 
      tipo.includes('c/c')
    );

    if (esEncomiendaCC && prov !== 'LOGISTICA CIRUGIA') {
      statsMap[prov].cuentaCorriente += 1;
    } else {
      statsMap[prov].pagoDirecto += 1;
    }
  });

  const totalBultosGlobal = Object.values(statsMap).reduce((acc, curr) => acc + curr.bultos, 0);

  // Construir resultado final
  const result = Object.values(statsMap).map(item => {
    // Determinar la Zona Concurrida (destino modal con mayor número de concurrencias)
    let zonaConcurrida = 'Sin especificar';
    let maxFreq = 0;

    Object.entries(item.destinations).forEach(([dest, freq]) => {
      if (freq > maxFreq) {
        maxFreq = freq;
        zonaConcurrida = dest;
      }
    });

    const porcentaje = totalBultosGlobal > 0 
      ? Number(((item.bultos / totalBultosGlobal) * 100).toFixed(1))
      : 0;

    return {
      proveedor: item.proveedor,
      zonaConcurrida,
      bultos: item.bultos,
      porcentaje,
      cuentaCorriente: item.cuentaCorriente,
      pagoDirecto: item.pagoDirecto,
      total: item.bultos
    };
  });

  // Ordenar desc por bultos
  return result.sort((a, b) => b.bultos - a.bultos);
}
