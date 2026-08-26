// src/utils/conciliacionHelpers.js
import { normalizeProveedor } from './logisticaHelpers';

/**
 * Normaliza y estructura los datos de guías de envío y movimientos logísticos
 * para la vista de Conciliación de Fletes y Remitos por Cliente, Médico y Transporte.
 * 
 * @param {Array} guias Listado de guías de despacho (logistica_guias_envio)
 * @param {Array} movimientos Listado de movimientos diarios (logistica_informe_movimientos)
 * @param {Object} costsMap Mapa persistido de costos por número de guía { [numero_guia]: { costo, estado, notas } }
 * @returns {Object} { byCliente, byMedico, byTransporte, guiasDetalle, stats }
 */
export function buildConciliacionSummary(guias = [], movimientos = [], costsMap = {}) {
  const guiasDetalle = [];

  // 1. Procesar guías de envío
  (guias || []).forEach(g => {
    const cleanNum = (g.numero_guia || '').trim();
    const costInfo = costsMap[cleanNum] || {};
    const prov = normalizeProveedor(g.transporte);

    guiasDetalle.push({
      id: g.id || cleanNum,
      numero_guia: cleanNum || 'Sin N°',
      fecha_envio: g.fecha_envio || g.created_at?.slice(0, 10) || '',
      transporte: prov,
      cliente: (g.cliente || 'Sin cliente asignado').trim().toUpperCase(),
      medico: (g.medico || 'Sin médico asignado').trim(),
      paciente: (g.paciente || '-').trim(),
      lugar_entrega: (g.lugar_entrega || '-').trim(),
      bultos: Number(g.cantidad_imagenes || 1),
      costo: Number(costInfo.costo || 0),
      estado: costInfo.estado || (prov === 'LOGISTICA CIRUGIA' ? 'Conciliado' : 'Pendiente'),
      observaciones: (costInfo.notas || g.observaciones || '').trim(),
      origen: 'Guía de Envío'
    });
  });

  // 2. Procesar movimientos si no están representados en las guías
  (movimientos || []).forEach(m => {
    const prov = normalizeProveedor(m.proveedor_snapshot);
    const cliente = (m.cliente_snapshot || 'Sin cliente asignado').trim().toUpperCase();
    const medico = (m.medico_snapshot || 'Sin médico asignado').trim();
    const idKey = `MOV-${m.id}`;

    // Si ya existe por algún cruce directo, omitir para no duplicar bultos
    const exists = guiasDetalle.some(g => g.id === idKey);
    if (!exists) {
      const costInfo = costsMap[idKey] || {};
      guiasDetalle.push({
        id: idKey,
        numero_guia: m.id_cirugia_snapshot ? `CX-${m.id_cirugia_snapshot}` : `MOV-${m.id}`,
        fecha_envio: m.fecha_cirugia_snapshot || m.created_at?.slice(0, 10) || '',
        transporte: prov,
        cliente,
        medico,
        paciente: (m.paciente_snapshot || '-').trim(),
        lugar_entrega: (m.institucion_snapshot || '-').trim(),
        bultos: Number(m.bultos || 1),
        costo: Number(costInfo.costo || 0),
        estado: costInfo.estado || (prov === 'LOGISTICA CIRUGIA' ? 'Conciliado' : 'Pendiente'),
        observaciones: (costInfo.notas || m.observaciones || '').trim(),
        origen: 'Movimiento Diario'
      });
    }
  });

  // Ordenar por fecha desc
  guiasDetalle.sort((a, b) => new Date(b.fecha_envio) - new Date(a.fecha_envio));

  // 3. Agrupar por Cliente
  const clienteMap = {};
  // 4. Agrupar por Médico
  const medicoMap = {};
  // 5. Agrupar por Transporte
  const transporteMap = {};

  guiasDetalle.forEach(item => {
    // Cliente
    if (!clienteMap[item.cliente]) {
      clienteMap[item.cliente] = {
        cliente: item.cliente,
        guiasCount: 0,
        bultosCount: 0,
        costoTotal: 0,
        conciliadosCount: 0
      };
    }
    clienteMap[item.cliente].guiasCount += 1;
    clienteMap[item.cliente].bultosCount += item.bultos;
    clienteMap[item.cliente].costoTotal += item.costo;
    if (item.estado === 'Conciliado') clienteMap[item.cliente].conciliadosCount += 1;

    // Médico
    if (!medicoMap[item.medico]) {
      medicoMap[item.medico] = {
        medico: item.medico,
        guiasCount: 0,
        bultosCount: 0,
        costoTotal: 0,
        conciliadosCount: 0
      };
    }
    medicoMap[item.medico].guiasCount += 1;
    medicoMap[item.medico].bultosCount += item.bultos;
    medicoMap[item.medico].costoTotal += item.costo;
    if (item.estado === 'Conciliado') medicoMap[item.medico].conciliadosCount += 1;

    // Transporte
    if (!transporteMap[item.transporte]) {
      transporteMap[item.transporte] = {
        transporte: item.transporte,
        guiasCount: 0,
        bultosCount: 0,
        costoTotal: 0,
        conciliadosCount: 0
      };
    }
    transporteMap[item.transporte].guiasCount += 1;
    transporteMap[item.transporte].bultosCount += item.bultos;
    transporteMap[item.transporte].costoTotal += item.costo;
    if (item.estado === 'Conciliado') transporteMap[item.transporte].conciliadosCount += 1;
  });

  const byCliente = Object.values(clienteMap).sort((a, b) => b.bultosCount - a.bultosCount);
  const byMedico = Object.values(medicoMap).sort((a, b) => b.bultosCount - a.bultosCount);
  const byTransporte = Object.values(transporteMap).sort((a, b) => b.bultosCount - a.bultosCount);

  // Stats globales
  const totalGuias = guiasDetalle.length;
  const totalBultos = guiasDetalle.reduce((acc, g) => acc + g.bultos, 0);
  const totalCosto = guiasDetalle.reduce((acc, g) => acc + g.costo, 0);
  const conciliadosTotal = guiasDetalle.filter(g => g.estado === 'Conciliado').length;
  const porcentajeConciliado = totalGuias > 0 ? Number(((conciliadosTotal / totalGuias) * 100).toFixed(1)) : 0;

  return {
    byCliente,
    byMedico,
    byTransporte,
    guiasDetalle,
    stats: {
      totalGuias,
      totalBultos,
      totalCosto,
      conciliadosTotal,
      porcentajeConciliado
    }
  };
}
