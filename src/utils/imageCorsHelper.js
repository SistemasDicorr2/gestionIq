// src/utils/imageCorsHelper.js

/**
 * Retorna una URL segura para CORS utilizando el proxy global de imágenes si es necesario.
 * @param {string} url URL original de la imagen (ej: Cloudflare R2 r2.dev)
 * @returns {string} URL con cabeceras CORS habilitadas
 */
export const getCorsSafeImageUrl = (url) => {
  if (!url) return '';
  // Si ya es base64 o blob local, retornar directo
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  // Si proviene de Cloudflare R2 u otro host externo sin CORS configurado
  if (url.includes('r2.dev') || url.includes('supabase.co')) {
    const cleanUrl = url.replace(/^https?:\/\//, '');
    return `https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}&output=jpg&q=85`;
  }
  return url;
};

/**
 * Convierte cualquier URL de imagen a un Data URL (Base64) seguro y local.
 * Esto evita al 100% cualquier restricción de CORS al capturar con html2canvas.
 * @param {string} url URL original o remota
 * @returns {Promise<string>} Data URL base64 o URL original en caso de fallo
 */
export const convertUrlToBase64 = async (url) => {
  if (!url) return '';
  if (url.startsWith('data:')) return url;

  try {
    const safeUrl = getCorsSafeImageUrl(url);
    const response = await fetch(safeUrl, { mode: 'cors' });
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const blob = await response.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(url);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn("Fallo al convertir imagen a Base64 via proxy, usando fallback:", error);
    return url;
  }
};
