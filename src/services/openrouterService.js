// src/services/openrouterService.js
/**
 * Servicio de Integración con OpenRouter AI para Gestión IQ.
 * Permite interpretar descripciones complejas o inéditas de cajas/instrumental
 * y mapearlas a la estructura de codificación oficial.
 */

export const generateCodeWithAI = async (userDescription, dictionaryEntries, isAlternative = false) => {
  if (!userDescription || !userDescription.trim()) {
    throw new Error('Debés ingresar una descripción o nombre para consultar a la IA.');
  }

  // 1. Obtener API Key desde env o localStorage
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || 
                 import.meta.env.VITE_OPENROUTER_APIKEY || 
                 localStorage.getItem('OPENROUTER_API_KEY') || '';

  if (!apiKey) {
    throw new Error('OPENROUTER_NO_KEY');
  }

  // 2. Formatear las opciones disponibles en el diccionario para enviárselas como contexto a la IA
  let familias = dictionaryEntries.filter(e => e.grupo.toLowerCase() === 'familia').map(e => `${e.codigo}: ${e.significado}`).join(', ');
  if (!familias.includes('CO:')) {
    familias += (familias ? ', ' : '') + 'CO: Columna';
  }

  let materiales = dictionaryEntries.filter(e => e.grupo.toLowerCase() === 'material').map(e => `${e.codigo}: ${e.significado}`).join(', ');
  let medidas = dictionaryEntries.filter(e => e.grupo.toLowerCase() === 'medida').map(e => `${e.codigo}: ${e.significado}`).join(', ');

  let clasificaciones = dictionaryEntries.filter(e => e.grupo.toLowerCase() === 'clasificación').map(e => `${e.codigo}: ${e.significado}`).join(', ');
  if (!clasificaciones.includes('CO:')) {
    clasificaciones += (clasificaciones ? ', ' : '') + 'CO: Columna / Fijación Vertebral';
  }

  let contenidos = dictionaryEntries.filter(e => e.grupo.toLowerCase() === 'contenido').map(e => `${e.codigo}: ${e.significado}`).join(', ');

  const systemPrompt = `Sos un experto en traumatología y codificación de cajas quirúrgicas de Districorr (Gestión IQ).
Tu tarea es analizar la descripción provista por el usuario y asignarle los mejores códigos de componentes dentro del catálogo oficial.

CATÁLOGO OFICIAL DE OPCIONES:
- Familias: [${familias}]
- Materiales: [${materiales}]
- Medidas / Variantes: [${medidas}]
- Clasificaciones: [${clasificaciones}]
- Contenidos: [${contenidos}]

REGLAS DE CLASIFICACIÓN CLÍNICA STRICTAS:
1. NUNCA asumas Osteosíntesis (OS) si la cirugía corresponde a Columna (Familia CO), Reemplazo de Cadera (RC o RN), Reemplazo de Rodilla (RR), Clavo Endomedular (CL), Motor (MT), etc.
2. Si el producto es de COLUMNA (ej: "CAJA DE COLUMNA"), la familia DEBE ser CO (Columna) y la clasificación DEBE ser CO (Columna / Fijación Vertebral).
3. Elige ÚNICAMENTE uno de los códigos de las opciones permitidas arriba para cada campo.
${isAlternative ? '4. PROVEE UNA INTERPRETACIÓN ALTERNATIVA VÁLIDA (por ejemplo, proponiendo una clasificación o variante de contenido distinta, ej. Implante P vs Instrumental I o Caja Unificada U).' : ''}
5. Responde ÚNICAMENTE un objeto JSON estricto sin marcado adicional, con la siguiente estructura:
{
  "familia": "CÓDIGO_FAMILIA",
  "material": "CÓDIGO_MATERIAL",
  "variante": "CÓDIGO_MEDIDA",
  "clasificacion": "CÓDIGO_CLASIFICACIÓN",
  "contenido": "CÓDIGO_CONTENIDO",
  "nombre_sugerido": "Nombre estandarizado sugerido en mayúsculas",
  "explicacion": "Explicación breve de 1 línea de por qué elegiste cada componente"
}`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Gestion IQ Cajas Knowledge'
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Descripción del producto a codificar: "${userDescription.trim()}"` }
      ],
      temperature: isAlternative ? 0.7 : 0.1
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Error HTTP ${response.status} en OpenRouter.`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content || '';

  // Limpiar posibles delimitadores de código markdown
  const cleanJsonStr = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleanJsonStr);

  return parsed;
};
