#!/usr/bin/env python3
"""
SD Forge Gradio API → A1111 REST API 桥接 v2

用法:
  .venv/bin/python3 bridge.py
  (Vite代理 /sd-api → localhost:7861 → SD Forge:7860)
"""
import json, time, base64, io, os, sys

# venv site-packages
for d in os.listdir(os.path.join(os.path.dirname(__file__), '.venv', 'lib')):
    sp = os.path.join(os.path.dirname(__file__), '.venv', 'lib', d, 'site-packages')
    if os.path.isdir(sp): sys.path.insert(0, sp); break

from http.server import HTTPServer, BaseHTTPRequestHandler
from gradio_client import Client

SD_URL = f"http://{os.environ.get('SD_HOST','172.27.128.1')}:{os.environ.get('SD_PORT','7860')}"
BRIDGE_PORT = int(os.environ.get('BRIDGE_PORT', '7861'))

# fn_index values (from /info)
TXT2IMG_FN = 259
IMG2IMG_FN = 633

client = Client(SD_URL, verbose=False)

def _read_image_file(path):
    """Read image file, return base64"""
    if os.path.isfile(path):
        with open(path, 'rb') as f:
            return base64.b64encode(f.read()).decode()
    return None

def build_args(payload: dict) -> list:
    """A1111 txt2img payload → 146-positional-arg array"""
    args = [None] * 146
    args[0] = f"task_{int(time.time()*1000)}"
    args[1] = payload.get("prompt", "")
    args[2] = payload.get("negative_prompt", "")
    args[3] = []   # styles (empty list = none)
    args[4] = 1    # batch count
    args[5] = 1    # batch size
    args[6] = float(payload.get("cfg_scale", 7.0))
    args[7] = 2.0  # distilled cfg
    args[8] = int(payload.get("height", 768))
    args[9] = int(payload.get("width", 512))
    args[10] = False  # hires fix
    args[27] = int(payload.get("steps", 25))
    args[28] = payload.get("sampler_name", "Euler a")
    args[29] = payload.get("scheduler", "Automatic")
    args[33] = int(payload.get("seed", -1))
    return args

def extract_images(result) -> list:
    """Extract base64 images from /txt2img result tuple
    result[0] = gallery list [{image: filepath, caption: str}]
    """
    images = []
    gallery = result[0] if result else []
    if isinstance(gallery, list):
        for item in gallery:
            if isinstance(item, dict):
                img_path = item.get('image', item.get('name', ''))
                b64 = _read_image_file(img_path)
                if b64:
                    images.append(b64)
    return images

class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length) if length else b'{}'
        try:
            payload = json.loads(body)
        except:
            self.send_error(400); return

        try:
            if self.path == '/sdapi/v1/txt2img':
                args = build_args(payload)
                print(f"🎨 {payload.get('prompt','')[:50]}...")
                result = client.predict(*args, fn_index=TXT2IMG_FN)
                images = extract_images(result)
                resp = {"images": images, "parameters": payload,
                        "info": json.dumps({"seed": payload.get("seed", -1)})}
                self.send_json(resp)
                print(f"  ✅ {len(images)} image(s)")

            elif self.path == '/sdapi/v1/img2img':
                args = build_args(payload)
                print(f"🖼️  {payload.get('prompt','')[:40]}...")
                result = client.predict(*args, fn_index=IMG2IMG_FN)
                images = extract_images(result)
                self.send_json({"images": images, "info": "{}"})
                print(f"  ✅ {len(images)} image(s)")

            else:
                self.send_error(404)

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
    print(f"🔗 SD Bridge v2: http://localhost:{BRIDGE_PORT}")
    print(f"   → SD Forge: {SD_URL}")
    HTTPServer(('0.0.0.0', BRIDGE_PORT), Handler).serve_forever()
