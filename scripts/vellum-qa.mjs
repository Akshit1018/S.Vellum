import { chromium } from "playwright";

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const logs = [];
page.on("console", (m) => logs.push(`${m.type()}: ${m.text()}`));
page.on("pageerror", (e) => logs.push(`pageerror: ${e.message}`));

await page.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle" });

const engine = page.getByText(/Engine ready|Engine error|Waking engine/);
await engine.waitFor({ timeout: 25000 });
await page.waitForTimeout(800);
const engineText = await engine.textContent();

const input = page.locator("#vellum-pdf");
const disabled = await input.getAttribute("disabled");
const box = await input.boundingBox();

await page.screenshot({ path: "/workspace/screenshots/vellum-mobile-ready.png", fullPage: true });

await page.getByRole("button", { name: "Try a sample" }).click();
await page.waitForTimeout(2000);
const body = await page.locator("body").innerText();
await page.screenshot({ path: "/workspace/screenshots/vellum-sample.png", fullPage: true });

const desk = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await desk.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle" });
await desk.getByText("Engine ready").waitFor({ timeout: 25000 }).catch(() => {});
await desk.getByRole("button", { name: "Try a sample" }).click();
await desk.waitForTimeout(2000);
await desk.screenshot({ path: "/workspace/screenshots/vellum-desktop-sample.png", fullPage: true });
const deskBody = await desk.locator("body").innerText();

console.log(JSON.stringify({
  engineText,
  inputDisabled: disabled,
  inputBox: box,
  mobileHasHello: /Hello Vellum|Native text|sample\.pdf/i.test(body),
  mobileSnippet: body.slice(0, 900),
  desktopHasHello: /Hello Vellum|Native text|sample\.pdf/i.test(deskBody),
  logs,
}, null, 2));

await browser.close();
