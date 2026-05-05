#!/usr/bin/env python3
"""
SD Forge Gradio API → A1111 REST API 桥接
使用 gradio_client 调用 SD Forge, 暴露 /sdapi/v1/txt2img 兼容端点

启动: .venv/bin/python3 bridge.py
"""
import json, time, base64, io, sys, os
from http.server import HTTPServer, BaseHTTPRequestHandler

# Add venv path
VENV_SITE = os.path.join(os.path.dirname(__file__), '.venv', 'lib')
for d in os.listdir(VENV_SITE):
    sp = os.path.join(VENV_SITE, d, 'site-packages')
    if os.path.isdir(sp): sys.path.insert(0, sp); break

from gradio_client import Client

SD_HOST = os.environ.get('SD_HOST', '172.27.128.1')
SD_PORT = int(os.environ.get('SD_PORT', '7860'))
SD_URL = f"http://{SD_HOST}:{SD_PORT}"
BRIDGE_PORT = int(os.environ.get('BRIDGE_PORT', '7861'))

client = Client(SD_URL, verbose=False)

def build_txt2img_args(payload: dict) -> list:
    """A1111 payload → 146-positional-arg array for Gradio fn_index=0"""
    args = [None] * 146
    args[0] = f"task_{int(time.time()*1000)}"
    args[1] = payload.get("prompt", "")
    args[2] = payload.get("negative_prompt", "")
    args[3] = ["None"]  # styles
    args[4] = float(payload.get("batch_size", 1))
    args[5] = float(payload.get("batch_size", 1))
    args[6] = float(payload.get("cfg_scale", 7.0))
    args[7] = 2.0  # distilled cfg
    args[8] = float(payload.get("height", 768))
    args[9] = float(payload.get("width", 512))
    args[10] = False  # hires fix
    args[27] = float(payload.get("steps", 25))
    args[28] = payload.get("sampler_name", "Euler a")
    args[29] = "Automatic"
    args[33] = float(payload.get("seed", -1))
    return args

def build_img2img_args(payload: dict) -> list:
    """A1111 img2img → 146-positional-arg array for Gradio fn_index=1"""
    args = [None] * 146
    args[0] = f"task_{int(time.time()*1000)}"
    # img2img first param is init image (PIL Image or file path)
    init_b64 = ""
    if payload.get("init_images"):
        init_b64 = payload["init_images"][0]
    args[1] = init_b64  # init image (base64 string - gradio_client handles it)
    args[2] = payload.get("prompt", "")
    args[3] = payload.get("negative_prompt", "")
    args[4] = ["None"]
    args[5] = 1.0; args[6] = 1.0
    args[7] = float(payload.get("cfg_scale", 7.0))
    args[8] = 2.0
    args[9] = float(payload.get("height", 768))
    args[10] = float(payload.get("width", 512))
    args[11] = False  # hires
    args[28] = float(payload.get("denoising_strength", 0.45))
    args[29] = float(payload.get("steps", 25))
    args[30] = payload.get("sampler_name", "Euler a")
    args[31] = "Automatic"
    args[35] = float(payload.get("seed", -1))
    return args

def extract_images(result) -> list:
    """Extract base64 images from Gradio result tuple"""
    images = []
    items = result if isinstance(result, (list, tuple)) else [result]
    for item in items:
        if isinstance(item, str) and len(item) > 100:
            # Could be file path or base64
            if os.path.isfile(item):
                with open(item, 'rb') as f:
                    images.append(base64.b64encode(f.read()).decode())
            elif item.startswith('data:image'):
                images.append(item.split(',', 1)[1])
            else:
                images.append(item)
        elif hasattr(item, 'save'):
            # PIL Image
            buf = io.BytesIO()
            item.save(buf, format='PNG')
            images.append(base64.b64encode(buf.getvalue()).decode())
    return images

class BridgeHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length)
        try:
            payload = json.loads(body)
        except json.JSONDecodeError:
            self.send_error(400)
            return

        try:
            if self.path == '/sdapi/v1/txt2img':
                args = build_txt2img_args(payload)
                print(f"🎨 txt2img: {payload.get('prompt','')[:60]}...")
                result = client.predict(*args, fn_index=0)
                images = extract_images(result)
                resp = {"images": images, "parameters": payload, "info": json.dumps({"seed": payload.get("seed", -1)})}
                self.send_json(resp)
                print(f"  ✅ {len(images)} image(s)")

            elif self.path == '/sdapi/v1/img2img':
                args = build_img2img_args(payload)
                print(f"🖼️  img2img: {payload.get('prompt','')[:50]}...")
                result = client.predict(*args, fn_index=1)
                images = extract_images(result)
                self.send_json({"images": images, "info": "{}"})
                print(f"  ✅ {len(images)} image(s)")

            else:
                self.send_error(404, f"Unknown: {self.path}")

        except Exception as e:
            print(f"  ❌ {e}")
            self.send_error(502, str(e))

    def send_json(self, data):
        body = json.dumps(data).encode()
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def log_message(self, fmt, *args):
        pass

if __name__ == '__main__':
    print(f"🔗 SD Bridge: http://localhost:{BRIDGE_PORT}")
    print(f"   → SD Forge: {SD_URL}")
    server = HTTPServer(('0.0.0.0', BRIDGE_PORT), BridgeHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutdown")
        server.shutdown()
