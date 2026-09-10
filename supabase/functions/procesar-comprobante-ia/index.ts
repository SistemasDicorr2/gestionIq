import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit per file

/**
 * Parser determinístico mediante Expresiones Regulares para texto extraído de comprobantes.
 */
function tryExtractFromText(rawText: string) {
  if (!rawText || rawText.length < 20) return null;

  let destinatario_nombre: string | null = null;
  let destinatario_cuit_cuil: string | null = null;
  let destinatario_cbu_alias: string | null = null;
  let destinatario_banco: string | null = null;
  let monto_transferido = 0;
  let fecha_transferencia: string | null = null;
  let numero_operacion: string | null = null;

  // 1. CUIT / CUIL
  const cuitMatch = rawText.match(/\b(20|23|24|27|30|33|34)[-\s]?\d{8}[-\s]?\d\b/);
  if (cuitMatch) {
    destinatario_cuit_cuil = cuitMatch[0].replace(/\s/g, '');
  }

  // 2. Monto Transferido
  const montoMatch = rawText.match(/(?:monto|importe|total|monto transferido|\$)\s*:?\s*\$?\s*([\d\.]{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+(?:,\d{2})?)/i);
  if (montoMatch) {
    const rawVal = montoMatch[1].replace(/\./g, '').replace(',', '.');
    const parsedNum = parseFloat(rawVal);
    if (!isNaN(parsedNum) && parsedNum > 0) {
      monto_transferido = parsedNum;
    }
  }

  // 3. Número de Operación / Comprobante
  const opMatch = rawText.match(/(?:nro\.?\s*de?\s*operaci[oó]n|nro\.?\s*de?\s*comprobante|referencia|nro\.?\s*transacci[oó]n)\s*:?\s*([A-Za-z0-9\-]{5,})/i);
  if (opMatch) {
    numero_operacion = opMatch[1];
  }

  // 4. Fecha (DD/MM/YYYY o YYYY-MM-DD)
  const fechaMatch = rawText.match(/\b(\d{2})[\/\.-](\d{2})[\/\.-](\d{4})\b/);
  if (fechaMatch) {
    fecha_transferencia = `${fechaMatch[3]}-${fechaMatch[2]}-${fechaMatch[1]}`;
  }

  // 5. CBU / CVU / Alias
  const cbuMatch = rawText.match(/\b\d{22}\b/);
  if (cbuMatch) {
    destinatario_cbu_alias = cbuMatch[0];
  }

  // Si logramos extraer al menos el monto y CUIT o Nro de Operación con alta certeza
  if (monto_transferido > 0 && (destinatario_cuit_cuil || numero_operacion)) {
    return {
      destinatario_nombre,
      destinatario_cuit_cuil,
      destinatario_cbu_alias,
      destinatario_banco,
      monto_transferido,
      fecha_transferencia,
      numero_operacion,
      cuenta_origen: null,
      confianza_extraccion: 0.98,
      metodo: 'parser_codigo'
    };
  }

  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    // 1. Autenticación Supabase JWT obligatoria
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Acceso no autorizado: Token JWT requerido." }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const openrouterApiKey = Deno.env.get('OPENROUTER_APIKEY') || Deno.env.get('OPENAI_API_KEY') || '';

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Acceso no autorizado: Token de sesión inválido." }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Parámetros del cuerpo de la petición
    const { fileBase64, mimeType, fileName, extractedText } = await req.json();

    let extractedData: any = null;

    // 3. PASO 1 (Optimización): Intentar parser directo por código si se envió texto extraído
    if (extractedText) {
      extractedData = tryExtractFromText(extractedText);
    }

    // 4. PASO 2: Fallback con IA Vision / OCR únicamente si el parser por código no resolvió el comprobante
    if (!extractedData && openrouterApiKey && fileBase64) {
      try {
        const imageMediaUrl = fileBase64.startsWith('data:') 
          ? fileBase64 
          : `data:${mimeType || 'image/png'};base64,${fileBase64}`;

        const promptText = `Analiza la imagen de este comprobante de transferencia bancaria y responde ÚNICAMENTE un objeto JSON estricto:
{
  "destinatario_nombre": "Nombre completo del destinatario o titular destino",
  "destinatario_cuit_cuil": "CUIT o CUIL destino (formato XX-XXXXXXXX-X o números)",
  "destinatario_cbu_alias": "CBU, CVU o Alias destino",
  "destinatario_banco": "Banco o billetera de destino",
  "monto_transferido": 150000.00,
  "fecha_transferencia": "YYYY-MM-DD",
  "numero_operacion": "Número de comprobante o referencia",
  "cuenta_origen": "Banco u ordenante origen"
}
Regla: "monto_transferido" debe ser un número decimal. Si no figura algún dato coloca null. NO agregues texto rodeando el JSON.`;

        const openrouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openrouterApiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://gestioniq.districorr.com.ar",
            "X-Title": "Gestion IQ Conciliacion Hibrida"
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: promptText },
                  { type: "image_url", image_url: { url: imageMediaUrl } }
                ]
              }
            ],
            temperature: 0.1
          })
        });

        if (openrouterResponse.ok) {
          const aiJson = await openrouterResponse.json();
          const rawText = aiJson.choices?.[0]?.message?.content || "";
          const cleanJsonStr = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          extractedData = JSON.parse(cleanJsonStr);
          extractedData.metodo = 'ia_vision';
        }
      } catch (aiErr: any) {
        console.error("[procesar-comprobante-ia] Error procesando fallback IA Vision:", aiErr);
      }
    }

    // Estructura por defecto si no se logró extraer
    if (!extractedData) {
      extractedData = {
        destinatario_nombre: null,
        destinatario_cuit_cuil: null,
        destinatario_cbu_alias: null,
        destinatario_banco: null,
        monto_transferido: 0,
        fecha_transferencia: null,
        numero_operacion: null,
        cuenta_origen: null,
        metodo: 'ninguno'
      };
    }

    // 5. Coincidencia Determinística en Base de Datos
    let matchedInstrumentador: any = null;
    let matchType = 'desconocido';

    const cleanCuit = extractedData.destinatario_cuit_cuil ? extractedData.destinatario_cuit_cuil.replace(/\D/g, '') : '';
    const cleanAlias = extractedData.destinatario_cbu_alias ? extractedData.destinatario_cbu_alias.trim().toLowerCase() : '';

    if (cleanCuit || cleanAlias) {
      let query = supabase.from('conciliacion_asociaciones_bancarias').select('*');
      if (cleanCuit && cleanAlias) {
        query = query.or(`cuit_cuil.eq.${cleanCuit},cbu_alias.ilike.%${cleanAlias}%`);
      } else if (cleanCuit) {
        query = query.eq('cuit_cuil', cleanCuit);
      } else if (cleanAlias) {
        query = query.ilike('cbu_alias', `%${cleanAlias}%`);
      }

      const { data: asocData } = await query.limit(1);
      if (asocData && asocData.length > 0) {
        matchedInstrumentador = {
          dni: asocData[0].instrumentador_dni,
          nombre: asocData[0].instrumentador_nombre
        };
        matchType = 'regla_aprendida';
      }
    }

    if (!matchedInstrumentador && extractedData.destinatario_nombre) {
      const targetName = extractedData.destinatario_nombre.trim().toLowerCase();
      const { data: reportesMatch } = await supabase
        .from('reportes')
        .select('instrumentador_dni, instrumentador, instrumentador_completado')
        .or(`instrumentador.ilike.%${targetName}%,instrumentador_completado.ilike.%${targetName}%`)
        .limit(1);

      if (reportesMatch && reportesMatch.length > 0) {
        matchedInstrumentador = {
          dni: reportesMatch[0].instrumentador_dni || 'desconocido',
          nombre: reportesMatch[0].instrumentador_completado || reportesMatch[0].instrumentador
        };
        matchType = 'directo';
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        fileName,
        extractedData,
        matchedInstrumentador,
        matchType
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error("[procesar-comprobante-ia] Excepción no controlada:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
