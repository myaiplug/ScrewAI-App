const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow;

// Force Chromium caches into a writable location to prevent cache_util_win access errors.
const appDataRoot = process.env.APPDATA || app.getPath('appData');
const screwaiDataRoot = path.join(appDataRoot, 'ScrewAI Pro');
const screwaiCacheRoot = path.join(screwaiDataRoot, 'Cache');

try {
  fs.mkdirSync(screwaiDataRoot, { recursive: true });
  fs.mkdirSync(screwaiCacheRoot, { recursive: true });
  app.setPath('userData', screwaiDataRoot);
  app.setPath('sessionData', screwaiDataRoot);
  app.setPath('cache', screwaiCacheRoot);
} catch (err) {
  console.warn('Failed to set custom app data/cache paths:', err.message);
}

function resolveFfmpegPath() {
  const bundledPath = app.isPackaged
    ? path.join(process.resourcesPath, 'ffmpeg', 'ffmpeg.exe')
    : path.join(__dirname, 'build-resources', 'ffmpeg', 'ffmpeg.exe');

  const candidates = [
    bundledPath,
    'C:\\ffmpeg\\bin\\ffmpeg.exe'
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return 'ffmpeg';
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 1144,
    minWidth: 1320,
    minHeight: 1144,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'screwai.ico')
  });

  mainWindow.loadFile('index.html');
  
  // Uncomment for dev tools
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Window controls
ipcMain.on('minimize-window', () => mainWindow.minimize());
ipcMain.on('maximize-window', () => {
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
});
ipcMain.on('close-window', () => mainWindow.close());

