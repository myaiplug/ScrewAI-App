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
  let browserAudioFile = null; // File object for browser mode
  let browserAudioBuffer = null; // decoded AudioBuffer for browser mode
  let isBrowser = false; // true when running outside Electron
  let isPro = localStorage.getItem('screwai_pro') === 'true';
  let wasDragged = false;
  let platformName = 'Web';
  let isApple = /iPhone|iPad|iPod|Macintosh|MacIntel|MacPPC|Mac68K|Apple/.test(navigator.userAgent);

  const FREE_SELECTION_LIMIT = 1;
  const PRO_SELECTION_LIMIT = 10;

  // ── Web Audio Effect Profiles ──
  const WA = {
    // [slowdown, eqBands, {modulation}, stereoWiden]
    // eq: [freq, gain, Q][]
    // modulation: {tremolo:[rate,depth], vibrato:[rate,depth], phaser:[rate,depth], echo:[delay,decay,mix]}

    bassHeavy:  { slowdown:0.85, eq:[[45,6,1.2],[110,3.8,1.2],[1000,-3,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, stereoWiden:1 },
    trunkRattle:{ slowdown:0.9,  eq:[[50,5,1.2],[120,3.5,1.2],[700,-2,1],[3000,-2.5,1],[8500,1.8,1.1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, tremolo:[0.9,0.55], stereoWiden:1.25 },
    trunkPress: { slowdown:0.89, eq:[[50,4.5,1.2],[130,3.2,1.2],[750,-1.8,1],[3200,-2.2,1],[9000,1.5,1.1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, tremolo:[1.2,0.45], stereoWiden:1.2 },
    codeineSway:{ slowdown:0.93, eq:[[75,3.2,1.1],[140,2.3,1.2],[600,-1.5,1],[2800,-1.6,1],[9800,2.4,1.1]], lowpass:8500, highpass:28, lowpass2:18500, compressor:true, limiter:-0.3, normalize:-14, vibrato:[0.35,0.12], phaser:[0.2,0.3], stereoWiden:1.1 },
    codeineGlide:{slowdown:0.92, eq:[[80,3,1.1],[150,2,1.2],[700,-1.2,1],[3000,-1.5,1],[9500,2,1.1]], lowpass:9000, highpass:28, lowpass2:18500, compressor:true, limiter:-0.3, normalize:-14, phaser:[0.15,0.25], stereoWiden:1.1 },
    leanDrift: { slowdown:0.94, eq:[[70,3,1.1],[110,2,1.2],[650,-1.2,1],[3200,-1.8,1],[9200,2.2,1.1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, tremolo:[1.6,0.28], stereoWiden:1.15 },
    choppedCut: { slowdown:0.87, eq:[[60,4.5,1.2],[1200,-2.5,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, tremolo:[3,0.18], echo:[0.23,0.28,0.7] },
    chopSuey:   { slowdown:0.86, eq:[[55,4,1.2],[1500,-2,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, tremolo:[2.5,0.2], echo:[0.18,0.22,0.65] },
    slowBurn:   { slowdown:0.78, eq:[[60,3.5,1.2],[200,2.5,1.2],[500,-1.5,1],[4000,-2,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, tremolo:[0.5,0.15] },
    extreme:    { slowdown:0.65, eq:[[80,3,1.2],[300,2,1],[2000,-1.5,1]], highpass:28, lowpass:16000, compressor:true, limiter:-0.3, normalize:-14 },
    basicSlow:  { slowdown:0.85, eq:[[100,2,1],[2000,-1,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14 },
    mildSlow:   { slowdown:0.88, eq:[[120,1.5,1],[1500,-0.5,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14 },
    basicDef:   { slowdown:0.88, eq:[[100,1.5,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14 },
    basicEQ:    { slowdown:0.85, eq:[[60,2.5,1.2],[4000,-1.5,1],[10000,2,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14 },
    basicOG:    { slowdown:0.85, eq:[[80,2,1.2]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14 },
    basicSlowSlow:{slowdown:0.82, eq:[[100,2,1],[2000,-1,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14 },
    tapeMelt:   { slowdown:0.88, eq:[[200,3,1.2],[3000,-2.5,1],[8000,-3,1],[12000,1.5,1]], highpass:40, lowpass:14000, compressor:true, limiter:-0.3, normalize:-14, vibrato:[0.2,0.08], stereoWiden:0.85 },
    vinylStatic:{ slowdown:0.86, eq:[[150,2.5,1],[2500,-2,1],[7000,-3.5,1],[11000,2,1]], highpass:50, lowpass:13500, compressor:true, limiter:-0.3, normalize:-14, vibrato:[0.15,0.05], stereoWiden:0.8 },
    tapeFat:    { slowdown:0.87, eq:[[80,3,1.2],[300,2,1.2],[5000,-2,1]], highpass:30, lowpass:16000, compressor:true, limiter:-0.3, normalize:-14, stereoWiden:0.9 },
    analogWarm: { slowdown:0.9,  eq:[[100,2.5,1],[500,1.5,1],[6000,-2,1]], highpass:30, lowpass:16500, compressor:true, limiter:-0.3, normalize:-14, stereoWiden:0.9 },
    vhs:        { slowdown:0.84, eq:[[200,3,1],[3000,-3,1],[8000,-4,1]], highpass:50, lowpass:12000, compressor:true, limiter:-0.3, normalize:-14, vibrato:[0.3,0.1], stereoWiden:0.7 },
    lateNight:  { slowdown:0.9,  eq:[[60,2.5,1.2],[250,1.5,1],[2000,-2,1],[8000,-2.5,1],[12000,2,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, echo:[0.35,0.2,0.4] },
    midnightTint:{slowdown:0.88, eq:[[50,3,1.2],[200,2.5,1],[3000,-2,1],[10000,-1.5,1]], highpass:28, lowpass:18000, compressor:true, limiter:-0.3, normalize:-14, echo:[0.4,0.18,0.35] },
    nightRide:  { slowdown:0.89, eq:[[80,2.5,1.2],[300,2,1],[1500,-2,1],[7500,-2,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, echo:[0.3,0.25,0.45], tremolo:[0.4,0.12] },
    echoBass:   { slowdown:0.86, eq:[[50,4,1.2],[120,3,1.2],[2000,-2.5,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, echo:[0.25,0.35,0.75] },
    slowEcho:   { slowdown:0.84, eq:[[80,2,1.2],[3000,-1.5,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, echo:[0.3,0.3,0.65] },
    slabCruise: { slowdown:0.9,  eq:[[60,3,1.2],[250,2,1],[1500,-1.5,1],[5000,-1.5,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, tremolo:[0.6,0.2], stereoWiden:1.1 },
    htownFloat: { slowdown:0.91, eq:[[65,3,1.2],[130,2.5,1],[800,-1.5,1],[3500,-2,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, phaser:[0.1,0.2], stereoWiden:1.15 },
    cleanGlide: { slowdown:0.92, eq:[[100,2,1.1],[500,1.5,1],[3000,-1.5,1],[10000,1.5,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, stereoWiden:1.05 },
    purpleWave: { slowdown:0.88, eq:[[70,3.5,1.2],[150,2.5,1.2],[600,-1.5,1],[4000,-2,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, phaser:[0.12,0.22], stereoWiden:1.1 },
    phonkShadow:{ slowdown:0.84, eq:[[50,4,1.2],[120,3,1.2],[800,-2.5,1],[4000,-3,1],[10000,2,1]], highpass:28, lowpass:17500, compressor:true, limiter:-0.3, normalize:-14, tremolo:[1.8,0.15], stereoWiden:1.2 },
    filterPhase:{ slowdown:0.86, eq:[[60,3,1.2],[250,2,1],[1200,-2,1],[5000,-2.5,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, phaser:[0.25,0.35], stereoWiden:1.1 },
    screwLoud:  { slowdown:0.82, eq:[[80,3.5,1.2],[200,2.5,1],[1000,-2,1],[6000,-1.5,1],[14000,2,1]], highpass:28, lowpass:19000, compressor:true, limiter:-0.3, normalize:-14, stereoWiden:1.3 },
    screwWide:  { slowdown:0.8,  eq:[[100,2,1.2],[2000,-1.5,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, stereoWiden:1.5, echo:[0.15,0.12,0.35] },
    wock:       { slowdown:0.85, eq:[[80,3.5,1.2],[200,2.5,1],[600,-1.5,1],[3000,-2,1],[10000,2,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, echo:[0.15,0.2,0.4] },
    tuss:       { slowdown:0.88, eq:[[70,3,1.2],[150,2,1],[800,-2,1],[5000,-2.5,1],[12000,2.5,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, tremolo:[0.8,0.2] },
    tris:       { slowdown:0.87, eq:[[90,3,1.2],[180,2.5,1],[700,-1.5,1],[4000,-2,1],[11000,2,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, phaser:[0.18,0.28] },
    quali:      { slowdown:0.86, eq:[[100,2.5,1.1],[250,2,1],[1000,-1.5,1],[6000,-2,1],[14000,2.5,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, echo:[0.12,0.15,0.3] },
    activis:    { slowdown:0.85, eq:[[60,3.5,1.2],[180,2,1],[900,-1.8,1],[5000,-2,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, tremolo:[1.2,0.18] },
    akorn:      { slowdown:0.88, eq:[[80,3,1.2],[220,2,1],[1000,-2,1],[8000,1.5,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, vibrato:[0.3,0.08] },
    barre:      { slowdown:0.85, eq:[[100,2.5,1],[250,2,1],[3000,-2,1],[12000,2,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, stereoWiden:1.15 },
    hydro:      { slowdown:0.87, eq:[[70,3,1.2],[300,2.5,1],[2000,-1.5,1],[10000,1.5,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, echo:[0.2,0.18,0.5], phaser:[0.22,0.2] },
    halfScrew:  { slowdown:0.5,  eq:[[100,3,1],[2000,-1.5,1]], highpass:28, lowpass:18000, compressor:true, limiter:-0.3, normalize:-14 },
    slowMoe:    { slowdown:0.55, eq:[[80,2.5,1],[300,2,1],[3000,-2,1]], highpass:28, lowpass:18000, compressor:true, limiter:-0.3, normalize:-14 },
    extraStereo:{ slowdown:1,    eq:[], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, stereoWiden:1.8 },
    master:     { slowdown:1,    eq:[[60,2,1.2],[300,1.5,1],[6000,-1.5,1],[12000,2,1]], highpass:28, lowpass:20000, compressor:true, limiter:-0.1, normalize:-13 },
    hollowTrap: { slowdown:0.88, eq:[[50,4,1.2],[200,3,1.2],[3000,-3,1],[10000,2,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, echo:[0.28,0.22,0.6] },
    oilSpill:   { slowdown:0.82, eq:[[60,3.5,1.2],[250,2,1],[2000,-2.5,1],[8000,-3,1]], highpass:30, lowpass:16000, compressor:true, limiter:-0.3, normalize:-14, vibrato:[0.25,0.1], stereoWiden:0.8 },
    spacedOut:  { slowdown:0.9,  eq:[[80,2,1],[500,1.5,1],[3000,-1.5,1],[10000,1.5,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, echo:[0.45,0.3,0.55] },
    wideVerb:   { slowdown:0.88, eq:[], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, echo:[0.5,0.35,0.5], stereoWiden:1.5 },
    shimmer:    { slowdown:0.92, eq:[[200,2,1],[5000,2.5,1],[10000,3,1],[15000,2.5,1]], highpass:40, lowpass:20000, compressor:true, limiter:-0.3, normalize:-14, stereoWiden:1.2 },
    punchy:     { slowdown:0.85, eq:[[60,4,1.2],[200,3,1.2],[2000,-2.5,1],[8000,-1.5,1]], highpass:28, lowpass:19000, compressor:true, limiter:-0.2, normalize:-13, stereoWiden:1.1 },
    babySlow:   { slowdown:0.82, eq:[[80,2,1.2],[300,1.5,1],[3000,-1.5,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14 },
    dirtySprite:{ slowdown:0.86, eq:[[60,3,1.2],[250,2,1],[2000,-2,1],[9000,1.5,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, echo:[0.2,0.25,0.55] },
    doubleCup:  { slowdown:0.84, eq:[[70,3.5,1.2],[150,2.5,1],[800,-1.5,1],[5000,-2,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, phaser:[0.2,0.25], stereoWiden:1.15 },
    neonRainfall:{slowdown:0.87, eq:[[40,3.5,1.2],[120,2.5,1],[3000,-2,1],[10000,3,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, echo:[0.4,0.28,0.5], tremolo:[0.3,0.1] },
    purpleDungeon:{slowdown:0.83, eq:[[60,4,1.2],[150,3,1.2],[700,-2,1],[4000,-2.5,1]], highpass:28, lowpass:18000, compressor:true, limiter:-0.3, normalize:-14, phaser:[0.15,0.3], tremolo:[1.2,0.15] },
    styrofoam:  { slowdown:0.85, eq:[[80,3,1.2],[200,2,1],[1000,-2,1],[6000,-1.5,1],[13000,2,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, echo:[0.12,0.18,0.35] },
    trissVortex:{ slowdown:0.82, eq:[[90,3.5,1.2],[180,2.5,1],[700,-2,1],[5000,-2.5,1],[12000,2.5,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, phaser:[0.25,0.32], vibrato:[0.4,0.1] },
    ogScrew:    { slowdown:0.75, eq:[[100,3,1.2],[300,2,1],[2000,-2,1],[8000,2,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14 },
    bassBoost:  { slowdown:0.88, eq:[[45,5,1.2],[100,3.5,1.2],[2000,-2,1],[8000,-1,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, stereoWiden:1.15 },
    distortion: { slowdown:0.85, eq:[[60,3,1.2],[300,1.5,1],[3000,-2,1],[8000,2,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14 },
    flanger:    { slowdown:1,    eq:[[100,1.5,1],[5000,-1.5,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, phaser:[0.08,0.5] },
    reverb:     { slowdown:0.95, eq:[[200,2,1],[5000,-1,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, echo:[0.6,0.4,0.6] },
    reverseEcho:{ slowdown:0.9,  eq:[[80,2,1],[3000,-1.5,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, echo:[0.35,0.3,0.5] },
    stereoWiden:{ slowdown:1,    eq:[], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, stereoWiden:1.6 },
    tremoloFx:  { slowdown:0.9,  eq:[[100,1.5,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, tremolo:[4,0.35] },
    leanTris:   { slowdown:0.9,  eq:[[80,2.5,1.2],[200,2,1],[1000,-1.5,1],[5000,-2,1],[11000,2,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, phaser:[0.15,0.2], tremolo:[0.6,0.15] },
    screwTrisPink:{slowdown:0.86, eq:[[90,3,1.2],[180,2.5,1],[800,-1.5,1],[4000,-2,1],[10000,2,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, phaser:[0.18,0.25], stereoWiden:1.1 },
    screwTussRed:{slowdown:0.87, eq:[[70,3.5,1.2],[150,2.5,1],[800,-2,1],[5000,-2.5,1],[12000,2.5,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, tremolo:[0.9,0.22] },
    rubberband: { slowdown:0.7,  eq:[[100,2,1],[3000,-1.5,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14 },
    allInOne:   { slowdown:0.86, eq:[[60,3,1.2],[250,2,1],[1000,-2,1],[5000,-1.5,1],[10000,2,1]], highpass:28, lowpass:18500, compressor:true, limiter:-0.3, normalize:-14, echo:[0.2,0.2,0.4], tremolo:[1.2,0.15], stereoWiden:1.1 },
  };

  function getWaProfile(name) {
    const n = name.toLowerCase().replace(/[^a-z0-9]/g,'');
    if (n.includes('bass')&&n.includes('sink')) return WA.bassHeavy;
    if (n.includes('trunk')&&n.includes('flex')) return WA.trunkRattle;
    if (n.includes('trunk')&&n.includes('pressure')) return WA.trunkPress;
    if (n.includes('codeinesway')||(n.includes('codeine')&&n.includes('sway'))) return WA.codeineSway;
    if (n.includes('codeine')&&(n.includes('glide')||n.includes('glid'))) return WA.codeineGlide;
    if (n.includes('lean')&&n.includes('drift')) return WA.leanDrift;
    if (n.includes('chopped')||(n.includes('chop')&&n.includes('cut'))) return WA.choppedCut;
    if (n.includes('chopsuey')) return WA.chopSuey;
    if (n.includes('slow_burn')||n.includes('slowburn')) return WA.slowBurn;
    if (n.includes('extreme')) return WA.extreme;
    if (n.includes('mildly')) return WA.mildSlow;
    if (n.includes('basic')&&n.includes('slow')&&n.includes('slow')) return WA.basicSlowSlow;
    if (n.includes('basic')&&n.includes('default')) return WA.basicDef;
    if (n.includes('basic')&&n.includes('eq')) return WA.basicEQ;
    if (n.includes('basic')&&n.includes('og')) return WA.basicOG;
    if (n.includes('basic')&&n.includes('rb7')) return WA.basicDef;
    if (n.includes('basic_slow')||(n.includes('basic')&&n.includes('slow'))) return WA.basicSlow;
    if (n.includes('tape')&&n.includes('melt')) return WA.tapeMelt;
    if (n.includes('vinyl')&&n.includes('static')) return WA.vinylStatic;
    if (n.includes('tapefat')||(n.includes('tape')&&n.includes('fat'))) return WA.tapeFat;
    if (n.includes('analog')||n.includes('warmth')) return WA.analogWarm;
    if (n.includes('vhs')) return WA.vhs;
    if (n.includes('vinyl')&&n.includes('dust')) return WA.vinylStatic;
    if (n.includes('late_night')||n.includes('latenight')) return WA.lateNight;
    if (n.includes('midnight')) return WA.midnightTint;
    if (n.includes('night_ride')||n.includes('nightride')) return WA.nightRide;
    if (n.includes('echo')&&n.includes('bass')) return WA.echoBass;
    if (n.includes('screwed')&&n.includes('echo')) return WA.echoBass;
    if (n.includes('slow_echo')||n.includes('slowecho')) return WA.slowEcho;
    if (n.includes('slab')||n.includes('cruise')) return WA.slabCruise;
    if (n.includes('htown')||n.includes('float')) return WA.htownFloat;
    if (n.includes('clean')&&n.includes('glide')) return WA.cleanGlide;
    if (n.includes('purple')&&n.includes('wave')) return WA.purpleWave;
    if (n.includes('phonk')||n.includes('shadow')) return WA.phonkShadow;
    if (n.includes('filter')||n.includes('phase')) return WA.filterPhase;
    if (n.includes('screw')&&n.includes('loud')) return WA.screwLoud;
    if (n.includes('screw')&&n.includes('wide')) return WA.screwWide;
    if (n.includes('wock')) return WA.wock;
    if (n.includes('tuss')) return WA.tuss;
    if (n.includes('tris')&&n.includes('pink')) return WA.screwTrisPink;
    if (n.includes('tris')&&n.includes('vortex')) return WA.trissVortex;
    if (n.includes('tris')) return WA.tris;
    if (n.includes('quali')) return WA.quali;
    if (n.includes('activis')) return WA.activis;
    if (n.includes('akorn')||n.includes('acorn')) return WA.akorn;
    if (n.includes('barre')) return WA.barre;
    if (n.includes('hydro')) return WA.hydro;
    if (n.includes('half')) return WA.halfScrew;
    if (n.includes('slowmoe')||(n.includes('slow')&&n.includes('moe'))) return WA.slowMoe;
    if (n.includes('extras')||n.includes('extra_st')) return WA.extraStereo;
    if (n.includes('master')||n.includes('mastering')) return WA.master;
    if (n.includes('hollow')||n.includes('trap')) return WA.hollowTrap;
    if (n.includes('oil')||n.includes('spill')) return WA.oilSpill;
    if (n.includes('spaced')) return WA.spacedOut;
    if (n.includes('wide')&&n.includes('verb')) return WA.wideVerb;
    if (n.includes('shimmer')||n.includes('clean')) return WA.shimmer;
    if (n.includes('punchy')) return WA.punchy;
    if (n.includes('babyslow')||(n.includes('baby')&&n.includes('slow'))) return WA.babySlow;
    if (n.includes('dirty')||n.includes('sprite')) return WA.dirtySprite;
    if (n.includes('double')||n.includes('cup')) return WA.doubleCup;
    if (n.includes('neon')||n.includes('rainfall')) return WA.neonRainfall;
    if (n.includes('dungeon')||n.includes('purple')&&n.includes('dun')) return WA.purpleDungeon;
    if (n.includes('styrofoam')||n.includes('styr')) return WA.styrofoam;
    if (n.includes('ogscrew')||(n.includes('og')&&n.includes('screw'))) return WA.ogScrew;
    if (n.includes('bass_boost')||(n.includes('bass')&&n.includes('boost'))) return WA.bassBoost;
    if (n.includes('distort')) return WA.distortion;
    if (n.includes('flanger')) return WA.flanger;
    if (n.includes('reverb')) return WA.reverb;
    if (n.includes('reverse')||n.includes('limiter')) return WA.reverseEcho;
    if (n.includes('stereo')&&n.includes('widen')) return WA.stereoWiden;
    if (n.includes('tremolo')) return WA.tremoloFx;
    if (n.includes('lean')&&n.includes('tris')) return WA.leanTris;
    if (n.includes('tuss')&&n.includes('red')) return WA.screwTussRed;
    if (n.includes('rubberband')||n.includes('rubber')) return WA.rubberband;
    if (n.includes('allinone')||n.includes('all_in')) return WA.allInOne;
    if (n.includes('screwai_tris')||n.includes('screwai_tris_pink')) return WA.screwTrisPink;
    if (n.includes('screwai_tuss')||n.includes('screwai_tuss_red')) return WA.screwTussRed;
    if (n.includes('move')||n.includes('around')) return WA.basicSlow;
    if (n.includes('wide')&&n.includes('verb')) return WA.wideVerb;
    if (n.includes('vinyl')) return WA.vinylStatic;
    if (n.includes('echo')) return WA.slowEcho;
    if (n.includes('chorus')) return WA.shimmer;
    if (n.includes('vocal')||n.includes('presence')) return WA.shimmer;
    if (n.includes('lean')&&(n.includes('phone')||n.includes('speaker'))) return WA.doubleCup;
    return WA.basicSlow;
  }

  // ── Web Audio Processing Engine ──
  function createSafeAudioContext() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(function() {});
      }
      return ctx;
    } catch (e) {
      // Safari fallback
      try {
        return new window.webkitAudioContext();
      } catch (e2) {
        throw new Error('AudioContext not supported in this browser');
      }
    }
  }

  async function processBrowserAudio(file, strains) {
    const audioCtx = createSafeAudioContext();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    audioCtx.close();

    const isMp3Input = file.name.toLowerCase().endsWith('.mp3');
    const wantsMp3 = !conversionSettings.mp3ToWav && isMp3Input;

    const results = [];
    for (let i = 0; i < strains.length; i++) {
      const strain = strains[i];
      screwaiApi.onProgress({
        current: i + 1,
        total: strains.length,
        strain: strain.name,
        status: 'processing'
      });
      progressCount.textContent = `${i + 1} / ${strains.length}`;
      progressFill.style.width = `${((i + 1) / strains.length) * 100}%`;
      currentStrain.textContent = `Processing: ${strain.name}`;

      try {
        const profile = getWaProfile(strain.name);
        const outputBuffer = await renderWaChain(audioBuffer, profile);

        let blob;
        let ext;
        if (wantsMp3 && typeof lamejs !== 'undefined') {
          ext = '.mp3';
          const mp3Data = await encodeMp3(outputBuffer);
          blob = new Blob(mp3Data, { type: 'audio/mpeg' });
        } else {
          ext = '.wav';
          blob = audioBufferToWavBlob(outputBuffer, strain.name);
        }

        const url = URL.createObjectURL(blob);
        const fileName = `${file.name.replace(/\.[^.]+$/, '')}_${strain.name.replace(/[^a-z0-9]/gi, '_')}${ext}`;

        // Safari blocks a.click() for blob URLs — use open as fallback
        if (isApple) {
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = fileName;
          anchor.style.display = 'none';
          document.body.appendChild(anchor);
          anchor.click();
          // Safari sometimes needs the download attribute removed and URL opened directly
          setTimeout(function() {
            if (!anchor.download) {
              window.open(url, '_blank');
            }
            document.body.removeChild(anchor);
          }, 200);
        } else {
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          a.click();
        }

        // Revoke after a delay so the browser has time to start the download
        setTimeout(() => URL.revokeObjectURL(url), 10000);

        results.push({ strain: strain.name, success: true, output: a.download });
      } catch (err) {
        console.error(`Failed to process ${strain.name}:`, err);
        results.push({ strain: strain.name, success: false, error: err.message });
      }
    }
    return results;
  }

  function encodeMp3(audioBuffer) {
    return new Promise((resolve, reject) => {
      try {
        const numChannels = Math.min(audioBuffer.numberOfChannels, 2);
        const sampleRate = audioBuffer.sampleRate;
        const bitRate = 192;
        const mp3enc = new lamejs.Mp3Encoder(numChannels, sampleRate, bitRate);
        const samples = audioBuffer.getChannelData(0);
        const blockSize = 1152;
        const mp3Data = [];

        function floatTo16bit(src, dst, offset) {
          for (let j = 0; j < src.length; j++) {
            const s = Math.max(-1, Math.min(1, src[j]));
            dst[offset + j] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
        }

        const left = new Int16Array(samples.length);
        floatTo16bit(samples, left, 0);
        let right = null;
        if (numChannels > 1) {
          const rSamples = audioBuffer.getChannelData(1);
          right = new Int16Array(rSamples.length);
          floatTo16bit(rSamples, right, 0);
        }

        for (let i = 0; i < samples.length; i += blockSize) {
          const chunkEnd = Math.min(i + blockSize, samples.length);
          const chunkLen = chunkEnd - i;
          if (chunkLen < blockSize) {
            const lastL = new Int16Array(blockSize);
            lastL.set(left.subarray(i, chunkEnd));
            const lastR = right ? new Int16Array(blockSize).fill(0) : null;
            if (right) lastR.set(right.subarray(i, chunkEnd));
            const buf = lastR
              ? mp3enc.encodeBuffer(lastL, lastR)
              : mp3enc.encodeBuffer(lastL);
            if (buf.length > 0) mp3Data.push(buf);
            break;
          }
          const lChunk = left.subarray(i, i + blockSize);
          const rChunk = right ? right.subarray(i, i + blockSize) : null;
          const buf = rChunk
            ? mp3enc.encodeBuffer(lChunk, rChunk)
            : mp3enc.encodeBuffer(lChunk);
          if (buf.length > 0) mp3Data.push(buf);
        }

        const end = mp3enc.flush();
        if (end.length > 0) mp3Data.push(end);
        resolve(mp3Data);
      } catch (err) {
        reject(err);
      }
    });
  }

  async function renderWaChain(audioBuffer, cfg) {
    const duration = audioBuffer.duration / (cfg.slowdown || 1);
    const length = Math.ceil(audioBuffer.sampleRate * duration);
    // Safari caps OfflineAudioContext at 2 channels
    const channels = isApple ? Math.min(audioBuffer.numberOfChannels, 2) : audioBuffer.numberOfChannels;
    const ctx = new OfflineAudioContext(channels, length, audioBuffer.sampleRate);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = cfg.slowdown || 1;

    let node = source;
    let prepend = []; // nodes that connect before the chain (vibrato modulates source)

    // EQ peaking filters
    if (cfg.eq) {
      for (const [freq, gain, Q] of cfg.eq) {
        const f = ctx.createBiquadFilter();
        f.type = 'peaking';
        f.frequency.value = freq;
        f.gain.value = gain;
        f.Q.value = Q || 1;
        node.connect(f);
        node = f;
      }
    }

    // Simple bass boost (lowshelf)
    const bassEq = cfg.eq ? cfg.eq.find(e => e[0] <= 120 && e[1] >= 3) : null;
    if (!bassEq && cfg.eq && cfg.eq.length === 0) {
      // no-op, some profiles have no EQ
    }

    // Highpass
    if (cfg.highpass) {
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = cfg.highpass;
      node.connect(hp);
      node = hp;
    }

    // Lowpass (first stage, if present)
    if (cfg.lowpass && cfg.lowpass < 18000) {
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = cfg.lowpass;
      node.connect(lp);
      node = lp;
    }

    // Tremolo: Oscillator → Gain → GainNode.gain
    if (cfg.tremolo) {
      const [rate, depth] = cfg.tremolo;
      const amp = ctx.createGain();
      amp.gain.value = 1;
      const osc = ctx.createOscillator();
      osc.frequency.value = rate;
      osc.type = 'sine';
      const modGain = ctx.createGain();
      modGain.gain.value = depth;
      // Safari doesn't support createConstantSource — use a low-frequency osc as bias
      if (ctx.createConstantSource) {
        const bias = ctx.createConstantSource();
        bias.offset.value = 1 - depth;
        osc.connect(modGain);
        modGain.connect(amp.gain);
        bias.connect(amp.gain);
        node.connect(amp);
        node = amp;
        osc.start();
        bias.start();
      } else {
        // Safari fallback: use a second oscillator at ~0 Hz as DC bias
        const bias = ctx.createOscillator();
        bias.frequency.value = 0.001;
        bias.type = 'sine';
        const biasGain = ctx.createGain();
        biasGain.gain.value = 1 - depth;
        osc.connect(modGain);
        modGain.connect(amp.gain);
        bias.connect(biasGain);
        biasGain.connect(amp.gain);
        node.connect(amp);
        node = amp;
        osc.start();
        bias.start();
      }
    }

    // Vibrato: modulate source.detune (connected before any routing)
    if (cfg.vibrato) {
      const [rate, depth] = cfg.vibrato;
      const osc = ctx.createOscillator();
      osc.frequency.value = rate;
      osc.type = 'sine';
      const vGain = ctx.createGain();
      vGain.gain.value = depth * 800; // cents
      osc.connect(vGain);
      vGain.connect(source.detune);
      osc.start();
    }

    // Phaser: sweeping allpass filter
    if (cfg.phaser) {
      const [rate, depth] = cfg.phaser;
      const ph = ctx.createBiquadFilter();
      ph.type = 'allpass';
      ph.Q.value = 2;
      const dur = audioBuffer.duration / (cfg.slowdown || 1);
      // Safari's setValueCurveAtTime caps at 128 samples — use 64 for cross-browser safety
      const pts = isApple ? 64 : 128;
      const curve = new Float32Array(pts);
      for (let j = 0; j < pts; j++) {
        const phase = (j / pts) * Math.PI * 2 * rate * dur;
        curve[j] = 500 + Math.sin(phase) * 2000 * Math.min(depth, 1);
      }
      ph.frequency.setValueCurveAtTime(curve, 0, dur);
      node.connect(ph);
      node = ph;
    }

    // Echo: Delay + Feedback (with hard clamp to prevent runaway)
    if (cfg.echo) {
      const [delayTime, decay, mix] = cfg.echo;
      const safeDecay = Math.min(decay, 0.45);
      const delay = ctx.createDelay(2);
      delay.delayTime.value = delayTime;
      const feedback = ctx.createGain();
      feedback.gain.value = safeDecay;
      const wet = ctx.createGain();
      wet.gain.value = Math.min(mix, 0.6);
      const dry = ctx.createGain();
      dry.gain.value = 1 - Math.min(mix, 0.6);
      const merge = ctx.createGain();
      const echoTrim = ctx.createGain();
      echoTrim.gain.value = 0.85;
      node.connect(dry);
      node.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(wet);
      wet.connect(echoTrim);
      dry.connect(merge);
      echoTrim.connect(merge);
      node = merge;
    }

    // Second-stage lowpass (after modulation)
    if (cfg.lowpass2) {
      const lp2 = ctx.createBiquadFilter();
      lp2.type = 'lowpass';
      lp2.frequency.value = cfg.lowpass2;
      node.connect(lp2);
      node = lp2;
    }

    // Compressor
    if (cfg.compressor) {
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.ratio.value = 2.2;
      comp.attack.value = 0.03;
      comp.release.value = 0.35;
      node.connect(comp);
      node = comp;
    }

    // Hard limiter — WaveShaper with clamp curve + makeup gain
    if (cfg.limiter) {
      const ws = ctx.createWaveShaper();
      const curve = new Float32Array(512);
      const limit = 0.9;
      for (let i = 0; i < 512; i++) {
        const x = (i / 256) - 1;
        curve[i] = Math.max(-limit, Math.min(limit, x));
      }
      ws.curve = curve;
      const makeup = ctx.createGain();
      makeup.gain.value = 0.95;
      node.connect(ws);
      node = ws;
    }

    // Stereo widening: increase side channel gain
    if (cfg.stereoWiden && cfg.stereoWiden !== 1) {
      const split = ctx.createChannelSplitter(2);
      const leftG = ctx.createGain();
      const rightG = ctx.createGain();
      const merge = ctx.createChannelMerger(2);
      leftG.gain.value = 1;
      rightG.gain.value = cfg.stereoWiden;
      node.connect(split);
      split.connect(leftG, 0);
      split.connect(rightG, 1);
      leftG.connect(merge, 0, 0);
      rightG.connect(merge, 0, 1);
      node = merge;
    }

    // Master output gain to prevent clipping
    const masterOut = ctx.createGain();
    masterOut.gain.value = 0.88;
    node.connect(masterOut);
    node = masterOut;

    node.connect(ctx.destination);
    source.start(0);
    return ctx.startRendering();
  }

  function audioBufferToWavBlob(audioBuffer, strainName) {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const data = [];
    for (let ch = 0; ch < numChannels; ch++) {
      data.push(audioBuffer.getChannelData(ch));
    }
    const length = data[0].length;
    const dataSize = length * blockAlign;

    // Build metadata
    const platform = platformName || 'Web';
    const artist = `Screwed by ScrewAI ${platform}`;
    const comment = `Produced with ScrewAI Pro. Stem separation: https://liminal-stemsplit.onrender.com/ | ScrewAI: https://myaiplug.github.io/ScrewAI-App/`;

    function writeStr(view, offset, str) {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    }
    function paddedLen(str) { return str.length + (str.length % 2); }

    // LIST INFO chunk
    const iart = 'IART' + String.fromCharCode(0) + artist.length + 1;
    const icmt = 'ICMT' + String.fromCharCode(0) + comment.length + 1;
    const listInfoSize = 4 + 4 + 4 + paddedLen(iart) + paddedLen(icmt);
    const fmtSize = 16;
    const riffSize = 4 + (8 + fmtSize) + (8 + listInfoSize) + (8 + dataSize);
    const totalSize = 8 + (8 + fmtSize) + (8 + listInfoSize) + (8 + dataSize);

    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);

    let off = 0;
    writeStr(view, off, 'RIFF'); off += 4;
    view.setUint32(off, riffSize, true); off += 4;
    writeStr(view, off, 'WAVE'); off += 4;

    // fmt chunk
    writeStr(view, off, 'fmt '); off += 4;
    view.setUint32(off, fmtSize, true); off += 4;
    view.setUint16(off, format, true); off += 2;
    view.setUint16(off, numChannels, true); off += 2;
    view.setUint32(off, sampleRate, true); off += 4;
    view.setUint32(off, sampleRate * blockAlign, true); off += 4;
    view.setUint16(off, blockAlign, true); off += 2;
    view.setUint16(off, bitDepth, true); off += 2;

    // LIST INFO metadata chunk
    writeStr(view, off, 'LIST'); off += 4;
    view.setUint32(off, listInfoSize, true); off += 4;
    writeStr(view, off, 'INFO'); off += 4;

    writeStr(view, off, iart); off += paddedLen(iart);
    writeStr(view, off, icmt); off += paddedLen(icmt);

    // data chunk
    writeStr(view, off, 'data'); off += 4;
    view.setUint32(off, dataSize, true); off += 4;

    for (let i = 0; i < length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        let sample = Math.max(-1, Math.min(1, data[ch][i]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(off, sample, true);
        off += 2;
      }
    }
    return new Blob([buffer], { type: 'audio/wav' });
  }

  async function handleBrowserAudioFile(file) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') await audioCtx.resume();
    const arrayBuffer = await file.arrayBuffer();
    browserAudioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    audioCtx.close();
    browserAudioFile = file;
    const path = `browser://${file.name}`;
    audioPath = path;
    sourceAudioFormat = detectAudioFormat(file.name);
    audioName.textContent = file.name;
    audioDrop.classList.add('has-file');
    outputDir = '[Browser Download]';
    outputPath.textContent = 'Files will be downloaded to your browser';
    outputBtn.classList.add('has-folder');
    syncFormatAvailability();
    updateProcessButton();
    return path;
  }

  const fallbackApi = {
    minimize: () => {},
    maximize: () => {},
    close: () => {},
    selectAudio: async () => {
      return new Promise((resolve) => {
        const input = document.getElementById('audio-file-input');
        if (!input) { resolve(null); return; }
        input.value = '';
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (!file) { resolve(null); return; }
          const path = await handleBrowserAudioFile(file);
          resolve(path);
        };
        // Safari requires user gesture for file input — use the drop zone click instead
        try { input.click(); } catch (e) {
          // If programmatic click fails (Safari), trigger via the audio drop element
          const drop = document.getElementById('audio-drop');
          if (drop) drop.click();
        }
      });
    },
    selectOutput: async () => {
      return '[Browser Download]';
    },
    getStrains: async () => createFallbackStrains(),
    processAudio: async (data) => {
      const file = browserAudioFile;
      if (!file) throw new Error('No audio file loaded');
      return processBrowserAudio(file, data.strains);
    },
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



  // Preview Modal event listeners
  document.getElementById('preview-modal-close').addEventListener('click', closePreviewModal);
  document.getElementById('preview-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closePreviewModal();
  });
  document.getElementById('preview-cta').addEventListener('click', handlePreviewCta);
  document.getElementById('ab-a').addEventListener('click', () => toggleAbSide('a'));
  document.getElementById('ab-b').addEventListener('click', () => toggleAbSide('b'));
  document.getElementById('ab-play').addEventListener('click', () => {
    if (proModalIsPlaying) { stopAbPlayback(); proModalPauseTime = proModalAudioCtx ? proModalAudioCtx.currentTime - proModalStartTime : 0; }
    else startAbPlayback();
  });
  document.getElementById('ab-progress').addEventListener('click', (e) => {
    if (!proModalBuffer) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    proModalPauseTime = pct * proModalSegmentDuration;
    if (proModalIsPlaying) { stopAbPlayback(); startAbPlayback(); }
    else {
      document.getElementById('ab-progress-fill').style.width = (pct * 100) + '%';
      document.getElementById('ab-time').textContent =
        `${Math.floor(proModalPauseTime / 60)}:${String(Math.floor(proModalPauseTime) % 60).padStart(2, '0')}`;
    }
  });

  // PRO Upsell event listeners
  document.getElementById('pro-upsell-close').addEventListener('click', closeProUpsell);
  document.getElementById('pro-upsell').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeProUpsell();
  });
  document.getElementById('pro-cta').addEventListener('click', () => {
    const url = 'https://buy.stripe.com/eVq8wPdqSdb63hugmoffy01';
    const w = window.open(url, '_blank');
    if (!w) { window.location.href = url; }
    // Local unlock for testing
    isPro = true;
    localStorage.setItem('screwai_pro', 'true');
    closeProUpsell();
    renderStrains();
    updateSelectedCount();
    updateFormatCounts();
    showToast('PRO unlocked! All strains are now available.');
  });

  function setupPlatform() {
    if (isApple) {
      const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
      platformName = isIOS ? 'Mobile' : (wasDragged ? 'Drag & Drop' : 'Web');
    } else if (/Mobi|Android/i.test(navigator.userAgent)) {
      platformName = 'Mobile';
    } else if (wasDragged) {
      platformName = 'Drag & Drop';
    } else {
      platformName = isBrowser ? 'Web' : 'Desktop';
    }
  }

  function showToast(msg) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 3000);
  }

  function getSelectionLimit() {
    return isPro ? PRO_SELECTION_LIMIT : FREE_SELECTION_LIMIT;
  }

  const proBadge = document.getElementById('pro-badge');
  if (proBadge) {
    proBadge.addEventListener('click', () => {
      if (!isPro) openProUpsell('#7C3AED');
    });
  }

  // Initialize
  async function init() {
    setupPlatform();
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
        const waProfile = getWaProfile(strain.name);
        const slowdownPct = waProfile && waProfile.slowdown ? Math.round((1 - waProfile.slowdown) * 100) : 0;
        return `<div class="strain-strip${selectedStrains.has(index) ? ' selected' : ''}${isPro ? ' pro-locked' : ''}" data-index="${index}" data-slowdown="${slowdownPct}" style="--strain-color: ${nonAdjacentColors[visualOrder]}; --strip-order: ${visualOrder}; --fill-base: ${bottleProfile.baseFill}%; --fill-hover: ${bottleProfile.hoverFill}%; --fill-selected: ${bottleProfile.selectedFill}%">
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
        <div class="strip-slowdown">${slowdownPct}%</div>
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
    openPreviewModal(index);
  }

  // ── Preview Modal ──
  let previewStrainIndex = null;
  let previewAudioCtx = null;
  let previewSource = null;
  let previewBuffer = null;
  let previewIsPlaying = false;
  let previewStartTime = 0;
  let previewPauseTime = 0;
  let previewCurrentSide = 'a';
  let previewRaf = null;
  let previewProBuffer = null;
  let previewSegmentStart = 0;
  let previewSegmentDuration = 10;

  function openPreviewModal(index) {
    const strain = strains[index];
    if (!strain) return;
    previewStrainIndex = index;

    const overlay = document.getElementById('preview-modal');
    if (!overlay) return;

    document.getElementById('preview-strain-name').textContent = strain.name;
    document.getElementById('ab-b-desc').textContent = `${strain.name} Preview`;

    const isPro = strain.tier === 'pro';
    document.getElementById('preview-strain-sub').textContent = isPro ? 'Premium Strain \u2022 PRO Exclusive' : 'Free Strain';
    const cta = document.getElementById('preview-cta');
    const ctaText = document.getElementById('preview-cta-text');
    const ctaSub = document.getElementById('preview-cta-sub');
    if (isPro) {
      cta.className = 'preview-cta pro-cta-style';
      ctaText.textContent = 'Unlock PRO';
      ctaSub.textContent = 'One-time payment \u2022 Lifetime access \u2022 Free updates';
    } else {
      const alreadySelected = selectedStrains.has(index);
      cta.className = 'preview-cta select-cta';
      ctaText.textContent = alreadySelected ? 'Deselect Strain' : 'Select Strain';
      ctaSub.textContent = alreadySelected ? 'Remove from your selection' : 'Click to add to your selection';
    }

    // Generate bubbles in syrup
    const syrup = document.getElementById('preview-syrup');
    syrup.querySelectorAll('.pro-syrup-bubble-custom').forEach(el => el.remove());
    for (let i = 0; i < 18; i++) {
      const b = document.createElement('div');
      b.className = 'pro-syrup-bubble pro-syrup-bubble-custom';
      const size = 4 + Math.random() * 16;
      b.style.cssText = `width:${size}px;height:${size}px;left:${5 + Math.random() * 90}%;bottom:-${5 + Math.random() * 10}%;--dur:${5 + Math.random() * 6}s;--delay:${Math.random() * 4}s;--drift:${(Math.random() - 0.5) * 40}px`;
      syrup.appendChild(b);
    }

    overlay.classList.add('active');

    // Setup A/B preview
    if (browserAudioBuffer) {
      setupAbPreview(strain);
    }
  }

  function closePreviewModal() {
    document.getElementById('preview-modal').classList.remove('active');
    stopAbPlayback();
    previewStrainIndex = null;
  }

  function handlePreviewCta() {
    if (previewStrainIndex === null) return;
    const strain = strains[previewStrainIndex];
    if (!strain) return;

    if (strain.tier === 'pro') {
      closePreviewModal();
      const card = document.querySelector(`.strain-strip[data-index="${previewStrainIndex}"]`);
      let color = '#7C3AED';
      if (card) {
        const cs = getComputedStyle(card);
        color = cs.getPropertyValue('--strain-color').trim() || color;
      }
      openProUpsell(color);
    } else {
      const index = previewStrainIndex;
      const card = document.querySelector(`.strain-strip[data-index="${index}"]`);
      if (selectedStrains.has(index)) {
        selectedStrains.delete(index);
        if (card) card.classList.remove('selected');
      } else {
        const limit = getSelectionLimit();
        if (selectedStrains.size >= limit) {
          if (isPro) {
            showToast(`PRO allows up to ${limit} strains per batch`);
          } else {
            closePreviewModal();
            const sc = card ? getComputedStyle(card).getPropertyValue('--strain-color').trim() || '#7C3AED' : '#7C3AED';
            openProUpsell(sc);
            return;
          }
        } else {
          selectedStrains.add(index);
          if (card) card.classList.add('selected');
        }
      }
      updateSelectedCount();
      updateProcessButton();
      closePreviewModal();
    }
  }

  // ── PRO Upsell Modal ──

  function openProUpsell(strainColor) {
    const overlay = document.getElementById('pro-upsell');
    if (!overlay) return;

    // Set dynamic syrup color to match the strain
    const syrup = document.getElementById('pro-upsell-syrup');
    if (syrup && strainColor) {
      // Parse the hex color and create rgba variants
      const r = parseInt(strainColor.slice(1,3), 16);
      const g = parseInt(strainColor.slice(3,5), 16);
      const b = parseInt(strainColor.slice(5,7), 16);
      syrup.style.setProperty('--syrup-color1', `rgba(${r},${g},${b},0.35)`);
      syrup.style.setProperty('--syrup-color2', `rgba(${r+40},${g+20},${b+60},0.25)`);
      syrup.style.setProperty('--syrup-color3', `rgba(${r-30},${g-10},${b-50},0.5)`);
      // Update syrup background
      syrup.style.background = `
        radial-gradient(ellipse at 30% 20%, var(--syrup-color1), transparent 50%),
        radial-gradient(ellipse at 70% 10%, var(--syrup-color2), transparent 40%),
        radial-gradient(ellipse at 50% 80%, var(--syrup-color3), transparent 50%),
        linear-gradient(175deg, #2a1040, #160828 40%, #0c0418 80%)
      `;
      // Color the blobs
      const blobs = syrup.querySelectorAll('.pro-syrup-blob');
      if (blobs[0]) blobs[0].style.background = `radial-gradient(circle, rgba(${r+40},${g+20},${b+60},0.4), rgba(${r-20},${g},${b-30},0.2))`;
      if (blobs[1]) blobs[1].style.background = `radial-gradient(circle, rgba(${r+80},${g+40},${b+80},0.35), rgba(${r+10},${g+10},${b+10},0.15))`;
      if (blobs[2]) blobs[2].style.background = `radial-gradient(circle, rgba(${r},${g-10},${b-40},0.3), rgba(${r-40},${g-20},${b-60},0.2))`;
    }

    // Generate bubbles
    if (syrup) {
      syrup.querySelectorAll('.pro-syrup-bubble-custom').forEach(el => el.remove());
      for (let i = 0; i < 14; i++) {
        const b = document.createElement('div');
        b.className = 'pro-syrup-bubble pro-syrup-bubble-custom';
        const size = 4 + Math.random() * 14;
        b.style.cssText = `width:${size}px;height:${size}px;left:${5 + Math.random() * 90}%;bottom:-${5 + Math.random() * 10}%;--dur:${5 + Math.random() * 6}s;--delay:${Math.random() * 4}s;--drift:${(Math.random() - 0.5) * 40}px`;
        syrup.appendChild(b);
      }
    }

    overlay.classList.add('active');
  }

  function closeProUpsell() {
    document.getElementById('pro-upsell').classList.remove('active');
  }

  // ── Shared A/B Preview Functions ──
  let proModalBuffer = null;
  let proModalProBuffer = null;
  let proModalCurrentSide = 'a';
  let proModalIsPlaying = false;
  let proModalAudioCtx = null;
  let proModalSource = null;
  let proModalStartTime = 0;
  let proModalPauseTime = 0;
  let proModalRaf = null;
  let proModalSegmentStart = 0;
  let proModalSegmentDuration = 10;

  function setupAbPreview(strain) {
    const buf = browserAudioBuffer;
    const dur = buf.duration;
    const segLen = Math.min(proModalSegmentDuration, dur * 0.8);
    const maxStart = Math.max(0, dur - segLen);
    proModalSegmentStart = Math.random() * maxStart;
    proModalSegmentDuration = segLen;

    // Extract original segment
    const sr = buf.sampleRate;
    const ch = buf.numberOfChannels;
    const segSamples = Math.floor(segLen * sr);
    const safeCh = isApple ? Math.min(ch, 2) : ch;
    const origBuffer = new OfflineAudioContext(safeCh, segSamples, sr).createBuffer(safeCh, segSamples, sr);
    for (let c = 0; c < ch; c++) {
      const src = buf.getChannelData(c);
      const dst = origBuffer.getChannelData(c);
      const offset = Math.floor(proModalSegmentStart * sr);
      for (let s = 0; s < segSamples && offset + s < src.length; s++) {
        dst[s] = src[offset + s];
      }
    }
    proModalBuffer = origBuffer; // store original segment as base

    // Pre-render PRO processed version
    const profile = getWaProfile(strain.name);
    if (profile) {
      renderWaChain(origBuffer, profile).then(proBuf => {
        proModalProBuffer = proBuf;
      }).catch(e => console.error('PRO preview render error:', e));
    } else {
      proModalProBuffer = null;
    }

    // Reset player state
    stopAbPlayback();
    proModalCurrentSide = 'a';
    document.getElementById('ab-a').classList.add('active');
    document.getElementById('ab-b').classList.remove('active');
    document.getElementById('ab-time').textContent = '0:00';
    document.getElementById('ab-progress-fill').style.width = '0%';
  }

  function toggleAbSide(side) {
    if (side === proModalCurrentSide) return;
    const wasPlaying = proModalIsPlaying;
    stopAbPlayback();
    proModalCurrentSide = side;
    document.getElementById('ab-a').classList.toggle('active', side === 'a');
    document.getElementById('ab-b').classList.toggle('active', side === 'b');
    document.getElementById('ab-time').textContent = '0:00';
    document.getElementById('ab-progress-fill').style.width = '0%';
    if (wasPlaying) startAbPlayback();
  }

  function startAbPlayback() {
    if (!proModalBuffer) return;
    stopAbPlayback();

    proModalAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const src = proModalAudioCtx.createBufferSource();
    const bufferToPlay = proModalCurrentSide === 'b' && proModalProBuffer
      ? proModalProBuffer : proModalBuffer;
    src.buffer = bufferToPlay;
    src.connect(proModalAudioCtx.destination);
    src.start(0, proModalPauseTime);
    proModalSource = src;
    proModalStartTime = proModalAudioCtx.currentTime - proModalPauseTime;
    proModalIsPlaying = true;
    document.getElementById('ab-play').innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';

    src.onended = () => { stopAbPlayback(); proModalPauseTime = 0; };

    updateAbProgress();
  }

  function stopAbPlayback() {
    if (proModalRaf) { cancelAnimationFrame(proModalRaf); proModalRaf = null; }
    if (proModalSource) {
      try { proModalSource.stop(); } catch(e) {}
      proModalSource.disconnect();
      proModalSource = null;
    }
    if (proModalAudioCtx) {
      proModalAudioCtx.close().catch(() => {});
      proModalAudioCtx = null;
    }
    proModalIsPlaying = false;
    document.getElementById('ab-play').innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20"/></svg>';
  }

  function updateAbProgress() {
    if (!proModalIsPlaying) return;
    const elapsed = proModalAudioCtx
      ? proModalAudioCtx.currentTime - proModalStartTime
      : proModalPauseTime;
    const pct = Math.min(100, (elapsed / proModalSegmentDuration) * 100);
    document.getElementById('ab-progress-fill').style.width = pct + '%';
    const secs = Math.floor(elapsed);
    document.getElementById('ab-time').textContent = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
    if (elapsed >= proModalSegmentDuration) {
      stopAbPlayback();
      proModalPauseTime = 0;
      return;
    }
    proModalRaf = requestAnimationFrame(updateAbProgress);
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
    const limit = getSelectionLimit();
    const limitSuffix = isPro ? '' : `/${limit}`;

    selectedCount.textContent = proCount > 0
      ? `${visibleSelected}${limitSuffix} selected \u2022 ${proCount} PRO locked`
      : `${visibleSelected}${limitSuffix} selected`;

    const allVisibleSelected = visibleFreeIndexes.length > 0 && visibleSelected === visibleFreeIndexes.length;
    selectAllBtn.textContent = allVisibleSelected ? 'Clear Free' : isPro ? 'Select All' : 'Select 1';
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
      proBadgeText.textContent = isPro ? 'PRO' : proTotal > 0 ? `${proTotal} PRO` : 'PRO';
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

    audioDrop.addEventListener('drop', async (e) => {
      e.preventDefault();
      audioDrop.classList.remove('drag-over');
      if (isProcessing) return;
      wasDragged = true;
      platformName = 'Drag & Drop';
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('audio/')) {
        await handleBrowserAudioFile(file);
      }
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

      const visibleFreeIndexes = strains
        .map((strain, index) => ({ strain, index }))
        .filter(({ strain }) => strain.format === activeFormat && strain.tier !== 'pro')
        .map(({ index }) => index);

      const allVisibleSelected = visibleFreeIndexes.length > 0 &&
        visibleFreeIndexes.every(index => selectedStrains.has(index));

      if (allVisibleSelected) {
        visibleFreeIndexes.forEach(index => selectedStrains.delete(index));
      } else {
        selectedStrains.clear();
        const limit = getSelectionLimit();
        for (let i = 0; i < Math.min(visibleFreeIndexes.length, limit); i++) {
          selectedStrains.add(visibleFreeIndexes[i]);
        }
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

      const visibleFreeIndexes = strains
        .map((strain, index) => ({ strain, index }))
        .filter(({ strain }) => strain.format === activeFormat && strain.tier !== 'pro')
        .map(({ index }) => index);

      selectedStrains.clear();
      const limit = getSelectionLimit();
      for (let i = 0; i < Math.min(visibleFreeIndexes.length, limit); i++) {
        selectedStrains.add(visibleFreeIndexes[i]);
      }

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

    // Free strains — trimmed to curated 5 essentials: [batName, displayName, color, icon]
    [
      ['Wock', 'Wock', '#6D28D9', 'wock'],
      ['Tuss', 'Tuss', '#B91C1C', 'tuss'],
      ['Triss', 'Triss', '#BE185D', 'tris'],
      ['Basic_Slow', 'Basic Slow', '#22C55E', 'slow'],
      ['echo.bat', 'Echo', '#2563EB', 'echo']
    ].forEach(([name, displayName, color, icon]) => {
      const isFile = name.endsWith('.bat');
      const labelImg = lbl(icon);
      if (isFile) {
        strains.push({ file: name, name: displayName, format: 'WAV', color, icon, labelImg, tier: 'free' });
      } else {
        strains.push({ file: `${name}.bat`, name: displayName, format: 'MP3', color, icon, labelImg, tier: 'free' });
        strains.push({ file: `${name}.bat`, name: displayName, format: 'WAV', color, icon, labelImg, tier: 'free' });
      }
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
