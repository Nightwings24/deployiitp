// Dev-only QA helper: connects to a running Edge/Chrome (--remote-debugging-port=9222)
// and reports horizontal overflow + any elements wider than the viewport, per URL.
// Usage: node scripts/measure.mjs <width> <url1> <url2> ...
const [, , widthArg, ...urls] = process.argv;
const width = Number(widthArg) || 390;

async function targetList() {
  const res = await fetch('http://localhost:9222/json');
  return res.json();
}

function send(ws, id, method, params = {}) {
  ws.send(JSON.stringify({ id, method, params }));
}

async function evalOn(wsUrl, url) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();
  const call = (method, params) =>
    new Promise((resolve) => {
      const myId = ++id;
      pending.set(myId, resolve);
      send(ws, myId, method, params);
    });

  await new Promise((r) => (ws.onopen = r));
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg.result);
      pending.delete(msg.id);
    }
  };

  await call('Page.enable');
  await call('Runtime.enable');
  await call('Emulation.setDeviceMetricsOverride', {
    width,
    height: 900,
    deviceScaleFactor: 1,
    mobile: width < 700,
  });
  await call('Page.navigate', { url });
  await new Promise((r) => setTimeout(r, 1200));

  const expr = `(() => {
    const docW = document.documentElement.scrollWidth;
    const vw = window.innerWidth;
    const offenders = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1 || r.left < -1) {
        offenders.push(el.tagName.toLowerCase() + (el.className && typeof el.className==='string' ? '.' + el.className.trim().split(/\\s+/).join('.') : '') + ' [' + Math.round(r.left) + '→' + Math.round(r.right) + ']');
      }
    }
    return JSON.stringify({ docW, vw, overflow: docW > vw, offenders: [...new Set(offenders)].slice(0, 12) });
  })()`;
  const result = await call('Runtime.evaluate', { expression: expr, returnByValue: true });
  ws.close();
  return JSON.parse(result.result.value);
}

const targets = await targetList();
const page = targets.find((t) => t.type === 'page');
if (!page) {
  console.error('No page target. Start Edge with --remote-debugging-port=9222');
  process.exit(1);
}

for (const url of urls) {
  const out = await evalOn(page.webSocketDebuggerUrl, url);
  console.log(`\n${url}  @${width}px  docW=${out.docW} vw=${out.vw}  overflow=${out.overflow ? 'YES' : 'no'}`);
  if (out.offenders.length) out.offenders.forEach((o) => console.log('   ⤷ ' + o));
}
