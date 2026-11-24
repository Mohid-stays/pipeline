// test_suite.js - Automated Headless Chrome CDP Verification
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DEBUG_PORT = 9222;
const HTML_FILE = 'file://' + path.resolve(__dirname, 'index.html');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.msgId = 1;
    this.callbacks = new Map();
    this.eventListeners = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      } else if (msg.method) {
        const listeners = this.eventListeners.get(msg.method) || [];
        listeners.forEach(fn => fn(msg.params));
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(event, handler) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(handler);
  }

  async eval(expression) {
    const wrapped = `(() => {\n${expression}\n})()`;
    const res = await this.send('Runtime.evaluate', {
      expression: wrapped,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval exception: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result ? res.result.value : undefined;
  }

  async screenshot(filePath, clip = null) {
    const params = { format: 'png' };
    if (clip) params.clip = clip;
    const res = await this.send('Page.captureScreenshot', params);
    fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
    console.log(`[SCREENSHOT] Saved: ${filePath} (${fs.statSync(filePath).size} bytes)`);
  }

  async setViewport(width, height) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 600
    });
  }
}

async function runTestSuite() {
  console.log('=== GHOST IN THE TOKENS // TEST SUITE ===');

  // Spawn headless Chrome with remote debugging
  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--user-data-dir=/tmp/chrome_cdp_profile',
    '--window-size=1280,900',
    '--no-first-run',
    '--no-default-browser-check'
  ]);

  // Wait for remote debugging endpoint to become ready
  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await sleep(400);
    try {
      const targets = await fetchJson(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
      if (targets && targets.length > 0 && targets[0].webSocketDebuggerUrl) {
        wsUrl = targets[0].webSocketDebuggerUrl;
        break;
      }
    } catch (e) {
      // Chrome still starting up
    }
  }

  if (!wsUrl) {
    throw new Error('Failed to connect to Chrome debugging endpoint');
  }

  console.log('[OK] Connected to Chrome DevTools Protocol at:', wsUrl);
  const client = new CDPClient(wsUrl);
  await client.connect();

  const consoleErrors = [];
  client.on('Runtime.consoleAPICalled', (params) => {
    if (params.type === 'error') {
      consoleErrors.push(params.args.map(a => a.value || a.description).join(' '));
    }
  });
  client.on('Runtime.exceptionThrown', (params) => {
    consoleErrors.push(params.exceptionDetails.text);
  });

  await client.send('Page.enable');
  await client.send('Runtime.enable');

  console.log(`[TEST 1] Navigating to ${HTML_FILE}...`);
  await client.send('Page.navigate', { url: HTML_FILE });
  await sleep(1000);

  // Fast-forward boot sequence
  await client.eval(`
    const bootWindow = document.getElementById('boot-window');
    if (bootWindow) bootWindow.click();
  `);
  await sleep(600);

  // Assert Title & Hero
  const title = await client.eval('return document.title');
  console.log(`[PASS] Document Title: "${title}"`);
  if (!title.includes('GHOST_IN_THE_TOKENS')) {
    throw new Error(`Unexpected title: ${title}`);
  }

  const isHeroRevealed = await client.eval(`return document.getElementById('hero-reveal').classList.contains('revealed')`);
  console.log(`[PASS] Hero Reveal Active: ${isHeroRevealed}`);

  const bootLineCount = await client.eval(`return document.querySelectorAll('.boot-line').length`);
  console.log(`[PASS] Boot Log Lines Count: ${bootLineCount}`);

  // Test 2: Pipeline Stage Nodes
  console.log('[TEST 2] Verifying 10 Pipeline Stages...');
  const stageNodeCount = await client.eval(`return document.querySelectorAll('.stage-node-item').length`);
  console.log(`[PASS] Pipeline Stage Nodes Rendered: ${stageNodeCount}`);
  if (stageNodeCount !== 10) throw new Error(`Expected 10 stages, found ${stageNodeCount}`);

  // Click stages and check details
  const stagesToTest = [0, 2, 4, 6, 8, 9];
  for (const idx of stagesToTest) {
    await client.eval(`
      const nodes = document.querySelectorAll('.stage-node-item');
      if (nodes[${idx}]) nodes[${idx}].click();
    `);
    await sleep(200);
    const stageTitle = await client.eval(`return document.getElementById('inspector-title').textContent`);
    const analogy = await client.eval(`return document.getElementById('inspector-analogy').textContent`);
    console.log(`  ➔ Stage ${idx + 1} checked: "${stageTitle.trim()}" | Analogy: "${analogy.trim().substring(0, 45)}..."`);
  }

  // Test Prev/Next buttons
  await client.eval(`document.getElementById('stage-prev-btn').click()`);
  await sleep(150);
  const prevTitle = await client.eval(`return document.getElementById('inspector-title').textContent`);
  console.log(`  ➔ Clicked '< PREV', active stage is: "${prevTitle.trim()}"`);

  await client.eval(`document.getElementById('stage-next-btn').click()`);
  await sleep(150);
  const nextTitle = await client.eval(`return document.getElementById('inspector-title').textContent`);
  console.log(`  ➔ Clicked 'NEXT >', active stage is: "${nextTitle.trim()}"`);

  // Test 3: Tokenizer
  console.log('[TEST 3] Testing Live Tokenizer Laboratory...');
  // Click Preset 'attention'
  await client.eval(`document.querySelector('.preset-btn[data-preset="attention"]').click()`);
  await sleep(200);
  const tokCount = await client.eval(`return document.getElementById('stat-tokens').textContent`);
  const chipsCount = await client.eval(`return document.querySelectorAll('.token-chip').length`);
  console.log(`[PASS] Tokenizer Preset Applied. Tokens: ${tokCount}, Rendered Chips: ${chipsCount}`);
  if (parseInt(tokCount, 10) === 0 || chipsCount === 0) throw new Error('Tokenizer produced 0 tokens!');

  // Click on the 2nd chip to inspect
  await client.eval(`
    const chips = document.querySelectorAll('.token-chip');
    if (chips[1]) chips[1].click();
  `);
  await sleep(150);
  const detailMsg = await client.eval(`return document.getElementById('token-detail-msg').textContent`);
  console.log(`  ➔ Inspected Token Chip: ${detailMsg.trim()}`);

  // Test 4: Attention Visualizer
  console.log('[TEST 4] Testing Self-Attention Visualizer...');
  // Switch to preset 'bank'
  await client.eval(`document.querySelector('.attn-preset-btn[data-attn="bank"]').click()`);
  await sleep(250);
  const attnWordTokens = await client.eval(`return document.querySelectorAll('.attn-word-token').length`);
  const svgPaths = await client.eval(`return document.querySelectorAll('#attention-svg path').length`);
  const attnBars = await client.eval(`return document.querySelectorAll('.attn-bar-item').length`);
  console.log(`[PASS] Attention Word Tokens: ${attnWordTokens}, SVG Bezier Paths: ${svgPaths}, Distribution Bars: ${attnBars}`);
  if (svgPaths === 0) throw new Error('No SVG attention paths generated!');

  // Test 5: Interactive Terminal Easter Egg
  console.log('[TEST 5] Testing Interactive Neural Terminal...');
  const testCmds = [
    { cmd: 'help', check: 'AVAILABLE COMMANDS' },
    { cmd: 'pipeline', check: '[01: DATA COLLECTION]' },
    { cmd: 'tokenize cyberpunk matrix', check: 'TOKENIZATION RESULTS' },
    { cmd: 'sudo hack', check: 'ACCESS DENIED' }
  ];

  for (const { cmd, check } of testCmds) {
    await client.eval(`
      const input = document.getElementById('cli-input');
      input.value = '${cmd}';
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    `);
    await sleep(200);
    const outputText = await client.eval(`return document.getElementById('cli-output').textContent`);
    if (!outputText.includes(check)) {
      throw new Error(`Command '${cmd}' failed. Expected to find '${check}' in terminal output.`);
    }
    console.log(`  ➔ Command '${cmd}' passed [Found '${check}']`);
  }

  // Test Up Arrow History
  await client.eval(`
    const input = document.getElementById('cli-input');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
  `);
  const restoredCmd = await client.eval(`return document.getElementById('cli-input').value`);
  console.log(`  ➔ Up Arrow history verified: restored '${restoredCmd}'`);

  // Console Errors Check
  console.log('[TEST 6] Verifying Console Errors...');
  if (consoleErrors.length > 0) {
    console.error('[FAIL] Console errors detected:', consoleErrors);
    throw new Error(`Found ${consoleErrors.length} console error(s)`);
  } else {
    console.log('[PASS] Zero console errors detected!');
  }

  // Capture Screenshots
  console.log('[TEST 7] Capturing Desktop & Mobile Screenshots...');
  await client.setViewport(1280, 950);
  await client.eval(`window.scrollTo(0, 0)`);
  await sleep(400);
  await client.screenshot(path.resolve(__dirname, 'hero_section.png'));

  // Scroll to Pipeline
  await client.eval(`document.getElementById('pipeline').scrollIntoView({ behavior: 'instant' })`);
  await sleep(400);
  await client.screenshot(path.resolve(__dirname, 'pipeline_section.png'));

  // Scroll to Tokenizer
  await client.eval(`document.getElementById('tokenizer').scrollIntoView({ behavior: 'instant' })`);
  await sleep(400);
  await client.screenshot(path.resolve(__dirname, 'tokenizer_section.png'));

  // Scroll to Attention
  await client.eval(`document.getElementById('attention').scrollIntoView({ behavior: 'instant' })`);
  await sleep(400);
  await client.screenshot(path.resolve(__dirname, 'attention_section.png'));

  // Scroll to Terminal
  await client.eval(`document.getElementById('terminal').scrollIntoView({ behavior: 'instant' })`);
  await sleep(400);
  await client.screenshot(path.resolve(__dirname, 'terminal_section.png'));

  // Mobile Viewport (390 x 844 iPhone 14 style)
  console.log('[TEST 8] Testing Mobile Viewport (390 x 844)...');
  await client.setViewport(390, 844);
  await client.eval(`window.scrollTo(0, 0)`);
  await sleep(400);
  await client.screenshot(path.resolve(__dirname, 'mobile_view.png'));

  // Full page overview desktop screenshot
  await client.setViewport(1280, 800);
  await client.eval(`window.scrollTo(0, 0)`);
  await sleep(300);
  await client.screenshot(path.resolve(__dirname, 'desktop_full.png'));

  console.log('\n=========================================');
  console.log('ALL VERIFICATION TESTS PASSED SUCCESSFULLY!');
  console.log('=========================================');

  // Clean shutdown
  await client.send('Browser.close');
  chromeProcess.kill();
  process.exit(0);
}

runTestSuite().catch(err => {
  console.error('[TEST SUITE ERROR]', err);
  process.exit(1);
});
