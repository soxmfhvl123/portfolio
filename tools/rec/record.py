"""Frame-exact website recording for works thumbnails (headless Chrome + CDP).

Each segment is "URL|seconds|scrollPx[|mouse]": the page loads, settles, then runs on a
virtual clock (clock.js) stepped exactly 1/60 s per captured frame, scrolling with an
ease-in-out curve (short hold at both ends). "mouse" moves a smooth pointer path for
pieces that react to it. Page <video>s are stepped frame by frame too.

  py -3.11 tools/rec/record.py OUT_DIR "https://site/|8|2400" "https://site/about/|3|0"

Writes OUT_DIR/00000.jpg ...; encode with ffmpeg, e.g.
  ffmpeg -framerate 60 -i OUT_DIR/%05d.jpg -vf scale=1440:-2:flags=lanczos -c:v libx264
         -preset veryslow -crf 26 -pix_fmt yuv420p -movflags +faststart name_opt.mp4
Needs: Chrome, py -3.11 with websocket-client.
"""
import base64, json, math, os, shutil, subprocess, sys, tempfile, time, urllib.request
import websocket

CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
W, H, FPS, PORT = 1920, 1080, 60, 9650
HERE = os.path.dirname(os.path.abspath(__file__))
CLOCK = open(os.path.join(HERE, 'clock.js'), encoding='utf8').read()


class CDP:
    def __init__(self, ws_url):
        self.ws = websocket.create_connection(ws_url, max_size=None, timeout=120)
        self.n = 0

    def call(self, method, **params):
        self.n += 1
        self.ws.send(json.dumps({'id': self.n, 'method': method, 'params': params}))
        while True:
            m = json.loads(self.ws.recv())
            if m.get('id') == self.n:
                if 'error' in m: raise RuntimeError(f"{method}: {m['error']}")
                return m.get('result', {})

    def js(self, expr, wait=False):
        r = self.call('Runtime.evaluate', expression=expr, awaitPromise=wait, returnByValue=True)
        return r.get('result', {}).get('value')


def launch():
    prof = tempfile.mkdtemp(prefix='rec_chrome_')
    proc = subprocess.Popen([CHROME, '--headless=new', f'--remote-debugging-port={PORT}', f'--user-data-dir={prof}',
                             f'--window-size={W},{H}', '--hide-scrollbars', '--mute-audio', '--autoplay-policy=no-user-gesture-required',
                             '--enable-gpu', '--ignore-gpu-blocklist', '--no-first-run', '--no-default-browser-check', 'about:blank'],
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(100):
        try:
            tabs = json.load(urllib.request.urlopen(f'http://127.0.0.1:{PORT}/json'))
            page = next(t for t in tabs if t['type'] == 'page')
            return proc, prof, CDP(page['webSocketDebuggerUrl'])
        except Exception:
            time.sleep(0.2)
    raise SystemExit('Chrome did not start')


def main():
    out, segs = sys.argv[1], [s.split('|') for s in sys.argv[2:]]
    os.makedirs(out, exist_ok=True)
    for f in os.listdir(out):
        if f.endswith('.jpg'): os.remove(os.path.join(out, f))
    proc, prof, c = launch()
    idx = 0
    try:
        c.call('Emulation.setDeviceMetricsOverride', width=W, height=H, deviceScaleFactor=1, mobile=False)
        c.call('Page.enable')
        c.call('Page.addScriptToEvaluateOnNewDocument', source=CLOCK)
        for seg in segs:
            url, secs, dist = seg[0], float(seg[1]), float(seg[2])
            mouse = len(seg) > 3 and seg[3] == 'mouse'
            c.call('Page.navigate', url=url); time.sleep(4)
            # load lazy content along the path, then return to the top
            for y in range(0, int(dist) + 1200, 500):
                c.js(f'scrollTo(0,{y})'); time.sleep(0.4)
            c.js('scrollTo(0,0)'); time.sleep(1.5)
            c.js('__freeze()')
            n, hold = int(secs * FPS), int(0.5 * FPS)
            for i in range(n):
                p = min(max((i - hold) / max(n - 2 * hold, 1), 0), 1)
                ease = 0.5 - 0.5 * math.cos(math.pi * p)
                if mouse:
                    t = i / FPS
                    c.call('Input.dispatchMouseEvent', type='mouseMoved',
                           x=round(W * (0.5 + 0.3 * math.sin(2 * math.pi * t / secs)), 1),
                           y=round(H * (0.5 + 0.22 * math.sin(4 * math.pi * t / secs)), 1))
                c.js(f'__step({1000 / FPS}); scrollTo(0,{dist * ease:.2f})')
                c.js(f'__stepVideos({1000 / FPS})', wait=True)
                shot = c.call('Page.captureScreenshot', format='jpeg', quality=95)
                open(os.path.join(out, f'{idx:05d}.jpg'), 'wb').write(base64.b64decode(shot['data'])); idx += 1
            print('recorded', url, n, 'frames', flush=True)
    finally:
        proc.kill()
        shutil.rmtree(prof, ignore_errors=True)


if __name__ == '__main__':
    main()
