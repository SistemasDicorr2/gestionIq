// src/services/useImageResizer.js

export function resizeImage(file, maxWidth = 400, quality = 0.7) {
  console.log(`[Image Resizer] Iniciando redimensión para: ${file.name}, Tamaño Original: ${(file.size / 1024).toFixed(2)} KB`);

  return new Promise((resolve, reject) => {
    // Validación inicial: si el archivo no es una imagen, no podemos procesarlo.
    if (!file.type || !file.type.startsWith('image/')) {
      console.warn(`[Image Resizer] El archivo ${file.name} no es una imagen, se omite la redimensión.`);
      return resolve(null);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scale;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        ctx.canvas.toBlob((blob) => {
          if (!blob || blob.size === 0) {
            console.error("[Image Resizer] ¡ERROR! El blob generado es nulo o tiene tamaño 0.");
            return reject(new Error("No se pudo crear el blob de la imagen redimensionada."));
          }

          const newFileName = file.name.split('.').slice(0, -1).join('.') + '_thumb.webp';
          const resizedFile = new File([blob], newFileName, {
            type: 'image/webp',
            lastModified: Date.now(),
          });

          console.log(`[Image Resizer] Redimensión completa. Nuevo archivo: ${resizedFile.name}, Tamaño Redimensionado: ${(resizedFile.size / 1024).toFixed(2)} KB`);
          
          resolve(resizedFile);
        }, 'image/webp', quality);
      };
      
      img.onerror = (err) => {
        console.error("[Image Resizer] ¡ERROR! No se pudo cargar la imagen en el elemento Image.", err);
        reject(err);
      };
    };
    
    reader.onerror = (err) => {
      console.error("[Image Resizer] ¡ERROR! Falló el FileReader.", err);
      reject(err);
    };
  });
}

export function optimizeImageForUpload(file, maxDimension = 2048, quality = 0.85) {
  return new Promise((resolve) => {
    const isImage = (file.type && file.type.startsWith('image/')) || /\.(jpe?g|png|webp|heic)$/i.test(file.name);
    if (!isImage) return resolve(file);
    // Si ya es liviana (< 1.5MB) y tiene tipo válido, no modificar
    if (file.size < 1.5 * 1024 * 1024 && file.type) return resolve(file);

    console.log(`[Image Optimizer] Optimizando ${file.name} (Tamaño original: ${(file.size / (1024 * 1024)).toFixed(2)} MB)...`);

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (!blob || blob.size === 0) return resolve(file);
          const cleanName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
          const optimizedFile = new File([blob], cleanName, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          console.log(`[Image Optimizer] ${file.name} listo: ${(optimizedFile.size / 1024).toFixed(2)} KB (reducido un ${Math.round((1 - optimizedFile.size / file.size) * 100)}%)`);
          resolve(optimizedFile);
        }, 'image/jpeg', quality);
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}