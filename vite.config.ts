import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { execSync, spawn, ChildProcess } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 自动检测 Windows 主机 IP (WSL 网关)
function getWindowsHostIP(): string {
  try {
    const route = execSync("ip route show default 2>/dev/null | awk '{print $3}'", { encoding: 'utf-8' }).trim();
    if (route) return route;
  } catch {}
  try {
    const ns = execSync("cat /etc/resolv.conf 2>/dev/null | grep nameserver | awk '{print $2}' | head -1", { encoding: 'utf-8' }).trim();
    if (ns) return ns;
  } catch {}
  return 'localhost';
}

const SD_HOST = getWindowsHostIP();
const SD_PORT = 7860;
const BRIDGE_PORT = 7861;

console.log(`🔗 SD Forge proxy: http://${SD_HOST}:${SD_PORT}`);

// 自动启动 Gradio 桥接
let bridgeProc: ChildProcess | null = null;
function startBridge() {
  const bridgePath = resolve(__dirname, 'bridge.py');
  const venvPython = resolve(__dirname, '.venv/bin/python3');
  try {
    bridgeProc = spawn(venvPython, [bridgePath], {
      env: { ...process.env, SD_HOST, SD_PORT: String(SD_PORT), BRIDGE_PORT: String(BRIDGE_PORT) },
      stdio: 'pipe',
    });
    bridgeProc.stdout?.on('data', (d: Buffer) => process.stdout.write(`[bridge] ${d}`));
    bridgeProc.stderr?.on('data', (d: Buffer) => process.stderr.write(`[bridge] ${d}`));
    bridgeProc.on('exit', (code) => console.log(`[bridge] exited code=${code}`));
    console.log(`[bridge] started on :${BRIDGE_PORT}`);
  } catch (e) {
    console.warn('[bridge] failed to start, SD image gen unavailable:', e);
  }
}
function stopBridge() {
  if (bridgeProc) { bridgeProc.kill(); bridgeProc = null; }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'sd-bridge',
      configureServer() {
        startBridge();
      },
      buildStart() {
        // Only in dev
      },
    },
  ],
  base: '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/sd-api': {
        target: `http://localhost:${BRIDGE_PORT}`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sd-api/, ''),
      },
    },
  },
  // 开发服务器关闭时杀掉桥接
  preview: {
    host: '0.0.0.0',
  },
});

// 确保退出时杀掉桥接
process.on('exit', stopBridge);
process.on('SIGINT', () => { stopBridge(); process.exit(); });
process.on('SIGTERM', () => { stopBridge(); process.exit(); });
