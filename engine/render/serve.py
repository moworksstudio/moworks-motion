"""Local static server (127.0.0.1 only): threaded, quiet, large backlog, HTTP Range (browsers seek inside audio/video with
"Range: bytes=a-b"; without it a seek re-downloaded the whole file and the player crackled, a v1 film, 3 Oct 2026).

In a script:   base, srv = serve_in_thread(root)  ->  base = "http://127.0.0.1:<free port>/"   ...   srv.shutdown()
Standalone:    python serve.py <root> [port]"""
import functools, os, re, socket, sys, threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

RANGE = re.compile(r"bytes=(\d*)-(\d*)$")


class Quiet(SimpleHTTPRequestHandler):
    extensions_map = dict(SimpleHTTPRequestHandler.extensions_map, **{".mjs": "text/javascript", ".wasm": "application/wasm",
                                                                      ".dat": "application/octet-stream", ".woff2": "font/woff2"})

    def log_message(self, *a):
        pass

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")      # edits show up on F5
        self.send_header("Accept-Ranges", "bytes")
        super().end_headers()

    overrides = {}                                         # url path -> bytes served from memory (kit.py build drafts; no file on Drive)

    def send_head(self):
        import io, urllib.parse
        body = self.overrides.get(urllib.parse.unquote(self.path.split("?")[0]))
        if body is not None:
            self.send_response(200); self.send_header("Content-Type", "text/html; charset=utf-8"); self.send_header("Content-Length", str(len(body)))
            self.end_headers(); return io.BytesIO(body)
        m = RANGE.match(self.headers.get("Range", "").strip())
        path = self.translate_path(self.path)
        if not m or not os.path.isfile(path):
            return super().send_head()
        size = os.path.getsize(path)
        a, b = m.groups()
        if a == "" and b == "":
            return super().send_head()
        start, end = (size - int(b), size - 1) if a == "" else (int(a), min(int(b) if b else size - 1, size - 1))
        if start >= size or start > end:
            self.send_response(416); self.send_header("Content-Range", f"bytes */{size}"); self.end_headers(); return None
        f = open(path, "rb"); f.seek(start)
        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Content-Length", str(end - start + 1))
        self.end_headers()
        self._left = end - start + 1
        return f

    def copyfile(self, source, outputfile):
        left = getattr(self, "_left", None)
        if left is None:
            return super().copyfile(source, outputfile)
        while left > 0:
            buf = source.read(min(64 * 1024, left))
            if not buf: break
            outputfile.write(buf); left -= len(buf)
        self._left = None


class Server(ThreadingHTTPServer):
    request_queue_size = 256
    daemon_threads = True

    def handle_error(self, request, client_address):
        """the browser hung up mid-file (a page closed, a media seek cancelled the rest of a download): normal, say nothing.
        Before 05/10/2026 every one of these printed a long ConnectionAbortedError traceback in the .bat window. Real errors still print."""
        e = sys.exc_info()[1]
        if isinstance(e, (ConnectionAbortedError, ConnectionResetError, BrokenPipeError)): return
        super().handle_error(request, client_address)


def free_port():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0)); return s.getsockname()[1]


def serve_in_thread(root, port=None):
    """serve <root> on 127.0.0.1 in a daemon thread; returns (base_url, server)"""
    port = port or free_port()
    srv = Server(("127.0.0.1", port), functools.partial(Quiet, directory=str(Path(root))))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return f"http://127.0.0.1:{port}/", srv


if __name__ == "__main__":
    root = sys.argv[1] if len(sys.argv) > 1 else "."
    port = int(sys.argv[2]) if len(sys.argv) > 2 else 8780
    Server(("127.0.0.1", port), functools.partial(Quiet, directory=str(Path(root)))).serve_forever()
