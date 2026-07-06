<!-- src/components/shared/EvidenceViewer.vue (VERSIÓN FINAL Y OPTIMIZADA) -->
<template>
  <div class="evidence-viewer-container">
    <h4 class="viewer-title">Archivos Adjuntos:</h4>
    
    <div v-if="!files || files.length === 0" class="empty-state">
      <p>No se han subido archivos para este control.</p>
    </div>

    <div v-else class="thumbnails-gallery">
      <div v-for="(file, index) in imageFiles" :key="file.id || file.object_key" class="thumbnail-card">
        
        <div class="relative group">
          <button @click="openLightbox(index)" class="thumbnail-button">
            <img
              :src="getThumbnailUrl(file.object_key)"
              :alt="file.file_name"
              class="thumbnail-image"
              @error="handleImageError($event, getPublicUrl(file.object_key))"
            />
          </button>

          <!-- Botón de eliminar -->
          <button
            v-if="deletable"
            @click="requestDeleteFile(file)"
            class="delete-btn-overlay"
            title="Eliminar evidencia"
          >
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p class="thumbnail-caption">{{ file.file_name }}</p>
      </div>
    </div>

    <VueEasyLightbox
      :visible="isLightboxVisible"
      :imgs="lightboxImages"
      :index="activePhotoIndex"
      @hide="closeLightbox"
    />

    <!-- Confirmación de eliminación modal -->
    <Transition name="modal-fade">
      <div v-if="filePendingDelete" class="confirm-backdrop" @click.self="cancelDeleteFile">
        <div class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-file-title">
          <div class="confirm-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div class="confirm-content">
            <h4 id="delete-file-title">Eliminar Evidencia</h4>
            <p>
              ¿Está seguro que desea eliminar la imagen <strong>{{ filePendingDelete.caption }}</strong>? Esta acción no se puede volver atrás.
            </p>
          </div>
          <div class="confirm-actions">
            <button type="button" class="cancel-button" @click="cancelDeleteFile">Cancelar</button>
            <button
              type="button"
              class="delete-button-modal"
              @click="confirmDeleteFile"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { supabase } from '../../services/supabase';
import { useToasts } from '../../composables/useToasts';
import VueEasyLightbox from 'vue-easy-lightbox';
import 'vue-easy-lightbox/dist/external-css/vue-easy-lightbox.css';

const props = defineProps({
  files: {
    type: Array,
    required: true,
    default: () => []
  },
  deletable: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['file-deleted']);

const { showSuccessToast, showErrorToast } = useToasts();
const activePhotoIndex = ref(0);
const isLightboxVisible = ref(false);
const filePendingDelete = ref(null);

const openLightbox = (index) => {
  activePhotoIndex.value = index;
  isLightboxVisible.value = true;
};
const closeLightbox = () => {
  isLightboxVisible.value = false;
};

const requestDeleteFile = (file) => {
  filePendingDelete.value = file;
};

const cancelDeleteFile = () => {
  filePendingDelete.value = null;
};

const confirmDeleteFile = async () => {
  if (!filePendingDelete.value) return;
  const fileId = filePendingDelete.value.id;
  try {
    const { error } = await supabase
      .from('reporte_evidencias')
      .delete()
      .eq('id', fileId);

    if (error) throw error;

    showSuccessToast('Evidencia eliminada correctamente.');
    emit('file-deleted', fileId);
  } catch (error) {
    showErrorToast(error, 'Error al eliminar la evidencia.');
  } finally {
    filePendingDelete.value = null;
  }
};

const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;

const imageFiles = computed(() => 
  props.files
    .filter(file => file.content_type && file.content_type.startsWith('image/'))
    .map(file => ({
      ...file,
      url: getPublicUrl(file.object_key),
      caption: file.file_name
    }))
);

const lightboxImages = computed(() => imageFiles.value.map(file => file.url));

const getPublicUrl = (objectKey) => {
  if (!R2_PUBLIC_URL || !objectKey) return '';
  return `${R2_PUBLIC_URL}/${objectKey}`;
};

// ** LA SOLUCIÓN CLAVE ESTÁ AQUÍ **
// La función ahora es más inteligente y solo intenta cargar miniaturas para formatos conocidos.
const getThumbnailUrl = (objectKey) => {
  if (!objectKey) return '';
  
  const lowerCaseKey = objectKey.toLowerCase();
  
  // Solo intentamos generar una URL de miniatura si el archivo es un JPG/JPEG.
  // Para otros formatos (PNG, etc.), cargamos el original directamente para evitar errores.
  if (!lowerCaseKey.endsWith('.jpg') && !lowerCaseKey.endsWith('.jpeg')) {
    return getPublicUrl(objectKey);
  }

  const lastDotIndex = objectKey.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return getPublicUrl(objectKey); // Fallback por si no tiene extensión
  }

  const baseName = objectKey.substring(0, lastDotIndex);
  const thumbKey = `${baseName}_thumb.webp`;
  return `${R2_PUBLIC_URL}/${thumbKey}`;
};

