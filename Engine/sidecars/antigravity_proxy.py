import os
import sys
import json
import logging
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.request import Request, urlopen
from urllib.error import HTTPError

# Add parent directory to sys.path to import key_router
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from gemini_key_router import key_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] [AntigravityProxy] %(message)s")
logger = logging.getLogger("AntigravityProxy")

HOST = os.getenv("SIDE_PROXY_HOST", "0.0.0.0")
PORT = int(os.getenv("SIDE_PROXY_PORT", "8080"))

class AntigravityProxyHandler(BaseHTTPRequestHandler):
    """
    Sidecar Proxy Local que intercepta llamadas a la API de Google Gemini / OpenAI-compatibles,
    inyecta automáticamente la API Key disponible del pool multi-cuenta y maneja failovers.
    """

    def do_GET(self):
        self._handle_proxy()

    def do_POST(self):
        self._handle_proxy()

    def _handle_proxy(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length) if content_length > 0 else None

        active_key = key_router.get_available_key()
        
        # Build target Google Gemini API URL
        target_host = "generativelanguage.googleapis.com"
        target_url = f"https://{target_host}{self.path}"
        
        # Inject active key into query parameters or headers
        if "key=" in target_url:
            import re
            target_url = re.sub(r"key=[^&]+", f"key={active_key}", target_url)
        else:
            delimiter = "&" if "?" in target_url else "?"
            target_url = f"{target_url}{delimiter}key={active_key}"

        headers = {key: val for key, val in self.headers.items() if key.lower() not in ["host", "content-length"]}
        headers["Host"] = target_host

        req = Request(target_url, data=body, headers=headers, method=self.command)

        try:
            with urlopen(req) as resp:
                resp_body = resp.read()
                self.send_response(resp.status)
                for k, v in resp.headers.items():
                    self.send_header(k, v)
                self.end_headers()
                self.wfile.write(resp_body)
        except HTTPError as e:
            if e.code in [429, 403]:
                logger.warning(f"⚠️ Proxy detectó respuesta HTTP {e.code} de Gemini. Rotando clave...")
                key_router.mark_rate_limited(active_key)
            
            err_body = e.read()
            self.send_response(e.code)
            for k, v in e.headers.items():
                self.send_header(k, v)
            self.end_headers()
            self.wfile.write(err_body)
        except Exception as e:
            logger.error(f"❌ Error interno en Antigravity Proxy: {e}")
            self.send_response(500)
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))

def run_sidecar_proxy():
    server = HTTPServer((HOST, PORT), AntigravityProxyHandler)
    logger.info(f"🌐 Antigravity Sidecar Proxy ejecutándose en http://{HOST}:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        logger.info("🛑 Deteniendo Antigravity Sidecar Proxy...")
        server.server_close()

if __name__ == "__main__":
    run_sidecar_proxy()
