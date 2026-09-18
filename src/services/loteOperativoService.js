// src/services/loteOperativoService.js
import { supabase } from './supabase';

/**
 * Consulta las cirugías pendientes enviadas (últimos 60 días, sin omitidas y sin pagar)
 * y genera o actualiza el lote semanal inmutable en Supabase mediante la RPC generar_o_consultar_lote_semanal.
 * 
 * @returns {Promise<{ token: string, count: number, surgeries: Array, url: string }>}
 */
export async function generarLoteOperativoActualizado() {
  // 1. Obtener cirugías omitidas de la configuración
  const { data: omitidasData } = await supabase
    .from('resumen_operativo_config')
    .select('value')
    .eq('key', 'cirugias_omitidas')
    .maybeSingle();

  const omitidasList = (omitidasData && Array.isArray(omitidasData.value)) ? omitidasData.value : [];
  const omitidosIds = new Set(omitidasList.map(item => String(item.id || item)));

  // 2. Consultar todas las cirugías pendientes enviadas
  const { data: pendingSurgeriesRaw, error: rpcError } = await supabase.rpc('get_todas_cirugias_pendientes');
  if (rpcError) {
    throw new Error(`Error al consultar cirugías pendientes: ${rpcError.message}`);
  }

  const allPending = pendingSurgeriesRaw || [];
  const today = new Date();
  const sixtyDaysAgo = new Date(today);
  sixtyDaysAgo.setDate(today.getDate() - 60);
  sixtyDaysAgo.setHours(0, 0, 0, 0);

  const pending60Days = allPending.filter((s) => {
    if (!s.fecha_cirugia) return false;
    if (s.pago_id) return false; // Excluir si ya fue pagada
    if (omitidosIds.has(String(s.id))) return false; // Excluir si está omitida
    const d = new Date(`${String(s.fecha_cirugia).split('T')[0]}T00:00:00`);
    return !isNaN(d.getTime()) && d >= sixtyDaysAgo;
  });

  const surgeryIds = pending60Days.map((s) => s.id).filter(Boolean);

  // 3. Período: Desde el sábado anterior a las 00:00 hs ART hasta el momento actual
  const now = new Date();
  const artNow = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const currentDay = artNow.getUTCDay();
  const daysSinceSaturday = (currentDay + 1) % 7;
  const saturdayDate = new Date(artNow);
  saturdayDate.setUTCDate(artNow.getUTCDate() - daysSinceSaturday);
  saturdayDate.setUTCHours(0, 0, 0, 0);

  const desdeIso = new Date(saturdayDate.getTime() + 3 * 60 * 60 * 1000).toISOString();
  const hastaIso = now.toISOString();

  const year = saturdayDate.getUTCFullYear();
  const month = String(saturdayDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(saturdayDate.getUTCDate()).padStart(2, '0');
  const semanaKey = `${year}-${month}-${day}_W${Math.ceil(saturdayDate.getUTCDate() / 7)}`;

  // 4. Invocación RPC generar_o_consultar_lote_semanal pasando la lista actualizada de IDs
  const { data: rpcResult, error: rpcErr } = await supabase.rpc('generar_o_consultar_lote_semanal', {
    p_desde: desdeIso,
    p_hasta: hastaIso,
    p_semana_key: semanaKey,
    p_reporte_ids: surgeryIds
  });

  if (rpcErr) {
    throw new Error(`Error al generar o actualizar lote: ${rpcErr.message}`);
  }

  const token = rpcResult?.token;
  if (!token) {
    throw new Error("No se pudo obtener el identificador (token) del lote.");
  }

  const url = `/resumen-operativo/lote/${token}`;

  return {
    token,
    count: surgeryIds.length,
    surgeries: pending60Days,
    url
  };
}