const handleImageError = (event, originalUrl) => {
  if (event.target.src !== originalUrl) {
    console.warn(`[EvidenceViewer] Falló la carga de la miniatura. Intentando cargar original: ${originalUrl}`);
    event.target.src = originalUrl;
  }
};
</script>

<style scoped>
.thumbnail-button { display: block; width: 100px; height: 100px; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center; background-color: #f7fafc; border: 1px solid #e2e8f0; padding: 0; cursor: pointer; transition: transform 0.2s ease; }
.thumbnail-button:hover { transform: scale(1.02); }
.evidence-viewer-container { width: 100%; margin-top: 1rem; }
.viewer-title { font-size: 0.875rem; font-weight: 600; margin-bottom: 0.75rem; color: #4a5568; }
.empty-state { font-size: 0.875rem; padding: 1rem; border-radius: 8px; text-align: center; color: #718096; border: 1px dashed #e2e8f0; }
.thumbnails-gallery { display: flex; gap: 0.75rem; overflow-x: auto; padding: 0.5rem; scrollbar-width: thin; scrollbar-color: #a0aec0 #e2e8f0; }
.thumbnails-gallery::-webkit-scrollbar { height: 8px; }
.thumbnails-gallery::-webkit-scrollbar-track { background: #e2e8f0; border-radius: 10px; }
.thumbnails-gallery::-webkit-scrollbar-thumb { background-color: #a0aec0; border-radius: 10px; border: 2px solid #e2e8f0; }
.thumbnail-card { flex-shrink: 0; width: 100px; text-align: center; }
.thumbnail-image { width: 100%; height: 100%; object-fit: cover; }
.thumbnail-caption { font-size: 0.75rem; margin-top: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #4a5568; }

.delete-btn-overlay {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  border-radius: 9999px;
  background-color: #ef4444;
  color: #ffffff;
  border: 1.5px solid #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  opacity: 0.85;
}
.delete-btn-overlay:hover {
  background-color: #dc2626;
  transform: scale(1.1);
  opacity: 1;
}
.delete-btn-overlay:active {
  transform: scale(0.9);
}

.confirm-backdrop {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
}
.confirm-dialog {
  width: min(100%, 420px);
  border-radius: 16px;
  background-color: #ffffff;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.25);
  padding: 1.5rem;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1.25rem;
  border: 1px solid #f1f5f9;
}
.confirm-icon {
  width: 44px;
  height: 44px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dc2626;
  background-color: #fee2e2;
}
.confirm-icon svg {
  width: 24px;
  height: 24px;
}
.confirm-content h4 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
}
.confirm-content p {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #475569;
}
.confirm-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}
.cancel-button, .delete-button-modal {
  min-height: 38px;
  border-radius: 12px;
  border: 1px solid transparent;
  padding: 0 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}
.cancel-button {
  background-color: #f1f5f9;
  border-color: #e2e8f0;
  color: #475569;
}
.cancel-button:hover {
  background-color: #e2e8f0;
}
.delete-button-modal {
  background-color: #dc2626;
  color: #ffffff;
}
.delete-button-modal:hover {
  background-color: #b91c1c;
}
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.2s ease-in-out;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}
</style>