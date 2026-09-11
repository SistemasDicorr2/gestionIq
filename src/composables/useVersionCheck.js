import { ref, onMounted, onUnmounted } from 'vue';

const hasUpdate = ref(false);
const newVersion = ref(null);
const currentVersion = ref(typeof __APP_VERSION__ !== 'undefined' ? String(__APP_VERSION__) : null);

export function useVersionCheck() {
  let intervalId = null;

  const checkForUpdates = async () => {
    try {
      const response = await fetch(`/version.json?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) return;

      const data = await response.json();
      if (!data || !data.version) return;

      const remoteVersionStr = String(data.version);

      if (!currentVersion.value) {
        currentVersion.value = remoteVersionStr;
        return;
      }

      if (remoteVersionStr !== currentVersion.value) {
        hasUpdate.value = true;
        newVersion.value = remoteVersionStr;
      }
    } catch (err) {
      console.debug('[useVersionCheck] Error al comprobar versión:', err);
    }
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      checkForUpdates();
    }
  };

  const handleWindowFocus = () => {
    checkForUpdates();
  };

  const reloadApp = () => {
    window.location.reload();
  };

  onMounted(() => {
    // 1. Verificación inicial
    checkForUpdates();

    // 2. Intervalo periódico cada 60 segundos
    intervalId = setInterval(checkForUpdates, 60000);

    // 3. Verificación al volver visibilidad o foco a la pestaña
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
  });

  onUnmounted(() => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('focus', handleWindowFocus);
  });

  return {
    hasUpdate,
    newVersion,
    currentVersion,
    checkForUpdates,
    reloadApp
  };
}
