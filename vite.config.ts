import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { execSync } from 'child_process';

// 自动检测 Windows 主机 IP (WSL 网关)
function getWindowsHostIP(): string {
  try {
    // WSL: Windows 主机通常在默认路由网关上
    const route = execSync('ip route show default 2>/dev/null | awk \'{print $3}\'', { encoding: 'utf-8' }).trim();
    if (route) return route;
  } catch {}
  // fallback: /etc/resolv.conf nameserver
  try {
    const ns = execSync('cat /etc/resolv.conf 2>/dev/null | grep nameserver | awk \'{print $2}\' | head -1', { encoding: 'utf-8' }).trim();
    if (ns) return ns;
  } catch {}
  return 'localhost';
}

const SD_HOST = getWindowsHostIP();
const SD_PORT = 7860;

console.log(`🔗 SD Forge proxy: http://${SD_HOST}:${SD_PORT}`);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/sd-api': {
        target: `http://${SD_HOST}:${SD_PORT}`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sd-api/, ''),
      },
    },
  },
  define: {
    __SD_HOST__: JSON.stringify(SD_HOST),
    __SD_PORT__: JSON.stringify(SD_PORT),
  },
});
