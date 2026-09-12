import { chromium } from 'playwright';
import http from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(process.cwd());
const snapshotPath = path.resolve(process.env.AXM_GRAMMAR_GLASS_SNAPSHOT || '/tmp/grammar-glass-snapshot.json');
const artifactDir = path.resolve(process.env.AXM_EXPERIENCE_ARTIFACT_DIR || 'artifacts/construction-hand-experience');
const mime = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8']
]);

function safePath(urlPath) {
  const decoded = decodeURIComponent((urlPath || '/').split('?')[0]);
  const relative = decoded === '/' ? 'tools/grammar-glass/index.html' : decoded.replace(/^\/+/, '');
  const target = path.resolve(root, relative);
  if (target !== root && !target.startsWith(root + path.sep)) throw new Error('path_escape');
  return target;
}

const server = http.createServer(async (req, res) => {
  try {
    const target = safePath(req.url);
    const bytes = await readFile(target);
    res.writeHead(200, { 'content-type': mime.get(path.extname(target)) || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(bytes);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('not found');
  }
});

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const baseUrl = `http://127.0.0.1:${address.port}/tools/grammar-glass/index.html`;
await mkdir(artifactDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const pageErrors = [];
const consoleErrors = [];
const failedRequests = [];
let page;
try {
  page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  page.on('pageerror', error => pageErrors.push(String(error)));
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('requestfailed', request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText || 'request_failed' }));

  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await page.locator('#file').setInputFiles(snapshotPath);
  await page.waitForSelector('#workspace:not([hidden])', { timeout: 30000 });
  await page.waitForFunction(() => window.__GRAMMAR_GLASS_CONSTRUCTION_HAND_STATE__?.loaded === true);
  await page.locator('#constructionFlow').scrollIntoViewIfNeeded();

  const initial = await page.locator('#constructionNextLabel').textContent();
  if (initial?.trim() !== 'ROLL + PREPARE ABOVE') throw new Error(`unexpected_initial_guidance:${initial}`);

  await page.locator('#playgroundRoll').click();
  await page.waitForFunction(() => window.__GRAMMAR_GLASS_CONSTRUCTION_HAND_STATE__?.experiencePhase === 'READY_TO_PREPARE');
  if (await page.locator('#constructionNextLabel').textContent() !== 'PREPARE ABOVE') throw new Error('prepare_guidance_missing');

  await page.locator('#kilnPrepare').click();
  await page.waitForFunction(() => window.__GRAMMAR_GLASS_CONSTRUCTION_HAND_STATE__?.experiencePhase === 'READY_TO_BUILD');
  if (await page.locator('#constructionBuild').isDisabled()) throw new Error('build_not_enabled_when_guidance_ready');
  if (await page.locator('#constructionBuild').getAttribute('aria-current') !== 'step') throw new Error('build_not_marked_as_current_step');

  await page.locator('#constructionBuild').click();
  await page.waitForFunction(() => window.__GRAMMAR_GLASS_CONSTRUCTION_HAND_STATE__?.experiencePhase === 'READY_TO_ARM');
  if (await page.locator('#constructionArm').isDisabled()) throw new Error('arm_not_enabled_after_build');
  if ((await page.locator('#constructionSourcePreview').textContent() || '').includes('No source built')) throw new Error('source_preview_not_exposed_after_verified_build');

  await page.locator('#constructionArm').click();
  await page.waitForFunction(() => window.__GRAMMAR_GLASS_CONSTRUCTION_HAND_STATE__?.experiencePhase === 'READY_TO_RUN');
  if (await page.locator('#constructionRun').isDisabled()) throw new Error('run_not_enabled_after_arm');
  if (await page.locator('#constructionRun').getAttribute('aria-current') !== 'step') throw new Error('run_not_marked_as_current_step');

  await page.locator('#constructionFlow').scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(artifactDir, 'construction-hand-ready-desktop.png'), fullPage: false });

  await page.locator('#constructionRun').click();
  await page.waitForFunction(() => window.__GRAMMAR_GLASS_CONSTRUCTION_HAND_STATE__?.experiencePhase === 'RECEIPT_SEALED', null, { timeout: 15000 });
  const terminal = await page.evaluate(() => ({ ...window.__GRAMMAR_GLASS_CONSTRUCTION_HAND_STATE__ }));
  if (!['PASS_OBSERVED','FAIL_OBSERVED','CRASH_OBSERVED','TIMEOUT_OBSERVED'].includes(terminal.executorState) && !terminal.lastReceiptSha256) throw new Error(`terminal_receipt_missing:${JSON.stringify(terminal)}`);
  if (terminal.nextAction !== 'RELEASE SOURCE') throw new Error(`release_guidance_missing:${terminal.nextAction}`);
  if (await page.locator('#constructionRelease').getAttribute('aria-current') !== 'step') throw new Error('release_not_marked_as_current_step');
  const terminalDetail = await page.locator('#constructionNextDetail').textContent();
  if (!terminalDetail?.includes('evidence only')) throw new Error('terminal_truth_ceiling_missing');

  await page.locator('#constructionFlow').scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(artifactDir, 'construction-hand-receipt-desktop.png'), fullPage: false });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#constructionFlow').scrollIntoViewIfNeeded();
  await page.waitForTimeout(100);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 1) throw new Error(`mobile_horizontal_overflow:${overflow}`);
  const railVisible = await page.locator('#constructionStepRail').isVisible();
  if (!railVisible) throw new Error('mobile_step_rail_not_visible');
  await page.screenshot({ path: path.join(artifactDir, 'construction-hand-receipt-mobile.png'), fullPage: false });

  if (pageErrors.length) throw new Error(`page_errors:${JSON.stringify(pageErrors)}`);
  const relevantConsoleErrors = consoleErrors.filter(message => !/favicon/i.test(message));
  if (relevantConsoleErrors.length) throw new Error(`console_errors:${JSON.stringify(relevantConsoleErrors)}`);
  const criticalFailures = failedRequests.filter(item => !/favicon\.ico/i.test(item.url));
  if (criticalFailures.length) throw new Error(`request_failures:${JSON.stringify(criticalFailures)}`);

  const receipt = {
    result: 'GRAMMAR_GLASS_CONSTRUCTION_HAND_EXPERIENCE_BROWSER_PASS',
    url: baseUrl,
    viewportDesktop: [1440, 1000],
    viewportMobile: [390, 844],
    terminalState: terminal.executorState,
    terminalReceiptSha256: terminal.lastReceiptSha256,
    nextAction: terminal.nextAction,
    pageErrors: pageErrors.length,
    consoleErrors: relevantConsoleErrors.length,
    requestFailures: criticalFailures.length,
    mobileHorizontalOverflowPx: overflow,
    truth: {
      exercisedActualGrammarGlassSurface: true,
      generatedSnapshotLoadedThroughFileInput: true,
      explicitRollPrepareBuildArmRunSequenceExercised: true,
      experienceLayerChangedCanonicalState: false,
      passIsNotQualityCorrectnessPromotionOrCanon: true
    }
  };
  await writeFile(path.join(artifactDir, 'receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
  process.stdout.write(JSON.stringify(receipt, null, 2) + '\n');
} finally {
  await page?.close().catch(() => {});
  await browser.close().catch(() => {});
  await new Promise(resolve => server.close(resolve));
}