// Get available strains (batch files)
ipcMain.handle('get-strains', async () => {
  const strainsDir = app.isPackaged 
    ? path.join(process.resourcesPath, 'strains')
    : path.join(__dirname, '..');
    
  try {
    const files = fs.readdirSync(strainsDir);
    const batFiles = files.filter(f => f.endsWith('.bat') && !f.includes('ScrewAI_Pro'));
    
    return batFiles.map(file => {
      const name = file.replace('.bat', '');
      const isWav = name.startsWith('mWav') || name.startsWith('Wav');
      const displayName = name.replace(/^(mp3|mWav|Wav)/, '').replace(/_/g, ' ');
      
      // Assign colors and icons based on strain names
      let color = '#0EA5E9';
      let icon = 'default';
      const lowerName = name.toLowerCase();
      const isBracketSlow = lowerName.includes('[slow]');
      
      if (isBracketSlow) {
        // [Slow] presets — rich purples, reds, reddish-purples
        if (lowerName.includes('purple') || lowerName.includes('wave')) {
          color = '#7C3AED'; icon = 'slow'; // deep violet
        } else if (lowerName.includes('phonk') || lowerName.includes('shadow')) {
          color = '#C084FC'; icon = 'slow'; // light lavender purple
        } else if (lowerName.includes('vinyl') || lowerName.includes('tape') || lowerName.includes('melt')) {
          color = '#F59E0B'; icon = 'slow';
        } else if (lowerName.includes('codeine') || lowerName.includes('lean') || lowerName.includes('screw')) {
          color = '#25D0C3'; icon = 'slow';
        } else if (lowerName.includes('trunk') || lowerName.includes('burn')) {
          color = '#B91C1C'; icon = 'slow'; // deep crimson
        } else if (lowerName.includes('bass') || lowerName.includes('sink')) {
          color = '#F43F5E'; icon = 'slow'; // rose-red
        } else if (lowerName.includes('slab') || lowerName.includes('cruise')) {
          color = '#9F1239'; icon = 'slow'; // dark wine-red
        } else if (lowerName.includes('night') || lowerName.includes('midnight') || lowerName.includes('late')) {
          color = '#3B82F6'; icon = 'slow';
        } else if (lowerName.includes('clean') || lowerName.includes('basic') || lowerName.includes('mildly')) {
          color = '#10B981'; icon = 'slow';
        } else if (lowerName.includes('filter') || lowerName.includes('phase')) {
          color = '#A855F7'; icon = 'slow'; // mid purple
        } else if (lowerName.includes('htown') || lowerName.includes('float')) {
          color = '#BE185D'; icon = 'slow'; // reddish-purple / magenta
        } else if (lowerName.includes('yellow') || lowerName.includes('golden') || lowerName.includes('lemon')) {
          color = '#FBBF24'; icon = 'slow'; // amber yellow
        } else if (lowerName.includes('green') || lowerName.includes('lime')) {
          color = '#84CC16'; icon = 'slow'; // lime green
        } else if (lowerName.includes('sky') || lowerName.includes('cyan') || lowerName.includes('aqua')) {
          color = '#06B6D4'; icon = 'slow'; // cyan blue
        } else {
          color = '#0EA5E9'; icon = 'slow'; // blue fallback for better variety
        }
      } else if (name.includes('Purple') || name.includes('Wock')) {
        color = '#6D28D9'; icon = 'wock';  // deep grape purple
      } else if (name.includes('Pink') || name.includes('Tris')) {
        color = '#BE185D'; icon = 'tris';  // reddish-purple / wine magenta
      } else if (name.includes('Red') || name.includes('Tuss')) {
        color = '#B91C1C'; icon = 'tuss';  // deep crimson red
      } else if (name.includes('Blue') || name.includes('Quali')) {
        color = '#3B82F6'; icon = 'quali';
      } else if (name.includes('Black') || name.includes('Gray') || name.includes('Activis')) {
        color = '#F59E0B'; icon = 'activis'; // amber/orange
      } else if (name.includes('Akorn')) {
        color = '#EAB308'; icon = 'akorn';  // golden yellow
      } else if (name.includes('Barre')) {
        color = '#22C55E'; icon = 'barre';  // vibrant green
      } else if (name.includes('Hydro') || name.includes('Syrp')) {
        color = '#06B6D4'; icon = 'hydro';  // cyan
      } else if (name.includes('Bass') || name.includes('Compression')) {
        color = '#F43F5E'; icon = 'bass';
      } else if (name.includes('Chopped') || name.includes('Chop') || name.includes('Ghost')) {
        color = '#BE185D'; icon = 'chop';
      } else if (name.includes('Tape') || name.includes('VHS') || name.includes('Vinyl') || name.includes('Analog')) {
        color = '#F59E0B'; icon = 'tape';
      } else if (name.includes('Glide') || name.includes('Float')) {
        color = '#06B6D4'; icon = 'glide';
      } else if (name.includes('Master') || name.includes('Limiter') || name.includes('Loudness')) {
        color = '#0EA5E9'; icon = 'master';
      } else if (name.includes('Echo')) {
        color = '#2563EB'; icon = 'echo';  // royal blue
      } else if (name.includes('Slow') || name.includes('Basic') || name.includes('Extreme')) {
        color = '#22C55E'; icon = 'slow';  // green
      } else if (name.includes('Choose')) {
        color = '#0EA5E9'; icon = 'choose';  // bright sky blue
      } else if (lowerName.includes('yellow') || lowerName.includes('golden') || lowerName.includes('lemon')) {
        color = '#FBBF24'; icon = 'slow';  // amber yellow
      } else if (lowerName.includes('green') || lowerName.includes('lime')) {
        color = '#84CC16'; icon = 'slow';  // lime green
      } else if (lowerName.includes('sky') || lowerName.includes('cyan') || lowerName.includes('aqua')) {
        color = '#06B6D4'; icon = 'slow';  // cyan blue
      }
      
      // Balanced label + color pool for generic strains — distributed evenly
      const labelPool = [
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

      const seed = file.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

      // Balanced 12-color wheel: 3 purple, 2 red, 2 blue, 2 green, 2 yellow, 1 teal
      const genericColorPool = [
        '#7C3AED', // deep violet
        '#B91C1C', // crimson red
        '#3B82F6', // blue
        '#C084FC', // lavender purple
        '#22C55E', // green
        '#F59E0B', // amber
        '#A855F7', // mid purple
        '#F43F5E', // rose red
        '#0EA5E9', // sky blue
        '#84CC16', // lime
        '#EAB308', // yellow
        '#6D28D9', // grape purple
      ];

      // Apply seed-based color for non-brand strains
      if (color === '#0EA5E9') {
        color = genericColorPool[seed % genericColorPool.length];
      }
      // Slow/Basic/Extreme/Echo strains: distribute across palette instead of all-green/blue
      if (icon === 'slow' || icon === 'echo' || icon === 'choose') {
        color = genericColorPool[seed % genericColorPool.length];
      }

      let labelImg = null;
      if (icon === 'wock') labelImg = './label/wockheart.png';
      else if (icon === 'tuss') labelImg = './label/tuss.png';
      else if (icon === 'tris') labelImg = './label/tris.png';
      else if (icon === 'quali') labelImg = './label/quagen.png';
      else if (icon === 'activis') labelImg = './label/ackt.png';
      else if (icon === 'akorn') labelImg = './label/acorn.png';
      else if (icon === 'hydro') labelImg = './label/wockheart.png';
      else if (icon === 'echo') labelImg = './label/purple_screw.png';
      else if (icon === 'chop') labelImg = './label/purple_screw.png';
      else if (icon === 'tape') labelImg = './label/screwai2.png';
      else if (icon === 'glide') labelImg = './label/wocky.png';
      else if (icon === 'master') labelImg = './label/screwai2.png';
      else if (icon === 'barre') labelImg = './label/screwai.png';

      if (!labelImg) {
        labelImg = labelPool[seed % labelPool.length];
      }

      const freeFileNames = [
        'Acktavist', 'BabySlow', 'ChopSuey', 'CodeineCorridor', 'CodeineDreams',
        'DirtySpriteNod', 'DoubleCup3d', 'GhostChop', 'LeaningTower',
        'LeanSpeakerPhone', 'ManeHOLDUP', 'MoveAround', 'MuddyWock',
        'NeonRainfall', 'OGscrew', 'PurpleDungeon', 'ScrewAI_Barre',
        'SlowMoStan', 'StyrofoamCup', 'Triss', 'TrissVortex', 'Tuss',
        'WideVerb', 'Wock',
        'AnalogWarmth', 'ClarityBoost', 'HollowTrap', 'OilSpill',
        'PunchyLoud', 'ShimmerClean', 'SpacedOut', 'TapeFat',
        'VinylDust', 'WidenedSauce',
        'allinone', 'bass_boost', 'chorus', 'distortion', 'echo',
        'flanger', 'master', 'quali', 'reverb', 'reverse+echo+limiter',
        'stereo_widen', 'tremolo', 'vhs', 'vinyl'
      ];
      const baseName = name.replace(/^(mp3|mWav|Wav)/, '');
      const isFree = freeFileNames.some(fn => baseName === fn || lowerName === fn.toLowerCase());

      return {
        file,
        name: displayName,
        format: isWav ? 'WAV' : 'MP3',
        color,
        icon,
        labelImg,
        tier: isFree ? 'free' : 'pro',
        path: path.join(strainsDir, file)
      };
    });
  } catch (err) {
    console.error('Error reading strains:', err);
    return [];
  }
});

// Select audio file
ipcMain.handle('select-audio', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Audio File',
    filters: [
      { name: 'Audio Files', extensions: ['mp3', 'wav', 'flac', 'm4a', 'ogg'] }
    ],
    properties: ['openFile']
  });
  
  if (result.canceled) return null;
  return result.filePaths[0];
});

