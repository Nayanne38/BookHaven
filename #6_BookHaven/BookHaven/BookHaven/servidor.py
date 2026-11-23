"""Servidor local do BookHaven, sem cache, para as edições aparecerem com um F5."""
import http.server
import os
import socketserver
import webbrowser

PORTA = 8000
os.chdir(os.path.dirname(os.path.abspath(__file__)))


class SemCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()


socketserver.TCPServer.allow_reuse_address = False
with socketserver.TCPServer(("", PORTA), SemCache) as servidor:
    print(f"BookHaven rodando em http://localhost:{PORTA}  (Ctrl+C para parar)")
    webbrowser.open(f"http://localhost:{PORTA}")
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        pass
