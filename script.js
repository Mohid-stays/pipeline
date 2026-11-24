/**
 * GHOST IN THE TOKENS // LLM Pipeline Interactive Engine
 * Plain Vanilla ES6+ JavaScript - Zero External Dependencies
 */

(function () {
  'use strict';

  // =========================================================================
  // 01. GLOBAL CONFIG & DATA
  // =========================================================================

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // The 10 Pipeline Stages Data
  const PIPELINE_STAGES = [
    {
      id: 1,
      num: '01',
      title: 'DATA COLLECTION',
      shortTitle: 'Data Crawl',
      analogy: 'Scraping the collective digital consciousness of humanity into a raw, unfiltered 15-terabyte sinkhole.',
      description: 'Massive-scale distributed web harvesting capturing human knowledge from Common Crawl, Wikipedia, GitHub repositories, academic archives (arXiv, PubMed), and public literature. Balances general conversation, algorithmic code, mathematical reasoning, and domain monographs.',
      tools: [
        'WARC Web Archive Crawlers & Trafilatura',
        'Common Crawl (Petabyte-scale distributed scrapes)',
        'Ray & Apache Spark distributed ingestion pipelines',
        'GitHub public repo parsers & Tree-sitter AST extraction'
      ],
      metrics: [
        { label: 'RAW VOLUME', val: '15+ Trillion Tokens' },
        { label: 'SCRAPE REPOSITORY', val: '45+ Terabytes' },
        { label: 'CODE / REPOS', val: '~18% Total Volume' },
        { label: 'MULTILINGUAL', val: '25+ Global Languages' }
      ]
    },
    {
      id: 2,
      num: '02',
      title: 'CLEANING & DEDUP',
      shortTitle: 'Clean & Dedup',
      analogy: 'Boiling dirty raw sewage into high-grade crystal-pure rocket fuel.',
      description: 'Heuristic filtering to eliminate spam, machine-generated SEO garbage, repetitive crawl artifacts, and toxic content. Locality-Sensitive Hashing (MinHash LSH) removes duplicated documents at scale. Automated regex and NER scrub Personally Identifiable Information (PII) like SSNs, emails, and credentials.',
      tools: [
        'MinHash & SimHash Locality-Sensitive Deduplication',
        'fastText Language Identification & Quality Classifiers',
        'Microsoft Presidio & HuggingFace PII Masking',
        'Gopher heuristic filters (line length, symbol-to-word ratio)'
      ],
      metrics: [
        { label: 'DATA PRUNED', val: '~62% Discarded' },
        { label: 'PII SCRUB RATE', val: '99.8% Scrubbed' },
        { label: 'DEDUP RATIO', val: '3.4:1 Reduction' },
        { label: 'CURATED QUALITY', val: 'Pristine Web Corpus' }
      ]
    },
    {
      id: 3,
      num: '03',
      title: 'TOKENIZATION',
      shortTitle: 'Tokenization',
      analogy: 'Chopping human prose into serialized hacker byte-chunks the silicon math engine can ingest.',
      description: 'Deconstructing unicode string streams into discrete subword integer tokens using Byte-Pair Encoding (BPE) or SentencePiece. Compresses frequent n-grams while preserving universal fallback for rare out-of-vocabulary terms through byte-level fallbacks.',
      tools: [
        'tiktoken (Rust-accelerated BPE algorithm)',
        'Google SentencePiece (Unigram / BPE)',
        'HuggingFace Tokenizers (Byte-Level BPE)',
        'Unicode NFC normalization & Whitespace symbolizers'
      ],
      metrics: [
        { label: 'VOCABULARY SIZE', val: '32,000 - 128,000 Tokens' },
        { label: 'AVG SUBWORD LEN', val: '3.8 Characters / Tok' },
        { label: 'COMPRESSION', val: '~74% vs Raw ASCII' },
        { label: 'ENCODING SPEED', val: '>1,000,000 Tokens/sec' }
      ]
    },
    {
      id: 4,
      num: '04',
      title: 'EMBEDDINGS & ROPE',
      shortTitle: 'Embeddings',
      analogy: 'Translating words into coordinates on an infinite geometric hypersphere where synonyms gravitate together.',
      description: 'Mapping integer token IDs into dense continuous vector space (e.g. 4096 to 8192 dimensions). Rotary Position Embeddings (RoPE) multiply token vectors with complex rotation matrices, encoding relative token distance without fixed positional limits.',
      tools: [
        'Rotary Position Embedding (RoPE) & ALiBi',
        'PyTorch nn.Embedding lookup matrix (Vocab × Dim)',
        'RMSNorm / LayerNorm vector stabilization',
        'Dynamic context window expansion (YaRN, LongLoRA)'
      ],
      metrics: [
        { label: 'HIDDEN DIM (d_model)', val: '4096 / 8192 Dimensions' },
        { label: 'CONTEXT HORIZON', val: '128K - 1M Tokens' },
        { label: 'PRECISION', val: 'FP16 / BF16 Tensors' },
        { label: 'ROTATION FORMULA', val: 'R_θ,m^d x_m' }
      ]
    },
    {
      id: 5,
      num: '05',
      title: 'PRETRAINING (TRANSFORMER)',
      shortTitle: 'Pretraining',
      analogy: 'Forging the raw omniscient mind in the blazing fire of 10,000 GPUs running for months.',
      description: 'Unsupervised autoregressive next-token prediction across trillions of tokens. Multi-head self-attention computes query-key resonances, letting every token attend to every prior token. Scaled across thousands of GPUs using 3D parallelism (Tensor, Pipeline, and Data Parallelism).',
      tools: [
        'FlashAttention-2 / FlashAttention-3 (SRAM tiling)',
        'Megatron-LM & DeepSpeed ZeRO-3 Engine',
        'NVIDIA NeMo Framework & PyTorch FSDP',
        'AdamW Optimizer (Cosine decay with warmup)'
      ],
      metrics: [
        { label: 'CLUSTER HARDWARE', val: '16,384x NVIDIA H100s' },
        { label: 'TRAINING FLOPS', val: '3.8 × 10²⁵ FLOPs' },
        { label: 'TRAINING DURATION', val: '~90 Days Continuous' },
        { label: 'FINAL LOSS', val: '1.12 nats / token' }
      ]
    },
    {
      id: 6,
      num: '06',
      title: 'SUPERVISED FINE-TUNING',
      shortTitle: 'SFT',
      analogy: 'Giving the wild, hallucinating alien mind etiquette classes and a customer service badge.',
      description: 'Transforming a raw text-continuation engine into a coherent conversational agent. Fine-tuning the base weights on tens of thousands of expertly authored (Instruction, Response) dialogue pairs. Teaches the model to format answers, write structured code, admit uncertainty, and follow multi-step constraints.',
      tools: [
        'Axolotl & LLaMA-Factory fine-tuning stacks',
        'LoRA & QLoRA Parameter-Efficient Adapters',
        'Unsloth accelerated backprop kernels',
        'ShareGPT / UltraChat curated conversational datasets'
      ],
      metrics: [
        { label: 'DATASET SIZE', val: '100K - 500K Curated Turns' },
        { label: 'FINE-TUNE DURATION', val: '12 - 48 Hours' },
        { label: 'TRAINABLE WEIGHTS', val: '100% or 0.15% (LoRA)' },
        { label: 'LEARNING RATE', val: '2e-5 with Cosine Decay' }
      ]
    },
    {
      id: 7,
      num: '07',
      title: 'ALIGNMENT (RLHF / DPO)',
      shortTitle: 'Alignment',
      analogy: 'Conditioning the beast with digital carrot-and-stick dopamine loops so it doesn\'t give you malware recipes.',
      description: 'Reinforcement Learning from Human Feedback (RLHF) and Direct Preference Optimization (DPO). The model is conditioned using pairwise rankings (Chosen vs Rejected responses). A mathematical reward signal reinforces helpful, harmless, and honest behavior while penalizing hallucinations and dangerous outputs.',
      tools: [
        'Direct Preference Optimization (DPO)',
        'PPO (Proximal Policy Optimization)',
        'KTO (Kahneman-Tversky Optimization)',
        'Constitutional AI (Anthropic self-critique model)'
      ],
      metrics: [
        { label: 'PREFERENCE PAIRS', val: '250,000 Comparisons' },
        { label: 'SAFETY COMPLIANCE', val: '>99.9% Refusal of Malicious' },
        { label: 'HALLUCINATION DROP', val: '-42% Reduced Falsehoods' },
        { label: 'POLICY REWARD', val: 'Implicit Loss Minimization' }
      ]
    },
    {
      id: 8,
      num: '08',
      title: 'EVALUATION & RED-TEAMING',
      shortTitle: 'Red-Teaming',
      analogy: 'Sending rogue hackers to punch, trick, and poison the model until its armor is impenetrable.',
      description: 'Rigorous benchmark auditing across reasoning, math, code generation, and safety. Dedicated red teams deploy adversarial prompts, base64 obfuscations, roleplay exploits, and prefix injection attacks to stress-test the safety boundaries before public deployment.',
      tools: [
        'lm-evaluation-harness (EleutherAI)',
        'Microsoft PyRIT (Python Risk Identification Toolkit)',
        'MMLU, GSM8K, HumanEval, SWE-bench benchmarks',
        'Promptfoo automated red-teaming harness'
      ],
      metrics: [
        { label: 'MMLU BENCHMARK', val: '88.6% General Knowledge' },
        { label: 'GSM8K MATH SCORE', val: '93.2% Multi-step Logic' },
        { label: 'HUMANEVAL CODE', val: '85.4% Pass@1 Python' },
        { label: 'JAILBREAK IMMUNITY', val: '99.4% Mitigated' }
      ]
    },
    {
      id: 9,
      num: '09',
      title: 'DEPLOYMENT & INFERENCE',
      shortTitle: 'Inference',
      analogy: 'Squeezing a leviathan into server racks so it can vomit answers at 120 tokens-per-second.',
      description: 'Production runtime serving optimized with high-performance C++ and CUDA kernels. Employs PagedAttention to eliminate memory fragmentation in the KV-cache, FP8/INT4 weight quantization to halve VRAM footprints, and speculative decoding to output multiple tokens per forward pass.',
      tools: [
        'vLLM & PagedAttention high-throughput engine',
        'NVIDIA TensorRT-LLM & Triton Inference Server',
        'AWQ & GPTQ weight quantization engines',
        'Speculative decoding with draft draft-models'
      ],
      metrics: [
        { label: 'GENERATION SPEED', val: '120+ Tokens / Second' },
        { label: 'TIME TO FIRST TOKEN', val: '<38 Milliseconds' },
        { label: 'QUANTIZATION', val: 'FP8 / INT4 (50% VRAM saved)' },
        { label: 'KV-CACHE EFFICIENCY', val: '96% Memory Utilization' }
      ]
    },
    {
      id: 10,
      num: '10',
      title: 'RAG, AGENTS & MONITORING',
      shortTitle: 'RAG & Agents',
      analogy: 'Equipping the cybernetic oracle with hands, eyes, real-time memory banks, and access to external terminals.',
      description: 'Augmenting the static model with dynamic external capabilities. Retrieval-Augmented Generation (RAG) fetches real-time enterprise documents from vector databases. Function calling and tool protocols enable the model to query APIs, execute code in sandboxed interpreters, and maintain persistent memory.',
      tools: [
        'Model Context Protocol (MCP) & Function Calling',
        'Milvus, Chroma, Pinecone Vector Databases',
        'LangChain & LlamaIndex Agentic Orchestration',
        'OpenTelemetry, Langfuse & Arize Phoenix observability'
      ],
      metrics: [
        { label: 'VECTOR RETRIEVAL', val: '<12ms ANN Search' },
        { label: 'TOOL EXECUTION', val: 'Python REPL & Web APIs' },
        { label: 'CONTEXT EXPANSION', val: 'Infinite Dynamic Knowledge' },
        { label: 'OBSERVABILITY', val: 'Real-time Latency & Drift' }
      ]
    }
  ];

  // =========================================================================
  // 02. MATRIX DIGITAL RAIN CANVAS
  // =========================================================================

  function initMatrixRain() {
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas || prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Characters: Katakana, Numbers, Cyberpunk Hex
    const characters = 'ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ01234567890ABCDEF><[]{}=+*~#$';
    const charArray = characters.split('');
    const fontSize = 14;
    let columns = Math.floor(width / fontSize);
    let drops = new Array(columns).fill(1);

    let speedModifier = 1;
    let speedResetTimeout = null;

    function draw() {
      // Semi-transparent black rect creates trailing fade effect
      ctx.fillStyle = 'rgba(5, 8, 5, 0.08)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = charArray[Math.floor(Math.random() * charArray.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Bright tip
        if (Math.random() > 0.88) {
          ctx.fillStyle = '#00e5ff'; // Cyan accent tip
        } else {
          ctx.fillStyle = '#00ff41'; // Matrix green
        }

        ctx.fillText(char, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i] += speedModifier;
      }

      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.floor(width / fontSize);
      drops = new Array(columns).fill(1);
    });

    draw();

    // Matrix boost easter egg exposed to terminal
    window.boostMatrixRain = function (duration = 4000) {
      speedModifier = 3.5;
      if (speedResetTimeout) clearTimeout(speedResetTimeout);
      speedResetTimeout = setTimeout(() => {
        speedModifier = 1;
      }, duration);
    };
  }

  // =========================================================================
  // 03. BOOT SEQUENCE SIMULATION
  // =========================================================================

  function initBootSequence() {
    const bootLog = document.getElementById('boot-log');
    const heroReveal = document.getElementById('hero-reveal');
    const bootWindow = document.getElementById('boot-window');
    if (!bootLog || !heroReveal) return;

    const bootLines = [
      { ok: true, text: 'Initializing neural substrate v4.8.0-gh...' },
      { ok: true, text: 'Loading FP16 tensor weights into 8x H100 SXM5 GPU cluster...' },
      { ok: true, text: 'Mounting BPE tokenizer dictionary (vocab size: 128,000)...' },
      { ok: true, text: 'Synchronizing multi-head self-attention KV-cache pointers...' },
      { ok: true, text: 'Calibrating RoPE rotational embeddings at 128K context horizon...' },
      { ok: true, text: 'Neural link established: prompt ➔ logits ➔ output stream.' },
      { ok: true, text: 'GHOST IN THE TOKENS IS ACTIVE. STANDBY FOR TRANSMISSION.' }
    ];

    let currentLine = 0;
    let isBootDone = false;

    function finishBoot() {
      if (isBootDone) return;
      isBootDone = true;
      heroReveal.classList.add('revealed');
      if (bootWindow) {
        bootWindow.style.opacity = '0.9';
      }
    }

    if (prefersReducedMotion) {
      // Instant reveal
      bootLines.forEach((line) => {
        const div = document.createElement('div');
        div.className = 'boot-line';
        div.innerHTML = `<span class="boot-ok">[ OK ]</span> <span>${line.text}</span>`;
        bootLog.appendChild(div);
      });
      finishBoot();
      return;
    }

    function typeNextLine() {
      if (currentLine >= bootLines.length) {
        setTimeout(finishBoot, 400);
        return;
      }

      const item = bootLines[currentLine];
      const div = document.createElement('div');
      div.className = 'boot-line';

      const timestamp = new Date().toISOString().substring(11, 19);
      div.innerHTML = `<span class="boot-dim">[${timestamp}]</span> <span class="boot-ok">[ OK ]</span> <span>${item.text}</span>`;
      bootLog.appendChild(div);

      currentLine++;
      const delay = currentLine === bootLines.length ? 300 : Math.floor(Math.random() * 220) + 160;
      setTimeout(typeNextLine, delay);
    }

    // Allow user to click to skip boot sequence
    bootWindow.addEventListener('click', () => {
      if (!isBootDone) {
        while (currentLine < bootLines.length) {
          const item = bootLines[currentLine];
          const div = document.createElement('div');
          div.className = 'boot-line';
          div.innerHTML = `<span class="boot-ok">[ OK ]</span> <span>${item.text}</span>`;
          bootLog.appendChild(div);
          currentLine++;
        }
        finishBoot();
      }
    });

    setTimeout(typeNextLine, 350);
  }

  // =========================================================================
  // 04. PIPELINE MAP & TERMINAL INSPECTOR
  // =========================================================================

  let currentStageIndex = 0;

  function initPipelineMap() {
    const nodesContainer = document.getElementById('pipeline-nodes');
    const prevBtn = document.getElementById('stage-prev-btn');
    const nextBtn = document.getElementById('stage-next-btn');
    if (!nodesContainer) return;

    // Build the 10 nodes dynamically
    PIPELINE_STAGES.forEach((stage, index) => {
      const nodeBtn = document.createElement('button');
      nodeBtn.className = `stage-node-item ${index === 0 ? 'active' : ''}`;
      nodeBtn.setAttribute('role', 'tab');
      nodeBtn.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
      nodeBtn.setAttribute('aria-label', `Stage ${stage.num}: ${stage.title}`);
      nodeBtn.dataset.index = index;

      nodeBtn.innerHTML = `
        <div class="node-orb">
          <span class="node-num">${stage.num}</span>
        </div>
        <span class="node-label">${stage.shortTitle}</span>
      `;

      nodeBtn.addEventListener('click', () => {
        selectStage(index);
      });

      nodeBtn.addEventListener('mouseenter', () => {
        selectStage(index);
      });

      nodesContainer.appendChild(nodeBtn);
    });

    // Prev / Next button listeners
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const nextIdx = (currentStageIndex - 1 + PIPELINE_STAGES.length) % PIPELINE_STAGES.length;
        selectStage(nextIdx);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const nextIdx = (currentStageIndex + 1) % PIPELINE_STAGES.length;
        selectStage(nextIdx);
      });
    }

    // Display the first stage
    renderStageDetails(0);
  }

  function selectStage(index) {
    if (index === currentStageIndex && document.querySelector('.stage-node-item.active')) return;
    currentStageIndex = index;

    // Update active node styling
    const allNodes = document.querySelectorAll('.stage-node-item');
    allNodes.forEach((node, i) => {
      const isActive = i === index;
      node.classList.toggle('active', isActive);
      node.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    renderStageDetails(index);
  }

  let typewriterTimeout = null;

  function renderStageDetails(index) {
    const stage = PIPELINE_STAGES[index];
    if (!stage) return;

    const windowTitle = document.getElementById('inspector-window-title');
    const badge = document.getElementById('inspector-badge');
    const title = document.getElementById('inspector-title');
    const analogy = document.getElementById('inspector-analogy');
    const description = document.getElementById('inspector-description');
    const tools = document.getElementById('inspector-tools');
    const metrics = document.getElementById('inspector-metrics');
    const statusLine = document.getElementById('inspector-status-line');

    if (windowTitle) {
      windowTitle.textContent = `STAGE_${stage.num}_${stage.title.replace(/[\s\(\)\/]/g, '_')}.sh`;
    }
    if (badge) {
      badge.textContent = `STAGE ${stage.num} // 10`;
    }
    if (title) {
      title.textContent = `${stage.num} ${stage.title}`;
    }
    if (analogy) {
      analogy.textContent = stage.analogy;
    }

    // Typewriter or instant update for description
    if (description) {
      if (typewriterTimeout) clearTimeout(typewriterTimeout);
      description.textContent = stage.description;
    }

    if (tools) {
      let toolsHtml = '<ul>';
      stage.tools.forEach((tool) => {
        toolsHtml += `<li>${tool}</li>`;
      });
      toolsHtml += '</ul>';
      tools.innerHTML = toolsHtml;
    }

    if (metrics) {
      let metricsHtml = '';
      stage.metrics.forEach((metric) => {
        metricsHtml += `
          <div class="metric-stat-box">
            <span class="metric-stat-label">${metric.label}</span>
            <span class="metric-stat-val">${metric.val}</span>
          </div>
        `;
      });
      metrics.innerHTML = metricsHtml;
    }

    if (statusLine) {
      statusLine.textContent = `CHECKSUM_${stage.num}: VALIDATED // PIPELINE_FLOW: STAGE_${stage.num}_ACTIVE`;
    }
  }

  // =========================================================================
  // 05. LIVE TOKENIZER SIMULATOR
  // =========================================================================

  // Deterministic 32-bit hash function for simulated token IDs
  function hashString(str) {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return Math.abs(hash % 98000) + 1024;
  }

  function simulateTokenize(text) {
    if (!text || text.length === 0) return [];

    // Subword simulation logic inspired by Byte-Pair Encoding:
    // Regex splits into: leading whitespace with word characters, punctuation, numbers, isolated spaces
    const tokens = [];
    // Regex pattern matching word chunks, contractions, standalone punctuation, spaces
    const regex = /(\s+)|([A-Za-z]+['’]?[A-Za-z]*)|([0-9]+)|([^\s\w]+)/g;
    let match;

    const commonSuffixes = ['ing', 'tion', 'ness', 'ment', 'able', 'ible', 'ize', 'ised', 'ed', 'ly', 'er', 'est', 'ism', 'al', 'ity'];
    const commonPrefixes = ['un', 're', 'in', 'im', 'dis', 'non', 'pre', 'post', 'anti', 'multi', 'sub', 'inter', 'cyber'];

    while ((match = regex.exec(text)) !== null) {
      const rawMatch = match[0];

      // If it's pure whitespace
      if (/^\s+$/.test(rawMatch)) {
        tokens.push({
          text: rawMatch,
          display: rawMatch.replace(/ /g, '·').replace(/\n/g, '\\n'),
          type: 'whitespace',
          id: hashString(' ' + rawMatch)
        });
        continue;
      }

      // If it's punctuation / symbols
      if (/^[^\s\w]+$/.test(rawMatch)) {
        for (const char of rawMatch) {
          tokens.push({
            text: char,
            display: char,
            type: 'punct',
            id: hashString(char)
          });
        }
        continue;
      }

      // If it's a number
      if (/^[0-9]+$/.test(rawMatch)) {
        if (rawMatch.length > 3) {
          // split long numbers into 2-digit chunks
          for (let i = 0; i < rawMatch.length; i += 2) {
            const chunk = rawMatch.substring(i, i + 2);
            tokens.push({
              text: chunk,
              display: chunk,
              type: 'number',
              id: hashString(chunk)
            });
          }
        } else {
          tokens.push({
            text: rawMatch,
            display: rawMatch,
            type: 'number',
            id: hashString(rawMatch)
          });
        }
        continue;
      }

      // If it's a word, simulate subword splitting
      let word = rawMatch;

      // Check prefix
      let hasPrefix = false;
      for (const prefix of commonPrefixes) {
        if (word.toLowerCase().startsWith(prefix) && word.length > prefix.length + 3) {
          const pSub = word.substring(0, prefix.length);
          tokens.push({
            text: pSub,
            display: 'Ġ' + pSub,
            type: 'root',
            id: hashString(pSub.toLowerCase())
          });
          word = word.substring(prefix.length);
          hasPrefix = true;
          break;
        }
      }

      // Check suffix
      let foundSuffix = null;
      for (const suffix of commonSuffixes) {
        if (word.toLowerCase().endsWith(suffix) && word.length > suffix.length + 2) {
          foundSuffix = word.substring(word.length - suffix.length);
          word = word.substring(0, word.length - suffix.length);
          break;
        }
      }

      // Push remaining core
      if (word.length > 0) {
        tokens.push({
          text: word,
          display: hasPrefix ? word : 'Ġ' + word,
          type: 'subword',
          id: hashString(word.toLowerCase())
        });
      }

      // Push suffix if found
      if (foundSuffix) {
        tokens.push({
          text: foundSuffix,
          display: '##' + foundSuffix,
          type: 'subword',
          id: hashString(foundSuffix.toLowerCase())
        });
      }
    }

    return tokens;
  }

  function initTokenizerDemo() {
    const textarea = document.getElementById('tokenizer-input');
    const chipsStream = document.getElementById('token-chips-stream');
    const statChars = document.getElementById('stat-chars');
    const statTokens = document.getElementById('stat-tokens');
    const statRatio = document.getElementById('stat-ratio');
    const statCompression = document.getElementById('stat-compression');
    const statBytes = document.getElementById('stat-bytes');
    const detailMsg = document.getElementById('token-detail-msg');
    const presetBtns = document.querySelectorAll('.preset-btn');

    if (!textarea || !chipsStream) return;

    const colorClasses = ['chip-green', 'chip-cyan', 'chip-magenta', 'chip-amber', 'chip-purple'];

    const presets = {
      cyberpunk: 'The cybernetic ghost observed the neural weights pulsating across the cluster.',
      attention: 'Self-attention mechanisms calculate Scaled Dot-Product Resonance across sequences.',
      code: 'const token = model.generate({ prompt: "Wake up, Neo", temperature: 0.7 });',
      philosophy: 'Do large language models experience subjective phenomenology, or mere statistical echoes?'
    };

    function updateTokenizer() {
      const text = textarea.value;
      const tokens = simulateTokenize(text);

      // Stats
      const charCount = text.length;
      const tokCount = tokens.length;
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const ratio = words > 0 ? (tokCount / words).toFixed(2) : '0.00';
      const compression = charCount > 0 ? (((charCount - tokCount * 2) / charCount) * 100).toFixed(1) : '0.0';
      const byteSize = new Blob([text]).size;

      if (statChars) statChars.textContent = charCount;
      if (statTokens) statTokens.textContent = tokCount;
      if (statRatio) statRatio.textContent = `${ratio}x`;
      if (statCompression) statCompression.textContent = `${Math.max(0, parseFloat(compression))}%`;
      if (statBytes) statBytes.textContent = `${byteSize} B`;

      // Render Chips
      chipsStream.innerHTML = '';
      if (tokens.length === 0) {
        chipsStream.innerHTML = '<span style="color:var(--text-dim);font-size:0.85rem;font-style:italic;">[ Awaiting prompt stream input... ]</span>';
        if (detailMsg) {
          detailMsg.textContent = 'Hover or click any token chip above to view its internal token ID, byte array, and metadata.';
        }
        return;
      }

      tokens.forEach((tok, index) => {
        const chip = document.createElement('div');
        const colorClass = colorClasses[index % colorClasses.length];
        chip.className = `token-chip ${colorClass}`;
        chip.setAttribute('tabindex', '0');
        chip.setAttribute('role', 'button');
        chip.setAttribute('aria-label', `Token: ${tok.display}, ID: ${tok.id}`);

        chip.innerHTML = `
          <span class="token-text">${escapeHtml(tok.display)}</span>
          <span class="token-subid">${tok.id}</span>
        `;

        const inspectHandler = () => {
          document.querySelectorAll('.token-chip.selected').forEach((c) => c.classList.remove('selected'));
          chip.classList.add('selected');

          // Convert string to hex representation
          const hexVals = Array.from(tok.text)
            .map((c) => '0x' + c.charCodeAt(0).toString(16).padStart(2, '0'))
            .join(' ');

          if (detailMsg) {
            detailMsg.innerHTML = `
              <strong>TOKEN #${index + 1}</strong> | 
              ID: <span style="color:var(--neon-green)">${tok.id}</span> | 
              RAW: <span style="color:var(--neon-cyan)">"${escapeHtml(tok.text)}"</span> | 
              BYTES: <span style="color:var(--neon-magenta)">[ ${hexVals} ]</span> | 
              LENGTH: ${tok.text.length} char(s)
            `;
          }
        };

        chip.addEventListener('mouseenter', inspectHandler);
        chip.addEventListener('click', inspectHandler);
        chip.addEventListener('focus', inspectHandler);

        chipsStream.appendChild(chip);
      });
    }

    textarea.addEventListener('input', updateTokenizer);

    presetBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.preset;
        if (presets[key]) {
          textarea.value = presets[key];
          updateTokenizer();
        }
      });
    });

    // Default seed value
    textarea.value = presets.cyberpunk;
    updateTokenizer();
  }

  // =========================================================================
  // 06. INSIDE THE TRANSFORMER: SELF-ATTENTION VISUALIZER
  // =========================================================================

  const ATTENTION_SENTENCES = {
    tired: {
      text: 'The animal did not cross the street because it was too tired',
      focusToken: 'it',
      // High attention from "it" to "animal"
      weights: {
        'The': 0.04,
        'animal': 0.58,
        'did': 0.02,
        'not': 0.03,
        'cross': 0.05,
        'the': 0.02,
        'street': 0.08,
        'because': 0.04,
        'it': 0.06,
        'was': 0.03,
        'too': 0.02,
        'tired': 0.03
      }
    },
    wide: {
      text: 'The animal did not cross the street because it was too wide',
      focusToken: 'it',
      // High attention from "it" to "street"
      weights: {
        'The': 0.03,
        'animal': 0.06,
        'did': 0.02,
        'not': 0.04,
        'cross': 0.06,
        'the': 0.02,
        'street': 0.62,
        'because': 0.03,
        'it': 0.05,
        'was': 0.02,
        'too': 0.02,
        'wide': 0.03
      }
    },
    bank: {
      text: 'The hacker sat on the river bank to wire the crypto payment',
      focusToken: 'bank',
      weights: {
        'The': 0.02,
        'hacker': 0.08,
        'sat': 0.05,
        'on': 0.02,
        'the': 0.02,
        'river': 0.48,
        'bank': 0.06,
        'to': 0.02,
        'wire': 0.15,
        'the': 0.01,
        'crypto': 0.06,
        'payment': 0.03
      }
    }
  };

  let activeAttnPreset = 'tired';
  let activeTokenIdx = null;

  function initAttentionVisualizer() {
    const tokensContainer = document.getElementById('attention-tokens-container');
    const svg = document.getElementById('attention-svg');
    const queryDisplay = document.getElementById('active-query-token');
    const barsList = document.getElementById('attention-bars-list');
    const hintOverlay = document.getElementById('attn-overlay-hint');
    const presetButtons = document.querySelectorAll('.attn-preset-btn');

    if (!tokensContainer || !svg) return;

    function renderSentenceTokens() {
      const data = ATTENTION_SENTENCES[activeAttnPreset];
      const words = data.text.split(' ');
      tokensContainer.innerHTML = '';

      words.forEach((word, idx) => {
        const span = document.createElement('div');
        span.className = 'attn-word-token';
        span.textContent = word;
        span.dataset.index = idx;
        span.dataset.word = word;

        span.addEventListener('mouseenter', () => activateToken(idx));
        span.addEventListener('click', () => activateToken(idx));

        tokensContainer.appendChild(span);
      });

      // Automatically focus on the preset's key token
      const defaultIdx = words.findIndex((w) => w.toLowerCase() === data.focusToken.toLowerCase());
      if (defaultIdx !== -1) {
        activateToken(defaultIdx);
      } else {
        activateToken(0);
      }
    }

    function activateToken(queryIdx) {
      activeTokenIdx = queryIdx;
      const data = ATTENTION_SENTENCES[activeAttnPreset];
      const words = data.text.split(' ');
      const queryWord = words[queryIdx];

      // Update DOM classes
      const tokenSpans = tokensContainer.querySelectorAll('.attn-word-token');
      tokenSpans.forEach((span, idx) => {
        span.classList.toggle('query-active', idx === queryIdx);
      });

      if (queryDisplay) {
        queryDisplay.innerHTML = `<span style="color:var(--neon-green)">"${queryWord}"</span> <span style="font-size:0.75rem;color:var(--text-dim)">(Pos: ${queryIdx})</span>`;
      }

      if (hintOverlay) {
        hintOverlay.style.opacity = '0';
      }

      // Compute attention weights for this query word
      // If it matches the preset focus token, use custom weights; otherwise calculate distance-based falloff
      const weights = {};
      const isDefaultFocus = queryWord.toLowerCase() === data.focusToken.toLowerCase();

      if (isDefaultFocus && data.weights) {
        words.forEach((w) => {
          weights[w] = data.weights[w] !== undefined ? data.weights[w] : 0.03;
        });
      } else {
        // Synthesize dynamic attention weights based on contextual relevance and proximity
        let sum = 0;
        words.forEach((w, idx) => {
          const dist = Math.abs(idx - queryIdx);
          // Distance falloff + randomness simulation
          let raw = Math.exp(-dist * 0.45) + (w.length > 5 ? 0.35 : 0.05);
          if (idx === queryIdx) raw *= 0.8;
          weights[w] = raw;
          sum += raw;
        });
        words.forEach((w) => {
          weights[w] = sum > 0 ? parseFloat((weights[w] / sum).toFixed(3)) : 0.05;
        });
      }

      drawAttentionCurves(queryIdx, words, weights);
      renderAttentionBars(words, weights, queryIdx);
    }

    function drawAttentionCurves(queryIdx, words, weights) {
      const svgRect = svg.getBoundingClientRect();
      const tokenSpans = tokensContainer.querySelectorAll('.attn-word-token');
      if (tokenSpans.length === 0 || svgRect.width === 0) return;

      svg.innerHTML = '';

      const querySpan = tokenSpans[queryIdx];
      const qRect = querySpan.getBoundingClientRect();
      const qX = qRect.left - svgRect.left + qRect.width / 2;
      const qY = 20; // Top pin

      words.forEach((targetWord, targetIdx) => {
        const targetSpan = tokenSpans[targetIdx];
        const tRect = targetSpan.getBoundingClientRect();
        const tX = tRect.left - svgRect.left + tRect.width / 2;
        const tY = svgRect.height - 25; // Bottom pin

        const weight = weights[targetWord] || 0.02;

        // Path: Bezier curve connecting top Q to bottom K
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const midY = svgRect.height / 2;
        const d = `M ${qX} ${qY} C ${qX} ${midY}, ${tX} ${midY}, ${tX} ${tY}`;

        // Color & thickness based on weight
        const strokeWidth = Math.max(1, weight * 16);
        const opacity = Math.min(1, Math.max(0.12, weight * 1.5));

        let strokeColor = 'rgba(0, 255, 65, ' + opacity + ')';
        if (weight > 0.4) {
          strokeColor = 'rgba(0, 229, 255, ' + opacity + ')'; // Cyan glow for high weight
        } else if (weight > 0.2) {
          strokeColor = 'rgba(255, 43, 214, ' + opacity + ')';
        }

        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', strokeColor);
        path.setAttribute('stroke-width', strokeWidth.toFixed(1));
        path.setAttribute('stroke-linecap', 'round');

        svg.appendChild(path);

        // Highlight token if key attention is high
        targetSpan.classList.toggle('key-high', weight > 0.35 && targetIdx !== queryIdx);
      });
    }

    function renderAttentionBars(words, weights, queryIdx) {
      if (!barsList) return;
      barsList.innerHTML = '';

      // Sort words by weight descending
      const sorted = words
        .map((w, idx) => ({ word: w, weight: weights[w] || 0.02, idx }))
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 5); // top 5 attended keys

      sorted.forEach((item) => {
        const pct = (item.weight * 100).toFixed(1);
        const row = document.createElement('div');
        row.className = 'attn-bar-item';
        row.innerHTML = `
          <span class="attn-bar-label" title="${item.word}">${item.word}</span>
          <div class="attn-bar-track">
            <div class="attn-bar-fill" style="width: ${pct}%"></div>
          </div>
          <span class="attn-bar-val">${pct}%</span>
        `;
        barsList.appendChild(row);
      });
    }

    // Switch presets
    presetButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        presetButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        activeAttnPreset = btn.dataset.attn;
        renderSentenceTokens();
      });
    });

    window.addEventListener('resize', () => {
      if (activeTokenIdx !== null) {
        const data = ATTENTION_SENTENCES[activeAttnPreset];
        const words = data.text.split(' ');
        drawAttentionCurves(activeTokenIdx, words, data.weights || {});
      }
    });

    renderSentenceTokens();
  }

  // =========================================================================
  // 07. INTERACTIVE TERMINAL EASTER EGG (CLI)
  // =========================================================================

  function initInteractiveCli() {
    const cliInput = document.getElementById('cli-input');
    const cliOutput = document.getElementById('cli-output');
    const cliScreen = document.getElementById('cli-screen');
    const clearBtn = document.getElementById('cli-clear-btn');
    const helpBtn = document.getElementById('cli-help-btn');
    const quickCmds = document.querySelectorAll('.term-quick-cmd');

    if (!cliInput || !cliOutput) return;

    const commandHistory = [];
    let historyIndex = -1;

    const COMMANDS = {
      help: () => `
SYSTEM HELP PROTOCOL // AVAILABLE COMMANDS:
----------------------------------------------------------------------
  help                  - Show this list of available commands
  pipeline              - Render ASCII architecture flow of all 10 stages
  stages                - Detailed list of pipeline stages & compute specs
  tokenize <text>       - Dissect any text payload into BPE integer tokens
  attention <word>      - Probe attention vector resonance
  weights               - Print tensor shapes, parameter counts, and VRAM footprint
  matrix                - Trigger overdrive acceleration on Matrix digital rain
  about                 - Inspect system kernel, model weights, and credits
  clear                 - Wipe the terminal buffer
  sudo hack             - [RESTRICTED] Elevate permissions to root neural kernel
----------------------------------------------------------------------`,

      pipeline: () => `
[01: DATA COLLECTION] ➔ [02: CLEANING & DEDUP] ➔ [03: TOKENIZATION]
           │
           ▼
[04: EMBEDDINGS & ROPE] ➔ [05: PRETRAINING (TRANSFORMER)] ➔ [06: SFT]
                                                       │
                                                       ▼
[10: RAG & AGENTS] ◄─ [09: DEPLOYMENT/VLLM] ◄─ [08: EVAL] ◄─ [07: RLHF/DPO]`,

      stages: () => {
        let out = 'LLM PIPELINE STAGE DIRECTORY:\n';
        PIPELINE_STAGES.forEach((s) => {
          out += `  [${s.num}] ${s.title.padEnd(28, ' ')} : ${s.analogy}\n`;
        });
        return out;
      },

      tokenize: (args) => {
        if (!args || args.trim().length === 0) {
          return 'ERR: Missing string argument. Usage: tokenize <your sentence here>';
        }
        const toks = simulateTokenize(args);
        const ids = toks.map((t) => t.id);
        const displays = toks.map((t) => `'${t.display}'`);
        return `
TOKENIZATION RESULTS:
Payload:     "${args}"
Tokens (${toks.length}): [ ${ids.join(', ')} ]
Subwords:    [ ${displays.join(', ')} ]
Byte Size:   ${new Blob([args]).size} bytes`;
      },

      attention: (word) => {
        if (!word) {
          return 'ERR: Specify word to inspect. Usage: attention <word>';
        }
        return `
[ATTENTION HEAD #07 WEIGHT PROBE]
Target Token: "${word}"
Resonance Spectrum:
  ➔ Softmax(Q·K^T / sqrt(d_k)) = [ 0.58, 0.22, 0.12, 0.05, 0.03 ]
  ➔ Dominant attractor: Contextual entity resolution confirmed.`;
      },

      weights: () => `
[TENSOR MATRIX ARCHITECTURE SPECS]
  Total Parameters:    405,821,952,000 (405 Billion)
  Layers (Hidden):     128 Decoder Blocks
  Attention Heads:     64 Query Heads | 8 Key/Value Heads (GQA)
  Hidden Dimension:    16,384
  Intermediate Dim:    53,248 (SwiGLU feed-forward)
  Weight Format:       FP16 (2 bytes / parameter = ~810 GB VRAM)
  KV-Cache Buffer:     PagedAttention allocated on 8x H100 (80GB each)`,

      matrix: () => {
        if (typeof window.boostMatrixRain === 'function') {
          window.boostMatrixRain(5000);
        }
        return `[OK] INITIATING MATRIX ACCELERATOR OVERCLOCK FOR 5 SECONDS... WATCH BACKGROUND CANVAS.`;
      },

      about: () => `
GHOST IN THE TOKENS // END-TO-END LLM PIPELINE
----------------------------------------------------------------------
Architecture: Vanilla HTML5 / Modern CSS3 / Vanilla ES6+
Theme:        Cyberpunk Hacker Terminal
Version:      4.8.0-gh (DeepMind Systems)
Mission:      Demystifying every transformation from human prose to silicon thoughts.
Status:       All neural circuits operational.`,

      'sudo hack': () => {
        return `
[!] SECURITY ALERT: UNAUTHORIZED ROOT ACCESS ATTEMPT DETECTED!
[!] INTRUSION COUNTERMEASURE PROTOCOL DEPLOYED.
[!] ACCESS DENIED. Nice try, script kiddie. Your IP has been logged into the weights.`;
      }
    };

    function appendCliOutput(html, isCommand = false) {
      const entry = document.createElement('div');
      entry.className = 'cli-log-entry';

      if (isCommand) {
        entry.innerHTML = `<div class="cli-cmd-echo"><span class="user-part">user</span>@<span class="host-part">llm</span>:<span class="path-part">~$</span> <span class="cli-cmd-text">${escapeHtml(html)}</span></div>`;
      } else {
        entry.innerHTML = `<div class="cli-res-text">${html}</div>`;
      }

      cliOutput.appendChild(entry);
      cliScreen.scrollTop = cliScreen.scrollHeight;
    }

    function executeCommand(rawInput) {
      const trimmed = rawInput.trim();
      if (!trimmed) return;

      commandHistory.push(trimmed);
      historyIndex = commandHistory.length;

      appendCliOutput(trimmed, true);

      const parts = trimmed.split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const args = trimmed.substring(cmd.length).trim();

      // Check special sudo hack alias
      if (trimmed.toLowerCase() === 'sudo hack' || trimmed.toLowerCase() === 'sudo su' || trimmed.toLowerCase() === 'sudo') {
        const response = COMMANDS['sudo hack']();
        appendCliOutput(`<span class="cli-res-error">${response}</span>`);
        return;
      }

      if (cmd === 'clear') {
        cliOutput.innerHTML = '';
        return;
      }

      if (COMMANDS[cmd]) {
        const response = COMMANDS[cmd](args);
        appendCliOutput(`<span class="cli-res-success">${response}</span>`);
      } else {
        appendCliOutput(
          `<span class="cli-res-error">Command not found: '${escapeHtml(cmd)}'. Type '<span class="neon-cyan" style="cursor:pointer;" onclick="document.getElementById('cli-input').value='help';document.getElementById('cli-input').focus();">help</span>' for valid commands.</span>`
        );
      }
    }

    cliInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        executeCommand(cliInput.value);
        cliInput.value = '';
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
          historyIndex--;
          cliInput.value = commandHistory[historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
          historyIndex++;
          cliInput.value = commandHistory[historyIndex];
        } else {
          historyIndex = commandHistory.length;
          cliInput.value = '';
        }
      }
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        cliOutput.innerHTML = '';
        cliInput.focus();
      });
    }

    if (helpBtn) {
      helpBtn.addEventListener('click', () => {
        executeCommand('help');
      });
    }

    quickCmds.forEach((btn) => {
      btn.addEventListener('click', () => {
        const cmd = btn.dataset.cmd;
        cliInput.value = cmd;
        executeCommand(cmd);
        cliInput.value = '';
      });
    });
  }

  // =========================================================================
  // 08. SCROLL PROGRESS BAR & HUD NAVIGATION
  // =========================================================================

  function initScrollProgressAndNav() {
    const progressBar = document.getElementById('scroll-progress');
    const hudLinks = document.querySelectorAll('.hud-link');
    const sections = document.querySelectorAll('section[id]');

    function updateProgress() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      if (progressBar) {
        progressBar.style.width = `${progress}%`;
      }
    }

    window.addEventListener('scroll', updateProgress, { passive: true });

    // Active Section Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            hudLinks.forEach((link) => {
              link.classList.toggle('active', link.getAttribute('data-nav') === id);
            });
          }
        });
      },
      {
        rootMargin: '-30% 0px -40% 0px',
        threshold: 0
      }
    );

    sections.forEach((sec) => observer.observe(sec));
  }

  // =========================================================================
  // 09. UTILITIES
  // =========================================================================

  function escapeHtml(string) {
    const entityMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;'
    };
    return String(string).replace(/[&<>"'\/]/g, (s) => entityMap[s]);
  }

  // =========================================================================
  // 10. INITIALIZATION
  // =========================================================================

  document.addEventListener('DOMContentLoaded', () => {
    initMatrixRain();
    initBootSequence();
    initPipelineMap();
    initTokenizerDemo();
    initAttentionVisualizer();
    initInteractiveCli();
    initScrollProgressAndNav();
  });
})();
