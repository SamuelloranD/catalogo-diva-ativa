import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const port = process.env.CDP_PORT ?? "9225";
const catalogUrl = process.env.CATALOG_URL ?? "http://127.0.0.1:8082/";
const pages = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json());
const page = pages.find((entry) => entry.type === "page" && entry.url.startsWith(catalogUrl));
if (!page) throw new Error("Catalog page is not open in Chrome");

const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});
let nextId = 1;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const result = JSON.parse(event.data);
  if (!result.id || !pending.has(result.id)) return;
  const { resolve, reject } = pending.get(result.id);
  pending.delete(result.id);
  result.error ? reject(new Error(result.error.message)) : resolve(result.result);
});
function send(method, params = {}) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}
async function clickButton(label) {
  const clicked = await evaluate(
    `(() => { const button = [...document.querySelectorAll('button')].find(node => node.getAttribute('aria-label') === ${JSON.stringify(label)} || node.textContent.trim() === ${JSON.stringify(label)}); button?.click(); return Boolean(button); })()`,
  );
  if (!clicked) throw new Error(`Button not found: ${label}`);
  await new Promise((resolve) => setTimeout(resolve, 650));
}
async function shot(name) {
  const data = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  await writeFile(path.join("artifacts", name), Buffer.from(data.data, "base64"));
}
await mkdir("artifacts", { recursive: true });
await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 1000,
  deviceScaleFactor: 1,
  mobile: false,
});
await send("Page.reload", { ignoreCache: true });
for (let attempt = 0; attempt < 30; attempt++) {
  const ready = await evaluate(
    "Boolean(document.querySelector('[data-testid=catalog]')) && !document.querySelector('[data-testid=catalog]').textContent.includes('Carregando catálogo...')",
  );
  if (ready) break;
  await new Promise((resolve) => setTimeout(resolve, 350));
}
await shot("catalog-desktop.png");
await clickButton("Ver Macaquito Ellie");
await clickButton("M");
await shot("product-desktop.png");
await clickButton("Adicionar à sacola");
await clickButton("Ver Conjunto Perla");
await clickButton("P");
await clickButton("Adicionar à sacola");
await clickButton("Abrir sacola, 2 itens");
await new Promise((resolve) => setTimeout(resolve, 3000));
await shot("bag-desktop.png");
await clickButton("Close");
await send("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  deviceScaleFactor: 1,
  mobile: true,
});
await new Promise((resolve) => setTimeout(resolve, 300));
await shot("catalog-mobile.png");
await clickButton("Ver Macaquito Ellie");
await clickButton("M");
await shot("product-mobile.png");
await clickButton("Fechar produto");
await clickButton("Abrir sacola, 2 itens");
await shot("bag-mobile.png");
socket.close();