// Select output folder
ipcMain.handle('select-output', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Output Folder',
    properties: ['openDirectory', 'createDirectory']
  });
  
  if (result.canceled) return null;
  return result.filePaths[0];
});

// Process audio through selected strains
ipcMain.handle('process-audio', async (event, { audioPath, outputDir, strains }) => {
  const results = [];
  const audioName = path.basename(audioPath, path.extname(audioPath));
  
  for (let i = 0; i < strains.length; i++) {
    const strain = strains[i];
    const strainName = strain.file.replace('.bat', '').replace(/^(mp3|Wav)/, '');
    const outputExt = strain.format === 'WAV' ? '.wav' : '.mp3';
    const outputPath = path.join(outputDir, `${audioName}_ScrewAI_${strainName}${outputExt}`);
    
    // Send progress
    mainWindow.webContents.send('process-progress', {
      current: i + 1,
      total: strains.length,
      strain: strain.name,
      status: 'processing'
    });
    
    try {
      await runBatchFile(strain.path, audioPath, outputPath);
      results.push({ strain: strain.name, success: true, output: outputPath });
    } catch (err) {
      results.push({ strain: strain.name, success: false, error: err.message });
    }
  }
  
  return results;
});

function runBatchFile(batPath, inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    // Read the batch file to extract ffmpeg commands
    const batContent = fs.readFileSync(batPath, 'utf-8');
    const lines = batContent.split('\n').filter(l => l.trim() && !l.startsWith('@'));
    
    // Parse and execute ffmpeg commands
    const outputDir = path.dirname(outputPath);
    const tempDir = path.join(outputDir, '.screwai_temp');
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Build ffmpeg command from batch content
    let filters = [];
    let hasEcho = false;
    let hasBass = false;
    let setRate = '';
    let tempo = '';
    
    for (const line of lines) {
      if (line.includes('asetrate')) {
        const match = line.match(/asetrate=[\d.]+\*?([\d.]+)?/);
        if (match) {
          const rate = match[0];
          setRate = rate;
        }
      }
      if (line.includes('aresample')) {
        filters.push('aresample=44100');
      }
      if (line.includes('atempo')) {
        const match = line.match(/atempo=([\d.]+)/);
        if (match) tempo = `atempo=${match[1]}`;
      }
      if (line.includes('aecho')) {
        const match = line.match(/aecho=[^,\s"]+/);
        if (match) {
          hasEcho = true;
          filters.push(match[0]);
        }
      }
      if (line.includes('bass=')) {
        const match = line.match(/bass=g=[\d.]+/);
        if (match) {
          hasBass = true;
          filters.push(match[0]);
        }
      }
    }
    
    // Construct the full filter chain
    let filterChain = [];
    if (setRate) filterChain.push(setRate);
    filterChain.push('aresample=44100');
    if (tempo) filterChain.push(tempo);
    if (hasEcho) filterChain = filterChain.concat(filters.filter(f => f.startsWith('aecho')));
    if (hasBass) filterChain = filterChain.concat(filters.filter(f => f.startsWith('bass')));
    
    const filterString = filterChain.join(',');
    const ext = path.extname(outputPath).toLowerCase();
    
    const args = [
      '-y',
      '-i', inputPath,
      '-af', filterString || 'asetrate=44100*0.85,aresample=44100,atempo=1.0',
      '-ar', '44100'
    ];
    
    if (ext === '.mp3') {
      args.push('-c:a', 'libmp3lame', '-q:a', '2');
    } else {
      args.push('-c:a', 'pcm_s16le');
    }
    
    args.push(outputPath);
    
    const ffmpegBinary = resolveFfmpegPath();
    const ffmpeg = spawn(ffmpegBinary, args);
    
    let stderr = '';
    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    ffmpeg.on('close', (code) => {
      // Clean up temp directory
      try {
        if (fs.existsSync(tempDir)) {
          fs.rmSync(tempDir, { recursive: true });
        }
      } catch (e) {}
      
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });
    
    ffmpeg.on('error', (err) => {
      if (err.code === 'ENOENT') {
        reject(new Error('FFmpeg was not found. Rebuild the installer so it bundles FFmpeg, or install FFmpeg locally.'));
        return;
      }
      reject(err);
    });
  });
}
