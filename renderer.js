// ScrewAI Pro - Renderer
(function() {
  'use strict';

  // State
  let audioPath = null;
  let outputDir = null;
  let strains = [];
  let selectedStrains = new Set();
  let activeFormat = 'MP3';
  let sourceAudioFormat = null;
  let isProcessing = false;
  let viewMode = 'grid'; // 'grid' (square cards) | 'vial' (vertical strips)
  const conversionSettings = {
    mp3ToWav: false,
    wavToMp3: false
  };

  const fallbackApi = {
    minimize: () => {},
    maximize: () => {},
    close: () => {},
    selectAudio: async () => null,
    selectOutput: async () => null,
    getStrains: async () => createFallbackStrains(),
    processAudio: async () => [],
    onProgress: () => {}
  };

  const screwaiApi = window.screwai && typeof window.screwai.getStrains === 'function'
    ? window.screwai
    : fallbackApi;

  // DOM Elements
  const audioDrop = document.getElementById('audio-drop');
  const audioName = document.getElementById('audio-name');
  const outputBtn = document.getElementById('output-btn');
  const outputPath = document.getElementById('output-path');
  const strainsGrid = document.getElementById('strains-grid');
  const selectedCount = document.getElementById('selected-count');
  const selectAllBtn = document.getElementById('select-all');
  const processAllBtn = document.getElementById('process-all');
  const formatSelect = document.getElementById('format-select');
  const viewToggleBtn = document.getElementById('view-toggle');
  const mp3ToWavToggle = document.getElementById('setting-mp3-to-wav');
  const wavToMp3Toggle = document.getElementById('setting-wav-to-mp3');
  const formatModeValue = document.getElementById('format-mode-value');
  const formatModeNote = document.getElementById('format-mode-note');
  const mp3Tab = null; // replaced by dropdown
  const wavTab = null; // replaced by dropdown
  const mp3Count = document.getElementById('mp3-count');
  const wavCount = document.getElementById('wav-count');
  const totalCount = document.getElementById('total-count');
  const countStatus = document.getElementById('count-status');
  const processBtn = document.getElementById('process-btn');
  const progressSection = document.getElementById('progress-section');
  const progressCount = document.getElementById('progress-count');
  const progressFill = document.getElementById('progress-fill');
  const currentStrain = document.getElementById('current-strain');
  const resultsSection = document.getElementById('results-section');
  const resultsList = document.getElementById('results-list');

  // Window Controls
  document.getElementById('btn-minimize').addEventListener('click', () => screwaiApi.minimize());
  document.getElementById('btn-maximize').addEventListener('click', () => screwaiApi.maximize());
  document.getElementById('btn-close').addEventListener('click', () => screwaiApi.close());

  // Initialize
  async function init() {
    setupAmbientSyrup();

    // Load strains
    strains = await screwaiApi.getStrains();
    updateFormatCounts();
    renderStrains();

    // Setup event listeners
    setupAudioDrop();
    setupOutputSelect();
    setupProcessButton();
    setupSelectAll();
    setupFormatSelect();
    setupConversionSettings();
    setupProcessAll();
    setupViewToggle();
    setupProgressListener();
    syncFormatAvailability();
  }

  function setupAmbientSyrup() {
    const syrupLamp = document.getElementById('syrup-lamp');
    if (!syrupLamp) return;

    syrupLamp.innerHTML = '';

    const blobCount = 5;
    const bubbleCount = 18;

    for (let index = 0; index < blobCount; index += 1) {
      const blob = document.createElement('span');
      blob.className = 'syrup-blob';
      blob.style.setProperty('--x', `${8 + Math.random() * 84}%`);
      blob.style.setProperty('--y', `${18 + Math.random() * 62}%`);
      blob.style.setProperty('--size', `${180 + Math.random() * 180}px`);
      blob.style.setProperty('--duration', `${16 + Math.random() * 12}s`);
      blob.style.setProperty('--delay', `${-Math.random() * 14}s`);
      syrupLamp.appendChild(blob);
    }

    for (let index = 0; index < bubbleCount; index += 1) {
      const bubble = document.createElement('span');
      bubble.className = 'syrup-bubble';
      bubble.style.setProperty('--x', `${3 + Math.random() * 94}%`);
      bubble.style.setProperty('--size', `${12 + Math.random() * 44}px`);
      bubble.style.setProperty('--duration', `${12 + Math.random() * 16}s`);
      bubble.style.setProperty('--delay', `${-Math.random() * 18}s`);
      bubble.style.setProperty('--drift', `${(Math.random() - 0.5) * 140}px`);
      syrupLamp.appendChild(bubble);
    }
  }

  // Strain Icons SVG
  const strainIcons = {
    wock: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 3h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-1l-1 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 7H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm3 4l1 13h6l1-13H8zm4 2v9m-2-9v9m4-9v9"/></svg>`,
    tris: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 3l5 3v6l-5 3-5-3V8l5-3z"/><circle cx="12" cy="12" r="3"/></svg>`,
    tuss: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 2h6v2H9V2zm0 4h6v2h1a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3h1V6zm-1 6v8h8v-8H8z"/><rect x="10" y="14" width="4" height="2" rx="1"/></svg>`,
    quali: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6a6 6 0 1 0 6 6 6 6 0 0 0-6-6zm0 10a4 4 0 1 1 4-4 4 4 0 0 1-4 4z"/><circle cx="12" cy="12" r="2"/></svg>`,
    activis: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="2" width="12" height="4" rx="1"/><path d="M7 6h10v2H7z"/><path d="M5 8h14l-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 8z"/><path d="M9 12h6v2H9zm0 4h4v2H9z" fill="rgba(0,0,0,0.3)"/></svg>`,
    akorn: `<svg viewBox="0 0 24 24" fill="currentColor"><ellipse cx="12" cy="17" rx="3" ry="4"/><path d="M12 3c-2 0-4 3-4 8s2 6 4 6 4-1 4-6-2-8-4-8z"/><path d="M10 5c0-2 2-3 2-3s2 1 2 3" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
    barre: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M8 8h8v2H8zm0 4h8v2H8zm0 4h4v2H8z" fill="rgba(0,0,0,0.3)"/></svg>`,
    hydro: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-4 4-7 8-7 12a7 7 0 0 0 14 0c0-4-3-8-7-12z"/><ellipse cx="12" cy="15" rx="4" ry="3" fill="rgba(255,255,255,0.3)"/></svg>`,
    bass: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="14" width="3" height="6" rx="1"/><rect x="7" y="10" width="3" height="10" rx="1"/><rect x="11" y="6" width="3" height="14" rx="1"/><rect x="15" y="8" width="3" height="12" rx="1"/><rect x="19" y="12" width="3" height="8" rx="1"/></svg>`,
    echo: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.7"/><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4"/></svg>`,
    slow: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" fill="none" stroke="rgba(0,0,0,0.4)" stroke-width="2" stroke-linecap="round"/></svg>`,
    choose: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/><circle cx="8" cy="7" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="10" cy="17" r="2"/></svg>`,
    chop: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="9" y1="6" x2="20" y2="6" stroke="currentColor" stroke-width="2"/><line x1="9" y1="18" x2="20" y2="18" stroke="currentColor" stroke-width="2"/><path d="M15 10l3 2-3 2" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
    tape: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="8" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="16" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="10" y="10" width="4" height="4" rx="1"/></svg>`,
    glide: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 12c2-4 4-6 6-6s4 8 6 8 4-4 6-8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="8" cy="6" r="1.5"/><circle cx="14" cy="14" r="1.5"/></svg>`,
    master: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="3" height="16" rx="1"/><rect x="8" y="4" width="3" height="16" rx="1"/><rect x="13" y="4" width="3" height="16" rx="1"/><rect x="18" y="4" width="3" height="16" rx="1"/><circle cx="4.5" cy="8" r="2" fill="rgba(0,0,0,0.4)"/><circle cx="9.5" cy="14" r="2" fill="rgba(0,0,0,0.4)"/><circle cx="14.5" cy="6" r="2" fill="rgba(0,0,0,0.4)"/><circle cx="19.5" cy="16" r="2" fill="rgba(0,0,0,0.4)"/></svg>`,
    default: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`
  };

  function createSeededRandom(seedText) {
    let seed = 2166136261;
    for (let i = 0; i < seedText.length; i++) {
      seed ^= seedText.charCodeAt(i);
      seed = Math.imul(seed, 16777619);
    }

    return function nextRandom() {
      seed += 0x6D2B79F5;
      let value = seed;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function clamp(number, min, max) {
    return Math.min(max, Math.max(min, number));
  }

  function detectAudioFormat(filePath) {
    const extension = (filePath.split('.').pop() || '').toLowerCase();
    if (extension === 'mp3') return 'MP3';
    if (extension === 'wav') return 'WAV';
    return null;
  }

  function getAllowedFormats() {
    if (sourceAudioFormat === 'MP3') {
      return conversionSettings.mp3ToWav ? ['MP3', 'WAV'] : ['MP3'];
    }

    if (sourceAudioFormat === 'WAV') {
      return conversionSettings.wavToMp3 ? ['WAV', 'MP3'] : ['WAV'];
    }

    return ['MP3', 'WAV'];
  }

  function getVisibleSelectedStrains() {
    return Array.from(selectedStrains)
      .map(index => strains[index])
      .filter(Boolean)
      .filter(strain => strain.format === activeFormat && strain.tier !== 'pro');
  }

  function syncFormatAvailability() {
    const allowedFormats = getAllowedFormats();

    if (!allowedFormats.includes(activeFormat)) {
      activeFormat = allowedFormats[0] || 'MP3';
    }

    if (formatSelect) {
      Array.from(formatSelect.options).forEach(option => {
        option.disabled = !allowedFormats.includes(option.value);
      });
      formatSelect.value = activeFormat;
    }

    if (formatModeValue) {
      if (sourceAudioFormat === 'MP3') {
        formatModeValue.textContent = conversionSettings.mp3ToWav ? 'MP3 upload: MP3 and WAV outputs enabled' : 'MP3 upload: MP3 outputs only';
      } else if (sourceAudioFormat === 'WAV') {
        formatModeValue.textContent = conversionSettings.wavToMp3 ? 'WAV upload: WAV and MP3 outputs enabled' : 'WAV upload: WAV outputs only';
      } else {
        formatModeValue.textContent = 'Upload an MP3 or WAV to lock output format';
      }
    }

    if (formatModeNote) {
      if (sourceAudioFormat === 'MP3' && !conversionSettings.mp3ToWav) {
        formatModeNote.textContent = 'MP3-to-WAV conversion is off, so WAV strain downloads stay hidden.';
      } else if (sourceAudioFormat === 'WAV' && !conversionSettings.wavToMp3) {
        formatModeNote.textContent = 'WAV-to-MP3 conversion is off, so MP3 strain downloads stay hidden.';
      } else if (sourceAudioFormat) {
        formatModeNote.textContent = 'Conversion is enabled for this upload type, so both output formats are available in the format switcher.';
      } else {
        formatModeNote.textContent = 'By default, uploaded MP3 files only render MP3 strains, and uploaded WAV files only render WAV strains.';
      }
    }

    renderStrains();
    updateSelectedCount();
    updateProcessButton();
  }

  function createBottleProfile(strain, index, visualOrder) {
    const random = createSeededRandom(`${strain.name}|${strain.format}|${index}|${visualOrder}`);
    const highFillBottle = random() < 0.5;
    const baseFill = highFillBottle
      ? Math.round(82 + random() * 12)   // 82-94%: near top for visible lettering
      : Math.round(62 + random() * 22);  // 62-84%: still high enough to back transparent labels
    const hoverFill = clamp(baseFill + 5 + Math.round(random() * 8), baseFill + 3, 92);
    const selectedFill = clamp(hoverFill + 5 + Math.round(random() * 8), hoverFill + 4, 96);
    const bubbleCount = 2 + Math.floor(random() * 7);

    const bubbles = Array.from({ length: bubbleCount }, (_, bubbleIndex) => {
      const bx = `${Math.round(8 + random() * 82)}%`;
      const bd = `${(bubbleIndex * 0.22 + random() * 0.65).toFixed(2)}s`;
      const bd2 = `${(random() * 1.6).toFixed(2)}s`;
      const bs = `${(3.5 + random() * 6.5).toFixed(1)}px`;
      const bw = `${((random() - 0.5) * 14).toFixed(1)}px`;
      return `<span class="bubble" style="--bx:${bx};--bd:${bd};--bd2:${bd2};--bs:${bs};--bwobble:${bw}"></span>`;
    }).join('');

    return {
      baseFill,
      hoverFill,
      selectedFill,
      bubbles
    };
  }

  function buildNonAdjacentColors(visibleStrains) {
    const palette = [
      '#7C3AED', '#C084FC', '#A855F7', '#6D28D9',
      '#B91C1C', '#F43F5E', '#BE185D',
      '#3B82F6', '#0EA5E9', '#06B6D4',
      '#22C55E', '#84CC16',
      '#EAB308', '#F59E0B', '#25D0C3'
    ];

    const chosen = [];
    for (let i = 0; i < visibleStrains.length; i++) {
      const { strain, index } = visibleStrains[i];
      let color = strain.color;
      const previous = i > 0 ? chosen[i - 1] : null;

      if (color === previous) {
        const seedText = `${strain.name}|${strain.format}|${index}|${i}`;
        let seed = 0;
        for (let j = 0; j < seedText.length; j++) {
          seed = (seed + seedText.charCodeAt(j)) % palette.length;
        }

        for (let step = 0; step < palette.length; step++) {
          const candidate = palette[(seed + step) % palette.length];
          if (candidate !== previous) {
            color = candidate;
            break;
          }
        }
      }

      chosen.push(color);
    }

    return chosen;
  }

  function getGridColumnCount() {
    if (!strainsGrid.classList.contains('view-grid')) return 1;

    const computedStyle = window.getComputedStyle(strainsGrid);
    const templateColumns = computedStyle.gridTemplateColumns
      .split(' ')
      .map(value => value.trim())
      .filter(Boolean);

    if (templateColumns.length > 0) {
      return templateColumns.length;
    }

    return 1;
  }

  function buildNonAdjacentLabels(visibleStrains) {
    const labelPalette = [
      './label/purple_screw.png',
      './label/tuss.png',
      './label/quagen.png',
      './label/tris.png',
      './label/screwai.png',
      './label/screwai2.png',
      './label/image.png',
      './label/wockheart.png',
      './label/wocky.png',
      './label/wocky2.png',
      './label/ackt.png',
      './label/acorn.png'
    ];

    const columns = getGridColumnCount();
    const chosen = [];

    for (let i = 0; i < visibleStrains.length; i++) {
      const { strain, index } = visibleStrains[i];
      let labelImg = strain.labelImg || labelPalette[0];
      const leftNeighbor = i > 0 ? chosen[i - 1] : null;
      const topNeighbor = i >= columns ? chosen[i - columns] : null;

      if (labelImg === leftNeighbor || labelImg === topNeighbor) {
        const seedText = `${strain.name}|${strain.format}|${index}|${i}|label`;
        let seed = 0;
        for (let j = 0; j < seedText.length; j++) {
          seed = (seed + seedText.charCodeAt(j)) % labelPalette.length;
        }

        for (let step = 0; step < labelPalette.length; step++) {
          const candidate = labelPalette[(seed + step) % labelPalette.length];
          if (candidate !== leftNeighbor && candidate !== topNeighbor) {
            labelImg = candidate;
            break;
          }
        }
      }

      chosen.push(labelImg);
    }

    return chosen;
  }

  // Render Strains
  function renderStrains() {
    const visibleStrains = strains
      .map((strain, index) => ({ strain, index }))
      .filter(({ strain }) => strain.format === activeFormat);

    if (visibleStrains.length === 0) {
      strainsGrid.innerHTML = '<div class="empty-state">No strains detected for this format.</div>';
      updateSelectedCount();
      return;
    }

    const nonAdjacentColors = buildNonAdjacentColors(visibleStrains);
    const nonAdjacentLabels = buildNonAdjacentLabels(visibleStrains);

    strainsGrid.innerHTML = visibleStrains.map(({ strain, index }, visualOrder) => `
      ${(() => {
        const bottleProfile = createBottleProfile(strain, index, visualOrder);
        const labelImg = nonAdjacentLabels[visualOrder];
        const centeredLabelClass = labelImg && labelImg.includes('wockheart')
          ? ' strip-label-img-centered'
          : '';
        const acktLeftClass = labelImg && labelImg.includes('ackt')
          ? ' strip-label-img-ackt-left'
          : '';
        const imageLargeClass = labelImg && labelImg.includes('image.png')
          ? ' strip-label-img-image-large'
          : '';
        const isPro = strain.tier === 'pro';
        return `<div class="strain-strip${selectedStrains.has(index) ? ' selected' : ''}${isPro ? ' pro-locked' : ''}" data-index="${index}" style="--strain-color: ${nonAdjacentColors[visualOrder]}; --strip-order: ${visualOrder}; --fill-base: ${bottleProfile.baseFill}%; --fill-hover: ${bottleProfile.hoverFill}%; --fill-selected: ${bottleProfile.selectedFill}%">
        <div class="strip-cap">
          <span class="strip-cap-ridges"></span>
        </div>
        ${bottleProfile.bubbles}
        <div class="strip-label">
          ${labelImg
            ? `<img class="strip-label-img${centeredLabelClass}${acktLeftClass}${imageLargeClass}" src="${labelImg}" alt="${strain.name} label" draggable="false" />`
            : `<div class="strip-label-band"></div>
          <div class="strip-label-kicker">Rx Series</div>
          <div class="strip-label-name">${strain.name}</div>
          <div class="strip-label-meta">${strain.format} formula</div>`
          }
        </div>
        <div class="strip-measurements">
          <span class="strip-measure" data-ml="4"></span>
          <span class="strip-measure" data-ml="3"></span>
          <span class="strip-measure" data-ml="2"></span>
          <span class="strip-measure" data-ml="1"></span>
        </div>
        <div class="strip-light"></div>
        <div class="strip-icon">${strainIcons[strain.icon] || strainIcons.default}</div>
        <div class="strip-name">${strain.name}</div>
        <div class="strip-format">${strain.name}</div>
        ${isPro ? `<div class="pro-lock-badge"><svg class="pro-lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg><span class="pro-lock-label">PRO</span></div>` : ''}
        <div class="strip-check">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      </div>`;
      })()}
    `).join('');

    // Add click handlers
    document.querySelectorAll('.strain-strip').forEach(strip => {
      strip.addEventListener('click', () => toggleStrain(parseInt(strip.dataset.index)));
    });

    updateSelectedCount();
  }

  // Toggle Strain Selection
  function toggleStrain(index) {
    if (isProcessing) return;
    if (strains[index] && strains[index].tier === 'pro') return;
    
    const card = document.querySelector(`.strain-strip[data-index="${index}"]`);
    if (selectedStrains.has(index)) {
      selectedStrains.delete(index);
      card.classList.remove('selected');
    } else {
      selectedStrains.add(index);
      card.classList.add('selected');
    }
    updateSelectedCount();
    updateProcessButton();
  }

  // Update Selected Count
  function updateSelectedCount() {
    const visibleIndexes = strains
      .map((strain, index) => ({ strain, index }))
      .filter(({ strain }) => strain.format === activeFormat)
      .map(({ index }) => index);

    const visibleFreeIndexes = strains
      .map((strain, index) => ({ strain, index }))
      .filter(({ strain }) => strain.format === activeFormat && strain.tier !== 'pro')
      .map(({ index }) => index);

    const visibleSelected = visibleFreeIndexes.filter(index => selectedStrains.has(index)).length;
    const proCount = visibleIndexes.filter(i => strains[i] && strains[i].tier === 'pro').length;
    selectedCount.textContent = proCount > 0
      ? `${visibleSelected} selected \u2022 ${proCount} PRO locked`
      : `${visibleSelected} selected`;

    const allVisibleSelected = visibleFreeIndexes.length > 0 && visibleSelected === visibleFreeIndexes.length;
    selectAllBtn.textContent = allVisibleSelected ? 'Clear Visible' : 'Select All Free';
  }

  function updateFormatCounts() {
    const mp3Total = strains.filter((strain) => strain.format === 'MP3').length;
    const wavTotal = strains.filter((strain) => strain.format === 'WAV').length;
    const totalAvailable = mp3Total + wavTotal;
    const freeTotal = strains.filter((strain) => strain.tier === 'free').length;
    const proTotal = strains.filter((strain) => strain.tier === 'pro').length;

    if (mp3Count) mp3Count.textContent = String(mp3Total);
    if (wavCount) wavCount.textContent = String(wavTotal);
    if (totalCount) totalCount.textContent = String(totalAvailable);
    if (countStatus) {
      countStatus.textContent = totalAvailable > 0
        ? `${freeTotal} free strains ready \u2022 ${proTotal} more in PRO`
        : 'No strain scripts detected in this install';
    }

    const proBadgeText = document.getElementById('pro-badge-text');
    if (proBadgeText) {
      proBadgeText.textContent = proTotal > 0 ? `${proTotal} PRO` : 'PRO';
    }

    const proFomo = document.getElementById('pro-fomo');
    if (proFomo) {
      proFomo.textContent = proTotal > 0
        ? `${proTotal} strains locked behind PRO \u2014 unlock the full pharmacy`
        : '';
    }
  }

  // Update Process Button
  function updateProcessButton() {
    const visibleSelectedCount = getVisibleSelectedStrains().length;
    processBtn.disabled = !audioPath || !outputDir || visibleSelectedCount === 0 || isProcessing;
    if (processAllBtn) {
      processAllBtn.disabled = !audioPath || !outputDir || isProcessing;
    }
  }

  // Setup Audio Drop
  function setupAudioDrop() {
    audioDrop.addEventListener('click', async () => {
      if (isProcessing) return;
      const path = await screwaiApi.selectAudio();
      if (path) {
        audioPath = path;
        sourceAudioFormat = detectAudioFormat(path);
        const fileName = path.split('\\').pop().split('/').pop();
        audioName.textContent = fileName;
        audioDrop.classList.add('has-file');
        syncFormatAvailability();
      }
    });

    // Drag and drop
    audioDrop.addEventListener('dragover', (e) => {
      e.preventDefault();
      audioDrop.classList.add('drag-over');
    });

    audioDrop.addEventListener('dragleave', () => {
      audioDrop.classList.remove('drag-over');
    });

    audioDrop.addEventListener('drop', (e) => {
      e.preventDefault();
      audioDrop.classList.remove('drag-over');
      // Note: In Electron, we'd need to handle this differently
      // For now, user should use click to select
    });
  }

  // Setup Output Select
  function setupOutputSelect() {
    outputBtn.addEventListener('click', async () => {
      if (isProcessing) return;
      const path = await screwaiApi.selectOutput();
      if (path) {
        outputDir = path;
        outputPath.textContent = path;
        outputBtn.classList.add('has-folder');
        updateProcessButton();
      }
    });
  }

  // Setup Select All
  function setupSelectAll() {
    selectAllBtn.addEventListener('click', () => {
      if (isProcessing) return;

      const visibleIndexes = strains
        .map((strain, index) => ({ strain, index }))
        .filter(({ strain }) => strain.format === activeFormat && strain.tier !== 'pro')
        .map(({ index }) => index);

      const allVisibleSelected = visibleIndexes.length > 0 &&
        visibleIndexes.every(index => selectedStrains.has(index));

      if (allVisibleSelected) {
        visibleIndexes.forEach(index => selectedStrains.delete(index));
      } else {
        visibleIndexes.forEach(index => selectedStrains.add(index));
      }

      renderStrains();
      updateSelectedCount();
      updateProcessButton();
    });
  }

  function setupFormatSelect() {
    if (!formatSelect) return;
    formatSelect.value = activeFormat;
    formatSelect.addEventListener('change', () => {
      if (isProcessing) return;
      if (formatSelect.options[formatSelect.selectedIndex]?.disabled) {
        formatSelect.value = activeFormat;
        return;
      }
      activeFormat = formatSelect.value;
      renderStrains();
      updateSelectedCount();
      updateProcessButton();
    });
  }

  function setupConversionSettings() {
    if (mp3ToWavToggle) {
      mp3ToWavToggle.checked = conversionSettings.mp3ToWav;
      mp3ToWavToggle.addEventListener('change', () => {
        conversionSettings.mp3ToWav = mp3ToWavToggle.checked;
        syncFormatAvailability();
      });
    }

    if (wavToMp3Toggle) {
      wavToMp3Toggle.checked = conversionSettings.wavToMp3;
      wavToMp3Toggle.addEventListener('change', () => {
        conversionSettings.wavToMp3 = wavToMp3Toggle.checked;
        syncFormatAvailability();
      });
    }
  }

  function setupProcessAll() {
    if (!processAllBtn) return;
    processAllBtn.addEventListener('click', async () => {
      if (isProcessing || !audioPath || !outputDir) return;

      const visibleIndexes = strains
        .map((strain, index) => ({ strain, index }))
        .filter(({ strain }) => strain.format === activeFormat && strain.tier !== 'pro')
        .map(({ index }) => index);

      visibleIndexes.forEach(index => selectedStrains.add(index));
      renderStrains();
      updateSelectedCount();
      updateProcessButton();

      // Kick off processing immediately
      isProcessing = true;
      processBtn.disabled = true;
      processAllBtn.disabled = true;
      processAllBtn.textContent = 'Running...';
      progressSection.classList.add('active');
      resultsSection.classList.remove('active');

      const selectedStrainData = getVisibleSelectedStrains();
      try {
        const results = await screwaiApi.processAudio({
          audioPath,
          outputDir,
          strains: selectedStrainData
        });
        showResults(results);
      } catch (err) {
        console.error('Process All error:', err);
        currentStrain.textContent = 'Error: ' + err.message;
      }

      isProcessing = false;
      processBtn.disabled = false;
      processAllBtn.disabled = false;
      processAllBtn.textContent = 'Process All';
      progressSection.classList.remove('active');
    });
  }

  function setupTabs() {}

  // View Toggle (grid ↔ vial)
  function setupViewToggle() {
    if (!viewToggleBtn) return;
    applyViewMode();
    viewToggleBtn.addEventListener('click', () => {
      viewMode = viewMode === 'grid' ? 'vial' : 'grid';
      applyViewMode();
      renderStrains();
    });
  }

  function applyViewMode() {
    if (viewMode === 'grid') {
      strainsGrid.classList.add('view-grid');
      strainsGrid.classList.remove('view-vial');
      document.getElementById('view-icon-grid').style.display = 'none';
      document.getElementById('view-icon-vial').style.display = '';
      if (viewToggleBtn) viewToggleBtn.title = 'Switch to vial view';
    } else {
      strainsGrid.classList.remove('view-grid');
      strainsGrid.classList.add('view-vial');
      document.getElementById('view-icon-vial').style.display = 'none';
      document.getElementById('view-icon-grid').style.display = '';
      if (viewToggleBtn) viewToggleBtn.title = 'Switch to card view';
    }
  }

  // Setup Process Button
  function setupProcessButton() {
    processBtn.addEventListener('click', async () => {
      if (isProcessing) return;
      
      isProcessing = true;
      processBtn.disabled = true;
      processBtn.textContent = 'Processing...';
      progressSection.classList.add('active');
      resultsSection.classList.remove('active');
      
      const selectedStrainData = getVisibleSelectedStrains();

      if (selectedStrainData.length === 0) {
        isProcessing = false;
        processBtn.disabled = false;
        processBtn.textContent = 'Process Audio';
        progressSection.classList.remove('active');
        currentStrain.textContent = `No ${activeFormat} strains selected.`;
        updateProcessButton();
        return;
      }
      
      try {
        const results = await screwaiApi.processAudio({
          audioPath,
          outputDir,
          strains: selectedStrainData
        });
        
        showResults(results);
      } catch (err) {
        console.error('Processing error:', err);
        currentStrain.textContent = 'Error: ' + err.message;
      }
      
      isProcessing = false;
      processBtn.disabled = false;
      processBtn.textContent = 'Process Audio';
      progressSection.classList.remove('active');
    });
  }

  // Setup Progress Listener
  function setupProgressListener() {
    screwaiApi.onProgress((data) => {
      progressCount.textContent = `${data.current} / ${data.total}`;
      progressFill.style.width = `${(data.current / data.total) * 100}%`;
      currentStrain.textContent = `Processing: ${data.strain}`;
    });
  }

  function createFallbackStrains() {
    const labelMap = {
      wock: './label/wockheart.png',
      tuss: './label/tuss.png',
      tris: './label/tris.png',
      quali: './label/quagen.png',
      activis: './label/ackt.png',
      akorn: './label/acorn.png',
      hydro: './label/wockheart.png',
      echo: './label/purple_screw.png',
      bass: './label/tuss.png',
      slow: './label/purple_screw.png',
      barre: './label/screwai.png',
      chop: './label/purple_screw.png',
      tape: './label/screwai2.png',
      glide: './label/wocky.png',
      master: './label/screwai2.png',
      default: './label/screwai.png'
    };

    function lbl(icon) { return labelMap[icon] || null; }

    // Dual-format strains: [suffix, displayName, color, icon]
    const dual = [
      ['Activis_BlackGray', 'Activis Black & Gray', '#F59E0B', 'activis'],
      ['Akorn', 'Akorn', '#EAB308', 'akorn'],
      ['Barre', 'Barre', '#22C55E', 'barre'],
      ['Basic_Slow', 'Basic Slow', '#22C55E', 'slow'],
      ['BasicSlow_Default', 'Basic Slow Default', '#10B981', 'slow'],
      ['BasicSlow_EQ', 'Basic Slow EQ', '#84CC16', 'slow'],
      ['BasicSlow_OG', 'Basic Slow OG', '#34D399', 'slow'],
      ['BasicSlow_RB7', 'Basic Slow RB7', '#6EE7B7', 'slow'],
      ['BasicSlow_SLOW', 'Basic Slow SLOW', '#059669', 'slow'],
      ['Bass_Sink', 'Bass Sink', '#F43F5E', 'bass'],
      ['BassBoost_Compression', 'Bass Boost Compression', '#EF4444', 'bass'],
      ['Chopped_Cut', 'Chopped Cut', '#BE185D', 'chop'],
      ['Clean_Glide', 'Clean Glide', '#06B6D4', 'glide'],
      ['Codeine_Glide', 'Codeine Glide', '#7C3AED', 'glide'],
      ['CodeineSway', 'Codeine Sway', '#6D28D9', 'wock'],
      ['Echo_Bass', 'Echo Bass', '#2563EB', 'echo'],
      ['Extreme_Slow', 'Extreme Slow', '#B91C1C', 'slow'],
      ['Filter_Phase', 'Filter Phase', '#A855F7', 'quali'],
      ['HTown_Float', 'H-Town Float', '#BE185D', 'glide'],
      ['HydroSyrp', 'Hydro Syrp', '#06B6D4', 'hydro'],
      ['Late_Night', 'Late Night', '#3B82F6', 'echo'],
      ['Lean_Drift', 'Lean Drift', '#8B5CF6', 'glide'],
      ['Lean_Tris', 'Lean Tris', '#BE185D', 'tris'],
      ['Mastering', 'Mastering', '#0EA5E9', 'master'],
      ['Midnight_Tint', 'Midnight Tint', '#1E40AF', 'echo'],
      ['MildlySlowed', 'Mildly Slowed', '#10B981', 'slow'],
      ['Night_Ride', 'Night Ride', '#1D4ED8', 'echo'],
      ['Phonk_Shadow', 'Phonk Shadow', '#C084FC', 'slow'],
      ['Purple_Wave', 'Purple Wave', '#6D28D9', 'wock'],
      ['Quali_Blue', 'Quali Blue', '#3B82F6', 'quali'],
      ['Screw_08_Wide', 'Screw 0.8 Wide', '#7C3AED', 'slow'],
      ['Screw_Loud', 'Screw Loud', '#9333EA', 'slow'],
      ['ScrewAI_Tris_Pink', 'ScrewAI Tris Pink', '#BE185D', 'tris'],
      ['ScrewAI_Tuss_Red', 'ScrewAI Tuss Red', '#B91C1C', 'tuss'],
      ['Screwed_Echo_Bass', 'Screwed Echo Bass', '#2563EB', 'echo'],
      ['Slab_Cruise', 'Slab Cruise', '#9F1239', 'slow'],
      ['Slow_Burn', 'Slow Burn', '#B91C1C', 'slow'],
      ['Slow_Echo', 'Slow Echo', '#2563EB', 'echo'],
      ['Tape_Melt', 'Tape Melt', '#F59E0B', 'tape'],
      ['Tris_Pink', 'Tris Pink', '#BE185D', 'tris'],
      ['Trunk_Flex', 'Trunk Flex', '#F43F5E', 'bass'],
      ['Trunk_Pressure', 'Trunk Pressure', '#E11D48', 'bass'],
      ['Tuss_Red', 'Tuss Red', '#B91C1C', 'tuss'],
      ['Vinyl_Static', 'Vinyl Static', '#FBBF24', 'tape'],
      ['Wock_Purple', 'Wock Purple', '#6D28D9', 'wock']
    ];

    const strains = [];

    dual.forEach(([suffix, name, color, icon]) => {
      const labelImg = lbl(icon);
      strains.push({ file: `mp3${suffix}.bat`, name, format: 'MP3', color, icon, labelImg, tier: 'pro' });
      strains.push({ file: `mWav${suffix}.bat`, name, format: 'WAV', color, icon, labelImg, tier: 'pro' });
    });

    // MP3-only strains: [file, displayName, color, icon]
    [
      ['mp3outRUBBERBAND07.bat', 'Rubberband 0.7', '#0EA5E9', 'slow'],
      ['mp3SlowDown+Bass_Boost+LUFS.bat', 'Slow Down + Bass + LUFS', '#EF4444', 'bass'],
      ['mp3StereoWiden_Reverb.bat', 'Stereo Widen Reverb', '#2563EB', 'echo'],
      ['mp3widen_reverb_tris_quali.bat', 'Widen Reverb Tris Quali', '#BE185D', 'tris']
    ].forEach(([file, name, color, icon]) => {
      strains.push({ file, name, format: 'MP3', color, icon, labelImg: lbl(icon), tier: 'pro' });
    });

    // WAV-only strains: [file, displayName, color, icon]
    [
      ['mWavExtra_Stereo.bat', 'Extra Stereo', '#2563EB', 'echo'],
      ['mWavFirEqualizer.bat', 'FIR Equalizer', '#3B82F6', 'quali'],
      ['mWavHalfScrew_OG.bat', 'Half Screw OG', '#7C3AED', 'slow'],
      ['mWavHalfScrew_Slow.bat', 'Half Screw Slow', '#8B5CF6', 'slow'],
      ['mWavHalfScrew_Slower.bat', 'Half Screw Slower', '#6D28D9', 'slow'],
      ['mWavLimiter.bat', 'Limiter', '#0EA5E9', 'master'],
      ['mWavSlow_80c_VocalPresence.bat', 'Slow 80c Vocal Presence', '#10B981', 'slow'],
      ['mWavSlowMoe.bat', 'Slow Moe', '#22C55E', 'slow']
    ].forEach(([file, name, color, icon]) => {
      strains.push({ file, name, format: 'WAV', color, icon, labelImg: lbl(icon), tier: 'pro' });
    });

    // Free Extras — Audio (dual-format): [batName, displayName, color, icon]
    [
      ['Acktavist', 'Acktavist', '#F59E0B', 'activis'],
      ['BabySlow', 'Baby Slow', '#10B981', 'slow'],
      ['ChopSuey', 'Chop Suey', '#BE185D', 'chop'],
      ['CodeineCorridor', 'Codeine Corridor', '#7C3AED', 'wock'],
      ['CodeineDreams', 'Codeine Dreams', '#6D28D9', 'wock'],
      ['DirtySpriteNod', 'Dirty Sprite Nod', '#84CC16', 'slow'],
      ['DoubleCup3d', 'Double Cup 3D', '#C084FC', 'wock'],
      ['GhostChop', 'Ghost Chop', '#BE185D', 'chop'],
      ['LeaningTower', 'Leaning Tower', '#8B5CF6', 'wock'],
      ['LeanSpeakerPhone', 'Lean Speaker Phone', '#9333EA', 'wock'],
      ['ManeHOLDUP', 'Mane HOLDUP', '#F43F5E', 'bass'],
      ['MoveAround', 'Move Around', '#0EA5E9', 'slow'],
      ['MuddyWock', 'Muddy Wock', '#6D28D9', 'wock'],
      ['NeonRainfall', 'Neon Rainfall', '#06B6D4', 'echo'],
      ['OGscrew', 'OG Screw', '#7C3AED', 'slow'],
      ['PurpleDungeon', 'Purple Dungeon', '#6D28D9', 'wock'],
      ['ScrewAI_Barre', 'ScrewAI Barre', '#22C55E', 'barre'],
      ['SlowMoStan', 'Slow Mo Stan', '#10B981', 'slow'],
      ['StyrofoamCup', 'Styrofoam Cup', '#C084FC', 'wock'],
      ['Triss', 'Triss', '#BE185D', 'tris'],
      ['TrissVortex', 'Triss Vortex', '#EC4899', 'tris'],
      ['Tuss', 'Tuss', '#B91C1C', 'tuss'],
      ['WideVerb', 'Wide Verb', '#2563EB', 'echo'],
      ['Wock', 'Wock', '#6D28D9', 'wock']
    ].forEach(([batName, displayName, color, icon]) => {
      const labelImg = lbl(icon);
      strains.push({ file: `${batName}.bat`, name: displayName, format: 'MP3', color, icon, labelImg, tier: 'free' });
      strains.push({ file: `${batName}.bat`, name: displayName, format: 'WAV', color, icon, labelImg, tier: 'free' });
    });

    // Free Extras — Ambient Effects (WAV): [file, displayName, color, icon]
    [
      ['AnalogWarmth.bat', 'Analog Warmth', '#F59E0B', 'tape'],
      ['ClarityBoost.bat', 'Clarity Boost', '#3B82F6', 'quali'],
      ['HollowTrap.bat', 'Hollow Trap', '#0EA5E9', 'echo'],
      ['OilSpill.bat', 'Oil Spill', '#6D28D9', 'wock'],
      ['PunchyLoud.bat', 'Punchy Loud', '#F43F5E', 'bass'],
      ['ShimmerClean.bat', 'Shimmer Clean', '#06B6D4', 'quali'],
      ['SpacedOut.bat', 'Spaced Out', '#2563EB', 'echo'],
      ['TapeFat.bat', 'Tape Fat', '#EAB308', 'tape'],
      ['VinylDust.bat', 'Vinyl Dust', '#FBBF24', 'tape'],
      ['WidenedSauce.bat', 'Widened Sauce', '#84CC16', 'echo']
    ].forEach(([file, name, color, icon]) => {
      strains.push({ file, name, format: 'WAV', color, icon, labelImg: lbl(icon), tier: 'free' });
    });

    // Free Extras — Studio Effects (WAV): [file, displayName, color, icon]
    [
      ['allinone.bat', 'All In One', '#0EA5E9', 'master'],
      ['bass_boost.bat', 'Bass Boost', '#F43F5E', 'bass'],
      ['chorus.bat', 'Chorus', '#C084FC', 'echo'],
      ['distortion.bat', 'Distortion', '#B91C1C', 'bass'],
      ['echo.bat', 'Echo', '#2563EB', 'echo'],
      ['flanger.bat', 'Flanger', '#06B6D4', 'echo'],
      ['master.bat', 'Master', '#0EA5E9', 'master'],
      ['quali.bat', 'Quali', '#3B82F6', 'quali'],
      ['reverb.bat', 'Reverb', '#2563EB', 'echo'],
      ['reverse+echo+limiter.bat', 'Reverse Echo Limiter', '#1D4ED8', 'echo'],
      ['stereo_widen.bat', 'Stereo Widen', '#06B6D4', 'echo'],
      ['tremolo.bat', 'Tremolo', '#BE185D', 'slow'],
      ['vhs.bat', 'VHS', '#F59E0B', 'tape'],
      ['vinyl.bat', 'Vinyl', '#FBBF24', 'tape']
    ].forEach(([file, name, color, icon]) => {
      strains.push({ file, name, format: 'WAV', color, icon, labelImg: lbl(icon), tier: 'free' });
    });

    return strains;
  }

  // Show Results
  function showResults(results) {
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    resultsList.innerHTML = `
      Successfully processed: ${successful}<br>
      ${failed > 0 ? `Failed: ${failed}` : ''}
      <br><br>
      Files saved to:<br>
      <span style="color: var(--accent)">${outputDir}</span>
    `;
    
    resultsSection.classList.add('active');
  }

  // Start
  init();
})();
