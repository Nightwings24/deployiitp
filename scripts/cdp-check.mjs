// Dev-only: navigate a CDP-controlled browser to a URL, wait, then report
// rendered text + console errors + a screenshot. Used to verify the Keystatic SPA.
// Usage: node scripts/cdp-check.mjs <url> <outPng> [waitMs]
import { writeFile } from 'node:fs/promises';

const [, , url, outPng, waitArg] = process.argv;
const waitMs = Number(waitArg) || 6000;

const targets = await (await fetch('http://localhost:9222/json')).json();
const page = targets.find((t) => t.type === 'page');
if (!page) {
  console.error('No CDP page target on :9222');
  process.exit(1);
}

const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
const errors = [];
const call = (method, params = {}) =>
  new Promise((resolve) => {
    const myId = ++id;
    pending.set(myId, resolve);
    ws.send(JSON.stringify({ id: myId, method, params }));
  });

await new Promise((r) => (ws.onopen = r));
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg.result);
    pending.delete(msg.id);
  } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
    errors.push(msg.params.args.map((a) => a.value ?? a.description ?? '').join(' '));
  } else if (msg.method === 'Runtime.exceptionThrown') {
    errors.push('EXCEPTION: ' + (msg.params.exceptionDetails?.exception?.description ?? 'unknown'));
  }
};

await call('Page.enable');
await call('Runtime.enable');
await call('Page.navigate', { url });
await new Promise((r) => setTimeout(r, waitMs));

const text = await call('Runtime.evaluate', {
  expression: 'document.body.innerText.replace(/\\s+/g, " ").trim().slice(0, 400)',
  returnByValue: true,
});
console.log('--- rendered text (first 400 chars) ---');
console.log(text.result.value || '(empty)');
console.log('\n--- console errors:', errors.length, '---');
errors.slice(0, 8).forEach((e) => console.log('  ✗', e.slice(0, 160)));

if (outPng) {
  const shot = await call('Page.captureScreenshot', { format: 'png' });
  await writeFile(outPng, Buffer.from(shot.data, 'base64'));
  console.log('\nscreenshot →', outPng);
}
ws.close();
