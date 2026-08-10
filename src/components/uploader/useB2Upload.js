// src/components/uploader/useB2Upload.js (Corregido)
import { ref } from 'vue';

export function useB2Upload() {
  const uploadProgress = ref(0);
  const isUploading = ref(false);

  /**
   * Sube un archivo a una URL pre-firmada de B2 usando XMLHttpRequest con reintentos automáticos.
   * @param {string} uploadUrl - La URL pre-firmada.
   * @param {File} file - El archivo a subir.
   * @param {Function} [onFileProgress] - Callback de progreso por archivo (0-100).
   * @param {number} [maxRetries=3] - Intentos máximos en caso de fallos temporales de red.
   * @returns {Promise<any>}
   */
  const uploadFileSingleAttempt = (uploadUrl, file, onFileProgress) => {
    return new Promise((resolve, reject) => {
      isUploading.value = true;
      uploadProgress.value = 0;

      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);
      xhr.timeout = 60000;

      xhr.ontimeout = () => {
        reject(new Error('La subida tardó demasiado y fue cancelada (timeout).'));
      };
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const pct = Math.round((event.loaded / event.total) * 100);
          uploadProgress.value = pct;
          if (typeof onFileProgress === 'function') {
            onFileProgress(pct);
          }
        }
      };
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response);
        } else {
          reject(new Error(`Fallo en la subida a R2. El servidor respondió con el estado ${xhr.status}.`));
        }
      };
      
      xhr.onerror = () => reject(new Error('Error de red durante la subida. Revisa tu conexión.'));

      xhr.onloadend = () => {
        isUploading.value = false;
      };

      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  };

  const uploadFile = async (uploadUrl, file, onFileProgress, maxRetries = 3) => {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await uploadFileSingleAttempt(uploadUrl, file, onFileProgress);
      } catch (err) {
        lastError = err;
        console.warn(`[useB2Upload] Intento ${attempt}/${maxRetries} falló para ${file.name}:`, err.message);
        if (attempt < maxRetries) {
          // Espera exponencial: 1000ms, 2000ms...
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    throw lastError;
  };

  return {
    uploadProgress,
    isUploading,
    uploadFile
  };
}