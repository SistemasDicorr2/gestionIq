import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'

const buildTimestamp = Date.now().toString();

function generateVersionPlugin() {
  return {
    name: 'generate-version-json',
    buildStart() {
      const versionData = {
        version: buildTimestamp,
        builtAt: new Date().toISOString()
      };
      const publicDir = path.resolve(__dirname, 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      fs.writeFileSync(
        path.join(publicDir, 'version.json'),
        JSON.stringify(versionData, null, 2)
      );
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({
          version: buildTimestamp,
          builtAt: new Date().toISOString()
        }, null, 2)
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), generateVersionPlugin()],
  define: {
    __APP_VERSION__: JSON.stringify(buildTimestamp),
  },
  resolve: {
    alias: {
      'vue': 'vue/dist/vue.esm-bundler.js',
      'vue-toastification': path.resolve(__dirname, 'src/composables/useToasts.js'),
    },
  },
  server: {
    allowedHosts: ['.trycloudflare.com'],
    proxy: {
      '/api-resend': {
        target: 'https://api.resend.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-resend/, '')
      }
    }
  },
})
