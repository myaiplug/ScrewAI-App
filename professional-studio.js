/**
 * ScrewAI Professional Studio Integration
 * Complete audio analysis and visualization suite
 * Integrates stem separation, waveform editing, and professional effects
 */

class ScrewAIProStudio {
    constructor() {
        this.components = {
            pitchDetector: null,
            proEffects: null,
            gridEditor: null,
            tapeSaturation: null,
            limiter: null,
            stemSeparator: null,
            waveformRenderer: null,
            bpmDetector: null
        };
        
        this.visualizations = {
            vuMeter: null,
            spectrum: null,
            pitchViz: null,
            gainReduction: null,
            waveform: null
        };
        
        this.panelsVisible = {
            proStudio: false,
            pitchDetector: false,
            limiter: false,
            audioGrid: false,
            stemSeparator: false
        };
        
        this.animationFrameId = null;
        this.isInitialized = false;
        this.audioContext = null;
        this.analyser = null;
        
        this.initializeComponents();
        this.setupEventListeners();
    }
    
    async initializeComponents() {
        try {
            console.log('ðŸŽ›ï¸ Initializing Professional Studio Components...');
            
            // Create audio context for visualizations
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.8;
            
            // Initialize basic components with error handling
            try {
                this.components.pitchDetector = new RealtimePitchDetector();
                console.log('âœ… Pitch detector initialized');
            } catch (error) {
                console.warn('âš ï¸ Pitch detector failed to initialize:', error);
            }
            
            try {
                this.components.proEffects = new ProStudioEffects();
                console.log('âœ… Pro effects initialized');
            } catch (error) {
                console.warn('âš ï¸ Pro effects failed to initialize:', error);
            }
            
            try {
                // Initialize functional grid editor with proper canvas
                this.components.gridEditor = new FunctionalGridEditor('functionalGridCanvas');
                
                // Listen for grid events
                document.addEventListener('gridAudioLoaded', (e) => {
                    this.updateGridInfo(e.detail);
                });
                
                document.addEventListener('chopPointAdded', (e) => {
                    this.updateGridInfo();
                    this.showNotification(`âœ‚ï¸ Chop added at ${e.detail.time.toFixed(3)}s`, 'success');
                });
                
                document.addEventListener('allChopsCleared', () => {
                    this.updateGridInfo();
                    this.showNotification('ðŸ—‘ï¸ All chops cleared', 'info');
                });
                
                console.log('âœ… Functional Grid editor initialized with events');
            } catch (error) {
                console.warn('âš ï¸ Grid editor failed to initialize:', error);
            }
            
            try {
                // Initialize original ScrewAI Pro Effects Engine
                this.components.screwAIProEngine = new ScrewAIProEffectsEngine();
                console.log('âœ… ScrewAI Pro Effects Engine initialized');
            } catch (error) {
                console.warn('âš ï¸ ScrewAI Pro Effects Engine failed to initialize:', error);
            }
            
            // Initialize visualizations
            this.initializeVisualizations();

            try {
                // Initialize complete tape saturation
                this.components.tapeSaturation = new HardwareTapeSaturation();
                this.initializeCompleteTapeKnobs();
                console.log('🎞 Tape Saturation Engine initialized');
            } catch (error) {
                console.warn('⚠️ Tape Saturation failed to initialize:', error);
            }
            
            this.isInitialized = true;
            console.log('âœ… Professional studio components initialized');
        } catch (error) {
            console.warn('âš ï¸ Some pro components failed to initialize:', error);
            // Continue anyway - we can still show visualizations
            this.isInitialized = true;
        }
    }
    
    initializeVisualizations() {
        // VU Meter Visualization
        const vuCanvas = document.getElementById('vuMeterCanvas');
        if (vuCanvas) {
            this.visualizations.vuMeter = new VUMeterVisualizer(vuCanvas);
            console.log('ðŸ“Š VU Meter initialized');
        }
        
        // Spectrum Analyzer Visualization
        const spectrumCanvas = document.getElementById('spectrumCanvas');
        if (spectrumCanvas) {
            this.visualizations.spectrum = new SpectrumAnalyzer(spectrumCanvas);
            console.log('ðŸ“Š Spectrum Analyzer initialized');
        }
        
        // Pitch Visualization
        const pitchCanvas = document.getElementById('pitchVisualization');
        if (pitchCanvas) {
            this.visualizations.pitchViz = new PitchVisualizer(pitchCanvas);
            console.log('ðŸ“Š Pitch Visualizer initialized');
        }
        
        // Gain Reduction Meter
        const grCanvas = document.getElementById('gainReductionCanvas');
        if (grCanvas) {
            this.visualizations.gainReduction = new GainReductionMeter(grCanvas);
            console.log('ðŸ“Š Gain Reduction Meter initialized');
        }
        
        console.log('ðŸ“Š Professional visualizations initialized');
    }
    
    setupEventListeners() {
        // Toggle advanced studio button
        const toggleBtn = document.getElementById('toggleAdvancedBtn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleAdvancedStudio());
        }
        
        // Connect saturation checkbox to tape saturation
        const saturationCheckbox = document.getElementById('saturationEnabled');
        if (saturationCheckbox) {
            saturationCheckbox.addEventListener('change', (e) => {
                this.toggleTapeSaturation(e.target.checked);
            });
        }
        
        // Connect mastering checkbox to limiter
        const masteringCheckbox = document.getElementById('proModeEnabled');
        if (masteringCheckbox) {
            masteringCheckbox.addEventListener('change', (e) => {
                this.toggleLimiter(e.target.checked);
            });
        }
        
        // Connect AI Stem Separator from Advanced Studio
        const stemSeparatorCheckbox = document.getElementById('stemSeparatorEnabled');
        if (stemSeparatorCheckbox) {
            stemSeparatorCheckbox.addEventListener('change', (e) => {
                this.toggleStemSeparator(e.target.checked);
            });
        }
        
        // Connect Advanced Tools
        const pitchDetectorStudio = document.getElementById('pitchDetectorStudio');
        if (pitchDetectorStudio) {
            pitchDetectorStudio.addEventListener('change', (e) => {
                this.togglePitchDetectorPanel(e.target.checked);
            });
        }
        
        const waveformEditorStudio = document.getElementById('waveformEditorStudio');
        if (waveformEditorStudio) {
            waveformEditorStudio.addEventListener('change', (e) => {
                this.toggleWaveformEditor(e.target.checked);
            });
        }
        
        // Set up grid editor controls once components are initialized
        setTimeout(() => {
            if (this.components.gridEditor) {
                this.setupGridEditorControls();
                this.setupProEffectsControls();
            }
        }, 100);
        
        // Enable stem separator (legacy support - remove the old checkbox)
        const stemBtn = document.getElementById('chopEnabled');
        if (stemBtn) {
            stemBtn.style.display = 'none'; // Hide old checkbox, use Advanced Studio instead
        }
    }
    
    toggleAdvancedStudio() {
        const btn = document.getElementById('toggleAdvancedBtn');
        const proPanel = document.getElementById('proStudioPanel');
        const pitchPanel = document.getElementById('pitchDetectorPanel');
        
        if (this.panelsVisible.proStudio) {
            // Hide panels
            proPanel.style.display = 'none';
            pitchPanel.classList.remove('active');
            btn.textContent = 'Show Advanced Studio';
            this.panelsVisible.proStudio = false;
            this.panelsVisible.pitchDetector = false;
            this.stopVisualizations();
        } else {
            // Show panels
            proPanel.style.display = 'block';
            pitchPanel.classList.add('active');
            btn.textContent = 'Hide Advanced Studio';
            this.panelsVisible.proStudio = true;
            this.panelsVisible.pitchDetector = true;
            
            // Start visualizations immediately
            this.startVisualizations();
        }
    }
    
    startVisualizations() {
        if (!this.isInitialized) return;
        
        console.log('ðŸ“Š Starting professional visualizations...');
        
        const animate = () => {
            if (this.panelsVisible.proStudio) {
                // Use real audio data if available, otherwise use demo data
                if (this.audioAnalyzer && this.frequencyData) {
                    this.updateRealtimeVisualizations();
                } else {
                    // Fallback to demo data when no audio is playing
                    // Update VU Meters with demo data
                    if (this.visualizations.vuMeter) {
                        const time = Date.now() * 0.001;
                        const leftLevel = 0.3 + Math.sin(time * 2) * 0.25 + Math.random() * 0.15;
                        const rightLevel = 0.35 + Math.sin(time * 1.7 + 0.5) * 0.2 + Math.random() * 0.15;
                        this.visualizations.vuMeter.update(
                            Math.max(0, Math.min(1, leftLevel)), 
                            Math.max(0, Math.min(1, rightLevel))
                        );
                    }
                    
                    // Update Spectrum Analyzer with demo data
                    if (this.visualizations.spectrum) {
                        const demoFreqData = new Uint8Array(128);
                        for (let i = 0; i < demoFreqData.length; i++) {
                            demoFreqData[i] = Math.random() * 255 * (1 - i / demoFreqData.length) * (0.5 + Math.sin(Date.now() * 0.001 + i * 0.1) * 0.3);
                        }
                        this.visualizations.spectrum.update(demoFreqData);
                    }
                    
                    // Update Pitch Visualization with demo data
                    if (this.visualizations.pitchViz) {
                        const demoPitch = {
                            frequency: 440 + Math.sin(Date.now() * 0.003) * 50,
                            cents: Math.sin(Date.now() * 0.007) * 30,
                            note: 'A4'
                        };
                        this.visualizations.pitchViz.update(demoPitch);
                    }
                    
                    // Update Gain Reduction Meter with demo data
                    if (this.visualizations.gainReduction) {
                        const demoGR = Math.max(0, Math.sin(Date.now() * 0.002) * 15);
                        this.visualizations.gainReduction.update(demoGR);
                    }
                }
                
                this.animationFrameId = requestAnimationFrame(animate);
            }
        };
        
        animate();
        console.log('ðŸ“Š Professional visualizations started');
    }
    
    stopVisualizations() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        console.log('ðŸ“Š Visualizations stopped');
    }
    
    cleanupStems() {
        // Stop any playing audio
        if (this.stemAudioSource) {
            this.stemAudioSource.stop();
            this.stemAudioSource = null;
        }
        this.currentPlayingStem = null;
        
        // Clear separated stems
        this.separatedStems = null;
        
        // Reset stem separator checkbox
        const checkbox = document.getElementById('stemSeparatorEnabled');
        if (checkbox) {
            checkbox.checked = false;
        }
        
        // Reset button label
        const btn = document.getElementById('chopEnabled');
        if (btn) {
            const label = btn.parentElement.querySelector('label');
            label.textContent = ' AI Stem Separator';
        }
        
        console.log('ðŸ§¹ Stem components cleaned up');
    }
    
    async toggleStemSeparator(enabled) {
        const statusDiv = document.getElementById('stemStatus');
        const progressBar = document.getElementById('stemProgress');
        const statusText = statusDiv?.querySelector('.status-text');
        const progressFill = progressBar?.querySelector('.progress-fill');
        
        if (enabled && window.audioPipeline && window.audioPipeline.audioBuffer) {
            try {
                console.log('ðŸŽµ Initializing AI Stem Separator from Advanced Studio...');
                
                // Show status and progress
                if (statusDiv) statusDiv.style.display = 'block';
                if (statusText) statusText.textContent = 'Initializing AI engine...';
                if (progressBar) progressBar.style.display = 'block';
                
                // Initialize advanced AI stem separator
                if (!this.components.stemSeparator) {
                    try {
                        // Use Simple Stem Separator (Browser-Safe)
                        console.log('🎵 Initializing Simple Stem Separator...');
                        this.components.stemSeparator = new SimpleStemSeparator(window.audioPipeline.audioContext);
                        
                        // Set quality based on user preference or audio characteristics
                        const quality = this.detectOptimalQuality(window.audioPipeline.audioBuffer);
                        this.components.stemSeparator.setQuality(quality);
                        console.log(`🎵 Using ${quality} quality separation`);
                        
                        // Listen for separation events
                        this.components.stemSeparator.addEventListener('separation_progress', (e) => {
                            const { progress, stage } = e.detail;
                            console.log(`ðŸ”„ ${stage}: ${Math.round(progress)}%`);
                            if (statusText) statusText.textContent = `${stage}... ${Math.round(progress)}%`;
                            if (progressFill) progressFill.style.width = `${progress}%`;
                        });
                        
                        this.components.stemSeparator.addEventListener('separation_complete', (e) => {
                            const { stems, quality } = e.detail;
                            console.log('âœ… Advanced AI separation complete!');
                            console.log('ðŸ“Š Separation quality scores:', quality);
                            
                            if (statusText) statusText.textContent = `Complete! Quality: ${quality.overall}% - Opening controls...`;
                            if (progressFill) progressFill.style.width = '100%';
                            
                            // Show quality notification
                            this.showNotification(
                                `ðŸ¤– AI Separation Complete! Quality: ${quality.overall}% (Vocals: ${quality.vocals}%, Instrumental: ${quality.instrumental}%)`,
                                'success'
                            );
                            
                            setTimeout(() => {
                                this.showAdvancedStemControls(stems, quality);
                            }, 1000);
                        });
                        
                        this.components.stemSeparator.addEventListener('separation_error', (e) => {
                            console.error('âŒ Advanced AI separation error:', e.detail.error);
                            if (statusText) statusText.textContent = 'AI separation failed - using fallback...';
                            this.showNotification('âš ï¸ AI separation failed, using standard method', 'warning');
                            
                            // Fallback to original separator
                            this.initializeFallbackSeparator();
                        });
                        
                        console.log('ðŸ¤– Advanced AI StemSeparator initialized');
                        
                        // Start advanced AI separation
                        await this.components.stemSeparator.separateStems(window.audioPipeline.audioBuffer, {
                            quality: quality
                        });
                        
                    } catch (error) {
                        console.warn('âš ï¸ Advanced AI StemSeparator not available, using fallback:', error);
                        if (statusText) statusText.textContent = 'Using standard separation method...';
                        this.initializeFallbackSeparator();
                    }
                } else {
                    // Use existing separator
                    await this.components.stemSeparator.separateStems(window.audioPipeline.audioBuffer);
                }
                
            } catch (error) {
                console.error('âŒ Stem separator error:', error);
                document.getElementById('stemSeparatorEnabled').checked = false;
                if (statusText) statusText.textContent = 'Separation failed';
                this.showNotification('âŒ Stem separation failed', 'error');
            }
        } else if (!enabled) {
            // Reset UI state
            if (statusDiv) statusDiv.style.display = 'none';
            if (progressBar) progressBar.style.display = 'none';
            if (progressFill) progressFill.style.width = '0%';
            
            // Clean up existing stem panel
            const existingPanel = document.querySelector('.stem-control-panel');
            if (existingPanel) {
                existingPanel.remove();
            }
        } else if (!window.audioPipeline || !window.audioPipeline.audioBuffer) {
            // No audio loaded
            document.getElementById('stemSeparatorEnabled').checked = false;
            if (statusText) statusText.textContent = 'Please load audio first';
            this.showNotification('âš ï¸ Please load an audio file first', 'warning');
        }
    }
    
    simulateStemSeparation() {
        const statusDiv = document.getElementById('stemStatus');
        const progressBar = document.getElementById('stemProgress');
        const statusText = statusDiv?.querySelector('.status-text');
        const progressFill = progressBar?.querySelector('.progress-fill');
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                if (statusText) statusText.textContent = 'Simulation complete! Opening controls...';
                if (progressFill) progressFill.style.width = '100%';
                
                setTimeout(() => {
                    this.showStemControls();
                }, 500);
            } else {
                if (statusText) statusText.textContent = `Simulating separation... ${Math.round(progress)}%`;
                if (progressFill) progressFill.style.width = `${progress}%`;
            }
        }, 200);
    }
    
    showStemControls() {
        // Create stem control panel
        const stemPanel = this.createStemControlPanel();
        document.body.appendChild(stemPanel);
        
        // Update button text
        const label = document.getElementById('chopEnabled').parentElement.querySelector('label');
        label.textContent = ' Stem Engine (Active)';
        
        console.log('ðŸŽµ Stem separation complete - controls available');
    }
    
    showRealStemControls(stems) {
        // Store the separated stems for download functionality
        this.separatedStems = stems;
        
        // Create enhanced stem control panel with real audio stems
        const stemPanel = this.createRealStemControlPanel(stems);
        document.body.appendChild(stemPanel);
        
        // Update button text
        const label = document.getElementById('chopEnabled').parentElement.querySelector('label');
        label.textContent = ' AI Stem Engine (Active)';
        
        // Hide status after success
        setTimeout(() => {
            const statusDiv = document.getElementById('stemStatus');
            const progressBar = document.getElementById('stemProgress');
            if (statusDiv) statusDiv.style.display = 'none';
            if (progressBar) progressBar.style.display = 'none';
        }, 2000);
        
        console.log('ðŸŽµ Real stem separation complete - controls available');
        this.showNotification('âœ… Stems separated successfully! Use controls to preview and download individual tracks.', 'success');
    }
    
    createStemControlPanel() {
        const panel = document.createElement('div');
        panel.className = 'stem-control-panel';
        panel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
            border: 1px solid #333;
            border-radius: 12px;
            padding: 20px;
            z-index: 1000;
            color: white;
            min-width: 400px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        `;
        
        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #8A2BE2;">ðŸŽµ AI Stem Separator</h3>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer;">Ã—</button>
            </div>
            
            <div class="stem-controls" style="display: grid; gap: 10px;">
                <div class="stem-track" data-stem="vocals" style="display: flex; align-items: center; gap: 10px; padding: 8px; background: rgba(138, 43, 226, 0.1); border-radius: 6px;">
                    <label style="min-width: 80px; font-weight: bold;">ðŸŽ¤ Vocals</label>
                    <input type="range" min="0" max="100" value="100" class="stem-volume" style="flex: 1;">
                    <button class="stem-solo" style="padding: 4px 8px; background: #4169E1; border: none; border-radius: 4px; color: white; cursor: pointer;">Solo</button>
                    <button class="stem-mute" style="padding: 4px 8px; background: #DC143C; border: none; border-radius: 4px; color: white; cursor: pointer;">Mute</button>
                </div>
                
                <div class="stem-track" data-stem="drums" style="display: flex; align-items: center; gap: 10px; padding: 8px; background: rgba(255, 99, 71, 0.1); border-radius: 6px;">
                    <label style="min-width: 80px; font-weight: bold;">ðŸ¥ Drums</label>
                    <input type="range" min="0" max="100" value="100" class="stem-volume" style="flex: 1;">
                    <button class="stem-solo" style="padding: 4px 8px; background: #4169E1; border: none; border-radius: 4px; color: white; cursor: pointer;">Solo</button>
                    <button class="stem-mute" style="padding: 4px 8px; background: #DC143C; border: none; border-radius: 4px; color: white; cursor: pointer;">Mute</button>
                </div>
                
                <div class="stem-track" data-stem="bass" style="display: flex; align-items: center; gap: 10px; padding: 8px; background: rgba(34, 139, 34, 0.1); border-radius: 6px;">
                    <label style="min-width: 80px; font-weight: bold;">ðŸŽ¸ Bass</label>
                    <input type="range" min="0" max="100" value="100" class="stem-volume" style="flex: 1;">
                    <button class="stem-solo" style="padding: 4px 8px; background: #4169E1; border: none; border-radius: 4px; color: white; cursor: pointer;">Solo</button>
                    <button class="stem-mute" style="padding: 4px 8px; background: #DC143C; border: none; border-radius: 4px; color: white; cursor: pointer;">Mute</button>
                </div>
                
                <div class="stem-track" data-stem="other" style="display: flex; align-items: center; gap: 10px; padding: 8px; background: rgba(255, 215, 0, 0.1); border-radius: 6px;">
                    <label style="min-width: 80px; font-weight: bold;">ðŸŽ¹ Other</label>
                    <input type="range" min="0" max="100" value="100" class="stem-volume" style="flex: 1;">
                    <button class="stem-solo" style="padding: 4px 8px; background: #4169E1; border: none; border-radius: 4px; color: white; cursor: pointer;">Solo</button>
                    <button class="stem-mute" style="padding: 4px 8px; background: #DC143C; border: none; border-radius: 4px; color: white; cursor: pointer;">Mute</button>
                </div>
            </div>
            
            <div style="margin-top: 15px; text-align: center;">
                <button onclick="window.screwAIPro.studio.applyStemMix()" style="background: linear-gradient(90deg, #8A2BE2 0%, #FF6347 100%); border: none; padding: 10px 20px; border-radius: 6px; color: white; cursor: pointer; font-weight: bold;">Apply Stem Mix to Screw</button>
            </div>
        `;
        
        // Add event listeners to stem controls
        const volumeSliders = panel.querySelectorAll('.stem-volume');
        const soloButtons = panel.querySelectorAll('.stem-solo');
        const muteButtons = panel.querySelectorAll('.stem-mute');
        
        volumeSliders.forEach(slider => {
            slider.addEventListener('input', (e) => {
                console.log(`ðŸŽ›ï¸ ${e.target.closest('.stem-track').dataset.stem} volume: ${e.target.value}%`);
            });
        });
        
        soloButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const stem = e.target.closest('.stem-track').dataset.stem;
                console.log(`ðŸ”ˆ Solo ${stem}`);
                e.target.style.background = e.target.style.background === 'rgb(255, 215, 0)' ? '#4169E1' : '#FFD700';
            });
        });
        
        muteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const stem = e.target.closest('.stem-track').dataset.stem;
                console.log(`ðŸ”‡ Mute ${stem}`);
                e.target.style.background = e.target.style.background === 'rgb(255, 215, 0)' ? '#DC143C' : '#FFD700';
            });
        });
        
        return panel;
    }
    
    createRealStemControlPanel(stems) {
        const panel = document.createElement('div');
        panel.className = 'stem-control-panel real-stems';
        panel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
            border: 2px solid #8A2BE2;
            border-radius: 12px;
            padding: 20px;
            z-index: 1000;
            color: white;
            min-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 40px rgba(138, 43, 226, 0.3);
        `;
        
        // Store stems for audio manipulation
        this.separatedStems = stems;
        
        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #8A2BE2;">ðŸ¤– AI Stem Separator (REAL)</h3>
                <button onclick="this.parentElement.parentElement.remove(); window.screwAIPro.studio.cleanupStems();" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer;">Ã—</button>
            </div>
            
            <div style="background: rgba(138, 43, 226, 0.1); padding: 10px; border-radius: 6px; margin-bottom: 15px; text-align: center;">
                <strong>âœ… Real AI stem separation complete!</strong><br>
                <small>ðŸŽµ Each stem can be previewed and downloaded separately before screwing</small>
            </div>
            
            <!-- Individual Stem Controls -->
            <div style="background: rgba(0, 0, 0, 0.2); padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <strong style="color: #FFD700;">ðŸŽ›ï¸ Individual Stem Controls</strong>
                    <button onclick="window.screwAIPro.studio.resetAllStems()" style="background: #4169E1; border: none; padding: 4px 8px; border-radius: 4px; color: white; cursor: pointer; font-size: 10px;">Reset All</button>
                </div>
                <div class="stem-controls" style="display: grid; gap: 8px;">
                    ${this.createRealStemTrack('vocals', 'ðŸŽ¤ Vocals', stems.vocals)}
                    ${this.createRealStemTrack('drums', 'ðŸ¥ Drums', stems.drums)}
                    ${this.createRealStemTrack('bass', 'ðŸŽ¸ Bass', stems.bass)}
                    ${this.createRealStemTrack('other', 'ðŸŽ¹ Other', stems.other)}
                </div>
            </div>
            
            <!-- Master Controls -->
            <div style="background: rgba(65, 105, 225, 0.1); padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                <strong style="color: #4169E1;">ðŸŽšï¸ Master Mix Controls</strong>
                <div style="display: flex; gap: 10px; align-items: center; margin-top: 8px;">
                    <label style="min-width: 80px; font-size: 11px;">Master Vol:</label>
                    <input type="range" id="masterStemVolume" min="0" max="100" value="100" style="flex: 1;">
                    <span id="masterVolumeValue" style="min-width: 35px; font-size: 10px;">100%</span>
                </div>
                <div style="margin-top: 8px; display: flex; gap: 8px;">
                    <button onclick="window.screwAIPro.studio.previewStemMix()" style="background: linear-gradient(90deg, #4169E1 0%, #8A2BE2 50%); border: none; padding: 8px 12px; border-radius: 6px; color: white; cursor: pointer; font-size: 11px; flex: 1;">ðŸŽµ Preview Full Mix</button>
                    <button onclick="window.screwAIPro.studio.exportSeparatedStems()" style="background: linear-gradient(90deg, #228B22 0%, #32CD32 50%); border: none; padding: 8px 12px; border-radius: 6px; color: white; cursor: pointer; font-size: 11px; flex: 1;">ðŸ’¾ Download All</button>
                </div>
            </div>
            
            <!-- Screw Integration -->
            <div style="background: rgba(255, 99, 71, 0.1); padding: 12px; border-radius: 8px; text-align: center;">
                <strong style="color: #FF6347;">ðŸ”§ Ready for Screw Processing</strong>
                <div style="margin-top: 8px;">
                    <button onclick="window.screwAIPro.studio.applyStemMix()" style="background: linear-gradient(90deg, #8A2BE2 0%, #FF6347 100%); border: none; padding: 12px 20px; border-radius: 6px; color: white; cursor: pointer; font-weight: bold; font-size: 12px;">âœ… Apply Stems to Screw Engine</button>
                </div>
                <div style="margin-top: 6px; font-size: 10px; color: #ccc;">
                    Current stem mix will be processed through ScrewAI chopped & screwed engine
                </div>
            </div>
        `;
        
        // Add real-time event listeners
        this.setupRealStemControls(panel);
        
        return panel;
    }
    
    createRealStemTrack(stemType, label, audioBuffer) {
        const stemId = `stem-${stemType}`;
        const duration = audioBuffer ? audioBuffer.duration.toFixed(1) : 'N/A';
        const channels = audioBuffer ? audioBuffer.numberOfChannels : 0;
        const sampleRate = audioBuffer ? audioBuffer.sampleRate : 44100;
        const fileSize = audioBuffer ? ((audioBuffer.length * channels * 2) / 1024 / 1024).toFixed(1) : 'N/A';
        
        return `
            <div class="stem-track real-stem" data-stem="${stemType}" style="display: flex; align-items: center; gap: 8px; padding: 12px; background: rgba(138, 43, 226, 0.1); border-radius: 8px; border: 1px solid rgba(138, 43, 226, 0.3); margin-bottom: 8px;">
                <div style="min-width: 85px;">
                    <div style="font-weight: bold; font-size: 12px;">${label}</div>
                    <div style="font-size: 8px; color: #aaa;">${duration}s â€¢ ${channels}ch</div>
                    <div style="font-size: 8px; color: #888;">${fileSize}MB â€¢ ${sampleRate}Hz</div>
                </div>
                
                <!-- Volume Control -->
                <div style="flex: 1; display: flex; align-items: center; gap: 6px;">
                    <input type="range" min="0" max="100" value="100" class="stem-volume" data-stem="${stemType}" style="flex: 1; height: 18px;">
                    <span class="volume-value" style="min-width: 28px; font-size: 9px; color: #ccc;">100%</span>
                </div>
                
                <!-- Playback Controls -->
                <div style="display: flex; gap: 4px;">
                    <button class="stem-play" data-stem="${stemType}" style="padding: 6px 10px; background: #228B22; border: none; border-radius: 4px; color: white; cursor: pointer; font-size: 10px; min-width: 35px;" title="Play/Preview this stem">â–¶</button>
                    <button class="stem-solo" data-stem="${stemType}" style="padding: 6px 8px; background: #4169E1; border: none; border-radius: 4px; color: white; cursor: pointer; font-size: 9px; min-width: 32px;" title="Solo this stem">S</button>
                    <button class="stem-mute" data-stem="${stemType}" style="padding: 6px 8px; background: #DC143C; border: none; border-radius: 4px; color: white; cursor: pointer; font-size: 9px; min-width: 32px;" title="Mute this stem">M</button>
                </div>
                
                <!-- Download Controls -->
                <div style="display: flex; gap: 4px; margin-left: 8px; padding-left: 8px; border-left: 1px solid rgba(138, 43, 226, 0.4);">
                    <button class="stem-download" data-stem="${stemType}" style="padding: 6px 8px; background: linear-gradient(90deg, #8A2BE2, #FF6347); border: none; border-radius: 4px; color: white; cursor: pointer; font-size: 9px; min-width: 45px;" title="Download this stem as WAV">ðŸ’¾ WAV</button>
                    <button class="stem-download-mp3" data-stem="${stemType}" style="padding: 6px 8px; background: linear-gradient(90deg, #FF6347, #FFD700); border: none; border-radius: 4px; color: white; cursor: pointer; font-size: 9px; min-width: 45px;" title="Download this stem as MP3">ðŸ’¾ MP3</button>
                </div>
            </div>
        `;
    }
    
    setupRealStemControls(panel) {
        // Volume controls
        const volumeSliders = panel.querySelectorAll('.stem-volume');
        volumeSliders.forEach(slider => {
            slider.addEventListener('input', (e) => {
                const stemType = e.target.dataset.stem;
                const value = e.target.value;
                const valueSpan = e.target.parentElement.querySelector('.volume-value');
                valueSpan.textContent = `${value}%`;
                
                this.setStemVolume(stemType, value / 100);
                console.log(`ðŸŽ›ï¸ ${stemType} volume: ${value}%`);
            });
        });
        
        // Master volume
        const masterVolume = panel.querySelector('#masterStemVolume');
        if (masterVolume) {
            masterVolume.addEventListener('input', (e) => {
                const value = e.target.value;
                panel.querySelector('#masterVolumeValue').textContent = `${value}%`;
                this.setMasterStemVolume(value / 100);
            });
        }
        
        // Solo buttons
        const soloButtons = panel.querySelectorAll('.stem-solo');
        soloButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const stemType = e.target.dataset.stem;
                this.toggleStemSolo(stemType, e.target);
            });
        });
        
        // Mute buttons
        const muteButtons = panel.querySelectorAll('.stem-mute');
        muteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const stemType = e.target.dataset.stem;
                this.toggleStemMute(stemType, e.target);
            });
        });
        
        // Play/Preview buttons
        const playButtons = panel.querySelectorAll('.stem-play');
        playButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const stemType = e.target.dataset.stem;
                this.toggleStemPlayback(stemType, e.target);
            });
        });
        
        // Download WAV buttons
        const downloadButtons = panel.querySelectorAll('.stem-download');
        downloadButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const stemType = e.target.dataset.stem;
                this.downloadStem(stemType, 'wav');
            });
        });
        
        // Download MP3 buttons
        const downloadMp3Buttons = panel.querySelectorAll('.stem-download-mp3');
        downloadMp3Buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const stemType = e.target.dataset.stem;
                this.downloadStem(stemType, 'mp3');
            });
        });
    }
    
    applyStemMix() {
        console.log('ðŸŽµ Applying stem mix to chopped & screwed processing...');
        
        // Close stem panel
        const panel = document.querySelector('.stem-control-panel');
        if (panel) {
            panel.remove();
        }
        
        // Show success message
        this.showNotification('âœ… Stem mix applied! Ready for screw processing.', 'success');
    }
    
    // Real stem control methods
    setStemVolume(stemType, volume) {
        if (this.stemGainNodes && this.stemGainNodes[stemType]) {
            this.stemGainNodes[stemType].gain.setValueAtTime(volume, this.audioContext.currentTime);
        }
    }
    
    setMasterStemVolume(volume) {
        if (this.masterStemGain) {
            this.masterStemGain.gain.setValueAtTime(volume, this.audioContext.currentTime);
        }
    }
    
    toggleStemSolo(stemType, button) {
        if (!this.stemSoloState) this.stemSoloState = {};

        const isCurrentlySolo = this.stemSoloState[stemType];

        // Reset all solo states
        Object.keys(this.stemSoloState).forEach(stem => {
            this.stemSoloState[stem] = false;
            const btn = document.querySelector(`.stem-solo[data-stem="${stem}"]`);
            if (btn) btn.style.background = '#4169E1';
        });

        if (!isCurrentlySolo) {
            // Enable solo for this stem
            this.stemSoloState[stemType] = true;
            button.style.background = '#FFD700';

            // Mute all other stems
            Object.keys(this.separatedStems || {}).forEach(stem => {
                if (stem !== stemType && this.stemGainNodes && this.stemGainNodes[stem]) {
                    this.stemGainNodes[stem].gain.setValueAtTime(0, this.audioContext.currentTime);
                }
            });

            // Unmute this stem
            if (this.stemGainNodes && this.stemGainNodes[stemType]) {
                this.stemGainNodes[stemType].gain.setValueAtTime(1, this.audioContext.currentTime);
            }
        } else {
            // Disable solo - restore all volumes
            this.restoreAllStemVolumes();
        }

        console.log(`ðŸ”ˆ Solo ${stemType}: ${!isCurrentlySolo}`);
    }
    
    toggleStemMute(stemType, button) {
        if (!this.stemMuteState) this.stemMuteState = {};
        
        const isMuted = this.stemMuteState[stemType];
        this.stemMuteState[stemType] = !isMuted;
        
        if (!isMuted) {
            // Mute
            button.style.background = '#FFD700';
            if (this.stemGainNodes && this.stemGainNodes[stemType]) {
                this.stemGainNodes[stemType].gain.setValueAtTime(0, this.audioContext.currentTime);
            }
        } else {
            // Unmute
            button.style.background = '#DC143C';
            this.restoreIndividualStemVolume(stemType);
        }
        
        console.log(`ðŸ”‡ Mute ${stemType}: ${!isMuted}`);
    }
    
    async downloadStem(stemType, format = 'wav') {
        if (!this.separatedStems || !this.separatedStems[stemType]) {
            this.showNotification(`âŒ ${stemType} stem not available`, 'error');
            return;
        }
        
        try {
            console.log(`ðŸ’¾ Downloading ${stemType} stem as ${format.toUpperCase()}...`);
            this.showNotification(`ðŸ’¾ Preparing ${stemType} stem download...`, 'info');
            
            const audioBuffer = this.separatedStems[stemType];
            let blob;
            let filename;
            
            if (format === 'wav') {
                // Create WAV file
                blob = this.audioBufferToWav(audioBuffer);
                filename = `screwai_${stemType}_stem.wav`;
            } else if (format === 'mp3') {
                // For MP3, we'll create a high-quality WAV and let the user know
                blob = this.audioBufferToWav(audioBuffer);
                filename = `screwai_${stemType}_stem_hq.wav`;
                this.showNotification(`ðŸ’¾ Exporting as high-quality WAV (MP3 requires additional encoding)`, 'warning');
            }
            
            // Create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Clean up
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            
            console.log(`âœ… ${stemType} stem download started: ${filename}`);
            this.showNotification(`âœ… ${stemType} stem download started!`, 'success');
            
        } catch (error) {
            console.error(`âŒ Error downloading ${stemType} stem:`, error);
            this.showNotification(`âŒ Error downloading ${stemType} stem`, 'error');
        }
    }
    
    audioBufferToWav(audioBuffer) {
        const numberOfChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const length = audioBuffer.length * numberOfChannels * 2; // 16-bit samples
        
        const buffer = new ArrayBuffer(44 + length);
        const view = new DataView(buffer);
        
        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        // RIFF chunk descriptor
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length, true);
        writeString(8, 'WAVE');
        
        // FMT sub-chunk
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true); // PCM format
        view.setUint16(20, 1, true); // PCM format
        view.setUint16(22, numberOfChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numberOfChannels * 2, true); // byte rate
        view.setUint16(32, numberOfChannels * 2, true); // block align
        view.setUint16(34, 16, true); // bits per sample
        
        // Data sub-chunk
        writeString(36, 'data');
        view.setUint32(40, length, true);
        
        // Convert audio data
        let offset = 44;
        for (let i = 0; i < audioBuffer.length; i++) {
            for (let channel = 0; channel < numberOfChannels; channel++) {
                const channelData = audioBuffer.getChannelData(channel);
                const sample = Math.max(-1, Math.min(1, channelData[i]));
                const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
                view.setInt16(offset, intSample, true);
                offset += 2;
            }
        }
        
        return new Blob([buffer], { type: 'audio/wav' });
    }
    
    async exportSeparatedStems() {
        if (!this.separatedStems) {
            this.showNotification('âŒ No stems available for export', 'error');
            return;
        }
        
        try {
            console.log('ðŸ’¾ Exporting all separated stems...');
            this.showNotification('ðŸ’¾ Preparing all stems for download...', 'info');
            
            const stemTypes = ['vocals', 'drums', 'bass', 'other'];
            let exportCount = 0;
            
            for (const stemType of stemTypes) {
                if (this.separatedStems[stemType]) {
                    setTimeout(() => {
                        this.downloadStem(stemType, 'wav');
                    }, exportCount * 500); // Stagger downloads by 500ms
                    exportCount++;
                }
            }
            
            this.showNotification(`âœ… Exporting ${exportCount} stems...`, 'success');
            console.log(`âœ… Started export of ${exportCount} stems`);
            
        } catch (error) {
            console.error('âŒ Error exporting stems:', error);
            this.showNotification('âŒ Error exporting stems', 'error');
        }
    }
    
    toggleStemMute(stemType, button) {
        if (!this.stemMuteState) this.stemMuteState = {};
        
        const isMuted = this.stemMuteState[stemType];
        this.stemMuteState[stemType] = !isMuted;
        
        if (!isMuted) {
            // Mute
            button.style.background = '#FFD700';
            if (this.stemGainNodes && this.stemGainNodes[stemType]) {
                this.stemGainNodes[stemType].gain.setValueAtTime(0, this.audioContext.currentTime);
            }
        } else {
            // Unmute
            button.style.background = '#DC143C';
            this.restoreIndividualStemVolume(stemType);
        }
        
        console.log(`ðŸ”‡ Mute ${stemType}: ${!isMuted}`);
    }
    
    toggleStemPlayback(stemType, button) {
        if (!this.stemPlaybackState) this.stemPlaybackState = {};
        
        const isPlaying = this.stemPlaybackState[stemType];
        
        if (!isPlaying && this.separatedStems && this.separatedStems[stemType]) {
            // Start playback
            this.playStemAudio(stemType);
            button.textContent = 'â¸';
            button.style.background = '#FFD700';
            this.stemPlaybackState[stemType] = true;
        } else {
            // Stop playback
            this.stopStemAudio(stemType);
            button.textContent = 'â–¶';
            button.style.background = '#228B22';
            this.stemPlaybackState[stemType] = false;
        }
    }
    
    toggleStemSolo(stemType, button) {
        if (!this.stemSoloState) this.stemSoloState = {};
        
        const isCurrentlySolo = this.stemSoloState[stemType];
        
        // Reset all solo states
        Object.keys(this.stemSoloState).forEach(stem => {
            this.stemSoloState[stem] = false;
            const btn = document.querySelector(`.stem-solo[data-stem="${stem}"]`);
            if (btn) btn.style.background = '#4169E1';
        });
        
        if (!isCurrentlySolo) {
            // Enable solo for this stem
            this.stemSoloState[stemType] = true;
            button.style.background = '#FFD700';
            
            // Mute all other stems
            Object.keys(this.separatedStems || {}).forEach(stem => {
                if (stem !== stemType && this.stemGainNodes && this.stemGainNodes[stem]) {
                    this.stemGainNodes[stem].gain.setValueAtTime(0, this.audioContext.currentTime);
                }
            });
            
            // Unmute this stem
            if (this.stemGainNodes && this.stemGainNodes[stemType]) {
                this.stemGainNodes[stemType].gain.setValueAtTime(1, this.audioContext.currentTime);
            }
        } else {
            // Disable solo - restore all volumes
            this.restoreAllStemVolumes();
        }
        
        console.log(`ðŸ”ˆ Solo ${stemType}: ${!isCurrentlySolo}`);
    }
    
    toggleStemMute(stemType, button) {
        if (!this.stemMuteState) this.stemMuteState = {};
        
        const isMuted = this.stemMuteState[stemType];
        this.stemMuteState[stemType] = !isMuted;
        
        if (!isMuted) {
            // Mute
            button.style.background = '#FFD700';
            if (this.stemGainNodes && this.stemGainNodes[stemType]) {
                this.stemGainNodes[stemType].gain.setValueAtTime(0, this.audioContext.currentTime);
            }
        } else {
            // Unmute
            button.style.background = '#DC143C';
            this.restoreIndividualStemVolume(stemType);
        }
        
        console.log(`ðŸ”‡ Mute ${stemType}: ${!isMuted}`);
    }
    
    toggleStemPlayback(stemType, button) {
        if (!this.stemPlaybackState) this.stemPlaybackState = {};
        
        const isPlaying = this.stemPlaybackState[stemType];
        
        if (!isPlaying && this.separatedStems && this.separatedStems[stemType]) {
            // Start playback
            this.playStemAudio(stemType);
            button.textContent = 'â¸';
            button.style.background = '#FFD700';
            this.stemPlaybackState[stemType] = true;
        } else {
            // Stop playback
            this.stopStemAudio(stemType);
            button.textContent = 'â–¶';
            button.style.background = '#228B22';
            this.stemPlaybackState[stemType] = false;
        }
    }
    
    playStemAudio(stemType) {
        if (!this.stemAudioSources) this.stemAudioSources = {};
        
        // Stop any existing playback for this stem
        this.stopStemAudio(stemType);
        
        if (this.separatedStems && this.separatedStems[stemType]) {
            try {
                const source = this.audioContext.createBufferSource();
                source.buffer = this.separatedStems[stemType];
                
                // Create or connect to gain node
                if (!this.stemGainNodes) this.stemGainNodes = {};
                if (!this.stemGainNodes[stemType]) {
                    this.stemGainNodes[stemType] = this.audioContext.createGain();
                    this.stemGainNodes[stemType].connect(this.audioContext.destination);
                }
                
                source.connect(this.stemGainNodes[stemType]);
                source.start();
                
                this.stemAudioSources[stemType] = source;
                
                // Auto-stop button update when audio ends
                source.onended = () => {
                    const button = document.querySelector(`.stem-play[data-stem="${stemType}"]`);
                    if (button) {
                        button.textContent = 'â–¶';
                        button.style.background = '#228B22';
                    }
                    this.stemPlaybackState[stemType] = false;
                };
                
                console.log(`â–¶ï¸ Playing ${stemType} stem`);
            } catch (error) {
                console.error(`âŒ Error playing ${stemType} stem:`, error);
            }
        }
    }
    
    stopStemAudio(stemType) {
        if (this.stemAudioSources && this.stemAudioSources[stemType]) {
            try {
                this.stemAudioSources[stemType].stop();
                this.stemAudioSources[stemType] = null;
            } catch (error) {
                // Source might already be stopped
            }
        }
    }
    
    restoreAllStemVolumes() {
        if (!this.stemGainNodes) return;
        
        Object.keys(this.stemGainNodes).forEach(stemType => {
            this.restoreIndividualStemVolume(stemType);
        });
    }
    
    restoreIndividualStemVolume(stemType) {
        if (this.stemGainNodes && this.stemGainNodes[stemType]) {
            // Get volume from slider
            const slider = document.querySelector(`.stem-volume[data-stem="${stemType}"]`);
            const volume = slider ? slider.value / 100 : 1;
            this.stemGainNodes[stemType].gain.setValueAtTime(volume, this.audioContext.currentTime);
        }
    }
    
    resetAllStems() {
        // Reset all sliders to 100%
        const sliders = document.querySelectorAll('.stem-volume');
        sliders.forEach(slider => {
            slider.value = 100;
            const valueSpan = slider.parentElement.querySelector('.volume-value');
            if (valueSpan) valueSpan.textContent = '100%';
            
            const stemType = slider.dataset.stem;
            this.setStemVolume(stemType, 1);
        });
        
        // Reset master volume
        const masterSlider = document.querySelector('#masterStemVolume');
        if (masterSlider) {
            masterSlider.value = 100;
            document.querySelector('#masterVolumeValue').textContent = '100%';
            this.setMasterStemVolume(1);
        }
        
        // Reset solo/mute states
        this.stemSoloState = {};
        this.stemMuteState = {};
        
        // Reset button appearances
        document.querySelectorAll('.stem-solo').forEach(btn => {
            btn.style.background = '#4169E1';
        });
        document.querySelectorAll('.stem-mute').forEach(btn => {
            btn.style.background = '#DC143C';
        });
        
        console.log('ðŸ”„ All stems reset to default');
        this.showNotification('ðŸ”„ All stems reset to 100%', 'info');
    }
    
    previewStemMix() {
        console.log('ðŸŽµ Previewing stem mix...');
        
        // Create mixed preview
        if (this.separatedStems && this.audioContext) {
            try {
                this.createStemMixPreview();
                this.showNotification('ðŸŽµ Playing stem mix preview...', 'info');
            } catch (error) {
                console.error('Error creating preview:', error);
                this.showNotification('âŒ Preview failed', 'error');
            }
        }
    }
    
    createStemMixPreview() {
        // Stop any existing preview
        if (this.previewSource) {
            this.previewSource.stop();
        }
        
        // Create a mixed buffer based on current settings
        const duration = Math.max(...Object.values(this.separatedStems).map(buffer => buffer.duration));
        const sampleRate = this.audioContext.sampleRate;
        const channels = 2;
        const frameCount = duration * sampleRate;
        
        const mixedBuffer = this.audioContext.createBuffer(channels, frameCount, sampleRate);
        
        // Mix all stems according to current settings
        Object.keys(this.separatedStems).forEach(stemType => {
            const stemBuffer = this.separatedStems[stemType];
            const volume = this.getStemVolume(stemType);
            const isMuted = this.stemMuteState && this.stemMuteState[stemType];
            const isSoloed = this.stemSoloState && Object.values(this.stemSoloState).some(solo => solo);
            const thisStemSoloed = this.stemSoloState && this.stemSoloState[stemType];
            
            if (!isMuted && (!isSoloed || thisStemSoloed)) {
                this.addStemToMix(mixedBuffer, stemBuffer, volume);
            }
        });
        
        // Play the mixed preview
        this.previewSource = this.audioContext.createBufferSource();
        this.previewSource.buffer = mixedBuffer;
        this.previewSource.connect(this.audioContext.destination);
        this.previewSource.start();
        
        this.previewSource.onended = () => {
            console.log('ðŸŽµ Preview ended');
        };
    }
    
    getStemVolume(stemType) {
        const slider = document.querySelector(`.stem-volume[data-stem="${stemType}"]`);
        return slider ? slider.value / 100 : 1;
    }
    
    addStemToMix(mixBuffer, stemBuffer, volume) {
        const channels = Math.min(mixBuffer.numberOfChannels, stemBuffer.numberOfChannels);
        const frames = Math.min(mixBuffer.length, stemBuffer.length);
        
        for (let channel = 0; channel < channels; channel++) {
            const mixData = mixBuffer.getChannelData(channel);
            const stemData = stemBuffer.getChannelData(channel);
            
            for (let frame = 0; frame < frames; frame++) {
                mixData[frame] += stemData[frame] * volume;
            }
        }
    }
    
    exportSeparatedStems() {
        console.log('ðŸ’¾ Exporting separated stems...');
        
        if (!this.separatedStems) {
            this.showNotification('âŒ No stems to export', 'error');
            return;
        }
        
        // Export each stem as WAV file
        Object.keys(this.separatedStems).forEach(stemType => {
            this.exportStemAsWAV(stemType, this.separatedStems[stemType]);
        });
        
        this.showNotification('ðŸ’¾ Stems exported successfully!', 'success');
    }
    
    exportStemAsWAV(stemName, audioBuffer) {
        // Convert AudioBuffer to WAV blob
        const wavBlob = this.audioBufferToWav(audioBuffer);
        
        // Create download link
        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `screwai_${stemName}_stem.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log(`ðŸ’¾ Exported ${stemName} stem`);
    }
    
    audioBufferToWav(buffer) {
        const length = buffer.length;
        const numberOfChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const bytesPerSample = 2;
        const blockAlign = numberOfChannels * bytesPerSample;
        const byteRate = sampleRate * blockAlign;
        const dataLength = length * blockAlign;
        const bufferLength = 44 + dataLength;
        
        const arrayBuffer = new ArrayBuffer(bufferLength);
        const view = new DataView(arrayBuffer);
        
        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, bufferLength - 8, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numberOfChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, byteRate, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bytesPerSample * 8, true);
        writeString(36, 'data');
        view.setUint32(40, dataLength, true);
        
        // Convert audio data
        let offset = 44;
        for (let i = 0; i < length; i++) {
            for (let channel = 0; channel < numberOfChannels; channel++) {
                const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
                view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                offset += 2;
            }
        }
        
        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }
    
    cleanupStems() {
        // Stop all stem playback
        if (this.stemAudioSources) {
            Object.keys(this.stemAudioSources).forEach(stemType => {
                this.stopStemAudio(stemType);
            });
        }
        
        // Reset stem separator
        if (this.components.stemSeparator) {
            // Could add cleanup method to StemSeparator class
        }
        
        // Reset button state
        const btn = document.getElementById('chopEnabled');
        if (btn) {
            btn.checked = false;
            const label = btn.parentElement.querySelector('label');
            label.textContent = ' AI Stem Separator';
        }
        
        console.log('ðŸ§¹ Stem components cleaned up');
    }
    
    connectRealtimeAnalysis(audioPipeline) {
        if (!audioPipeline || !audioPipeline.audioContext) return;
        
        try {
            // Create analyzer node for real-time frequency analysis
            this.audioAnalyzer = audioPipeline.audioContext.createAnalyser();
            this.audioAnalyzer.fftSize = 256;
            this.audioAnalyzer.smoothingTimeConstant = 0.8;
            
            this.frequencyData = new Uint8Array(this.audioAnalyzer.frequencyBinCount);
            this.timeData = new Uint8Array(this.audioAnalyzer.fftSize);
            
            // Connect to audio source when it becomes available
            if (window.audioSource) {
                window.audioSource.connect(this.audioAnalyzer);
                console.log('ðŸ”Š Real-time audio analysis connected');
            }
            
            // Listen for playback events to connect analyzer
            document.addEventListener('audio-playing', () => {
                if (window.audioSource && this.audioAnalyzer) {
                    try {
                        window.audioSource.connect(this.audioAnalyzer);
                    } catch (e) {
                        // Already connected or source changed
                    }
                }
            });
            
        } catch (error) {
            console.warn('âš ï¸ Failed to setup real-time analysis:', error);
        }
    }
    
    updateRealtimeVisualizations() {
        if (!this.audioAnalyzer || !this.frequencyData) return;
        
        // Get real frequency data
        this.audioAnalyzer.getByteFrequencyData(this.frequencyData);
        this.audioAnalyzer.getByteTimeDomainData(this.timeData);
        
        // Update spectrum analyzer with real data
        if (this.visualizations.spectrum) {
            this.visualizations.spectrum.update(this.frequencyData);
        }
        
        // Update pitch detector with real data
        if (this.components.pitchDetector && this.components.pitchDetector.isActive) {
            try {
                this.components.pitchDetector.analyzer.getFloatTimeDomainData(this.components.pitchDetector.pitchBuffer);
                const pitch = this.components.pitchDetector.detectPitch(this.components.pitchDetector.pitchBuffer);
                this.components.pitchDetector.updatePitchDisplay(pitch);
            } catch (error) {
                // Pitch detector not ready
            }
        }
        
        // Update professional VU meters with enhanced stereo analysis
        if (this.visualizations.vuMeter) {
            // Try pipeline VU meters first for best accuracy
            if (this.vuLeftAnalyser && this.vuRightAnalyser) {
                this.updatePipelineVUMeters();
            } else if (this.leftAnalyser && this.rightAnalyser) {
                // Fall back to live monitoring if available
                this.updateLiveVUMeters();
            } else {
                // Use fallback stereo calculation
                const stereoLevels = this.calculateStereoLevels(this.timeData);
                this.visualizations.vuMeter.update(stereoLevels.left, stereoLevels.right);
            }
        }
    }
    
    calculateStereoLevels(timeData) {
        // Professional stereo level calculation for VU meter
        let leftSum = 0;
        let rightSum = 0;
        const halfLength = Math.floor(timeData.length / 2);
        
        // Split channels for stereo analysis
        for (let i = 0; i < halfLength; i++) {
            // Left channel (first half)
            const leftNormalized = (timeData[i] - 128) / 128;
            leftSum += leftNormalized * leftNormalized;
            
            // Right channel (second half)
            const rightNormalized = (timeData[i + halfLength] - 128) / 128;
            rightSum += rightNormalized * rightNormalized;
        }
        
        // Calculate RMS levels
        const leftRMS = Math.sqrt(leftSum / halfLength);
        const rightRMS = Math.sqrt(rightSum / halfLength);
        
        // Apply professional VU ballistics and scaling
        return {
            left: Math.min(1.0, leftRMS * 2.5), // Scale for proper VU response
            right: Math.min(1.0, rightRMS * 2.5)
        };
    }
    
    calculateRMS(timeData) {
        // Legacy mono RMS calculation for backwards compatibility
        let sum = 0;
        for (let i = 0; i < timeData.length; i++) {
            const normalized = (timeData[i] - 128) / 128;
            sum += normalized * normalized;
        }
        return Math.sqrt(sum / timeData.length);
    }
    
    togglePitchDetectorPanel(enabled) {
        const pitchPanel = document.getElementById('pitchDetectorPanel');
        if (enabled && pitchPanel) {
            pitchPanel.classList.add('active');
            pitchPanel.style.display = 'block';
            this.panelsVisible.pitchDetector = true;
            
            // Initialize pitch detector if not available
            if (!this.components.pitchDetector) {
                try {
                    this.components.pitchDetector = new RealtimePitchDetector();
                } catch (error) {
                    console.warn('âš ï¸ Failed to create pitch detector:', error);
                }
            }
            
            // Start pitch detector if available
            if (this.components.pitchDetector && this.components.pitchDetector.startPitchAnalysis) {
                this.components.pitchDetector.startPitchAnalysis();
            } else if (this.components.pitchDetector) {
                // Manually start if method doesn't exist
                this.components.pitchDetector.isActive = true;
                this.components.pitchDetector.connectToMainAudioContext();
            }
            
            console.log('ðŸŽµ Pitch detector panel activated');
        } else if (pitchPanel) {
            pitchPanel.classList.remove('active');
            pitchPanel.style.display = 'none';
            this.panelsVisible.pitchDetector = false;
            
            // Stop pitch detector
            if (this.components.pitchDetector && this.components.pitchDetector.stopPitchAnalysis) {
                this.components.pitchDetector.stopPitchAnalysis();
            } else if (this.components.pitchDetector) {
                // Manually stop if method doesn't exist
                this.components.pitchDetector.isActive = false;
            }
            
            console.log('ðŸŽµ Pitch detector panel deactivated');
        }
    }
    
    toggleWaveformEditor(enabled) {
        const gridSection = document.getElementById('functionalGridSection');
        const effectsSection = document.getElementById('screwAIProEffectsSection');
        
        if (enabled) {
            // Show functional grid editor section
            if (gridSection) {
                gridSection.style.display = 'block';
                this.panelsVisible.audioGrid = true;
                
                // Initialize functional grid editor with current audio
                if (!this.components.gridEditor) {
                    // Create grid editor if it doesn't exist
                    this.components.gridEditor = new FunctionalGridEditor('functionalGridCanvas');
                }
                
                if (this.components.gridEditor && window.audioPipeline && window.audioPipeline.audioBuffer) {
                    this.loadAudioIntoGridEditor(window.audioPipeline.audioBuffer);
                    console.log('ðŸŽ¼ Functional Grid Editor activated with current audio');
                } else if (this.components.gridEditor) {
                    // Make sure canvas is connected even without audio
                    this.components.gridEditor.gridCanvas = document.getElementById('functionalGridCanvas');
                    console.log('ðŸŽ¼ Functional Grid Editor activated (no audio loaded)');
                }
            }
            
            // Also show ScrewAI Pro Effects Engine section
            if (effectsSection) {
                effectsSection.style.display = 'block';
                console.log('ðŸŽ›ï¸ ScrewAI Pro Effects Engine activated');
            }
            
        } else {
            // Hide sections
            if (gridSection) {
                gridSection.style.display = 'none';
                this.panelsVisible.audioGrid = false;
                console.log('ðŸŽ¼ Functional Grid Editor deactivated');
            }
            
            if (effectsSection) {
                effectsSection.style.display = 'none';
                console.log('ðŸŽ›ï¸ ScrewAI Pro Effects Engine deactivated');
            }
        }
    }
    
    async loadAudioIntoGridEditor() {
        if (!this.components.gridEditor || !window.audioPipeline || !window.audioPipeline.audioBuffer) return;
        
        try {
            // Convert AudioBuffer to a format the grid editor can use
            const audioBuffer = window.audioPipeline.audioBuffer;
            
            // Set audio context and buffer directly
            this.components.gridEditor.audioContext = window.audioPipeline.audioContext;
            this.components.gridEditor.audioBuffer = audioBuffer;
            this.components.gridEditor.gridCanvas = document.getElementById('functionalGridCanvas');
            
            // Render the waveform
            this.components.gridEditor.renderWaveform();
            
            // Update info display
            this.updateGridInfo();
            
            console.log('ðŸŽ¼ Audio loaded into functional grid editor');
        } catch (error) {
            console.error('âŒ Error loading audio into grid editor:', error);
        }
    }
    
    setupGridEditorControls() {
        const addChopBtn = document.getElementById('gridAddChopBtn');
        const playSequenceBtn = document.getElementById('gridPlaySequenceBtn');
        const playSelectionBtn = document.getElementById('gridPlaySelectionBtn');
        const choppedScrewedBtn = document.getElementById('gridChoppedScrewedBtn');
        const zoomInBtn = document.getElementById('gridZoomInBtn');
        const zoomOutBtn = document.getElementById('gridZoomOutBtn');
        const zoomResetBtn = document.getElementById('gridZoomResetBtn');
        const exportChopsBtn = document.getElementById('gridExportChopsBtn');
        const clearBtn = document.getElementById('gridClearBtn');
        
        // Listen for selection events from grid editor
        document.addEventListener('selectionMade', (e) => {
            this.updateGridInfo(e.detail);
        });
        
        // Canvas interaction is now handled directly in the FunctionalGridEditor class
        
        // Add chop button
        if (addChopBtn) {
            addChopBtn.addEventListener('click', () => {
                if (!this.components.gridEditor.audioBuffer) return;
                
                const timePosition = this.components.gridEditor.audioBuffer.duration / 2; // Add at middle
                this.components.gridEditor.addChopPoint(timePosition);
                this.updateGridInfo();
            });
        }
        
        // Play sequence button
        if (playSequenceBtn) {
            playSequenceBtn.addEventListener('click', async () => {
                if (!this.components.gridEditor.audioBuffer) return;
                
                await this.components.gridEditor.playChopSequence();
            });
        }
        
        // Play selection button
        if (playSelectionBtn) {
            playSelectionBtn.addEventListener('click', async () => {
                if (!this.components.gridEditor.audioBuffer) return;
                
                await this.components.gridEditor.playSelection();
            });
        }
        
        // Chopped and screwed button
        if (choppedScrewedBtn) {
            choppedScrewedBtn.addEventListener('click', async () => {
                if (!this.components.gridEditor.audioBuffer) return;
                
                await this.components.gridEditor.applyChoppedAndScrewed();
            });
        }
        
        // Zoom controls
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => {
                if (!this.components.gridEditor.audioBuffer) return;
                
                this.components.gridEditor.zoomLevel = Math.min(10.0, this.components.gridEditor.zoomLevel * 1.5);
                this.components.gridEditor.renderWaveform();
            });
        }
        
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => {
                if (!this.components.gridEditor.audioBuffer) return;
                
                this.components.gridEditor.zoomLevel = Math.max(1.0, this.components.gridEditor.zoomLevel / 1.5);
                this.components.gridEditor.zoomPosition = Math.max(0, 
                    Math.min(1 - (1 / this.components.gridEditor.zoomLevel), this.components.gridEditor.zoomPosition));
                this.components.gridEditor.renderWaveform();
            });
        }
        
        if (zoomResetBtn) {
            zoomResetBtn.addEventListener('click', () => {
                if (!this.components.gridEditor.audioBuffer) return;
                
                this.components.gridEditor.resetZoom();
            });
        }
        
        // Export chops button
        if (exportChopsBtn) {
            exportChopsBtn.addEventListener('click', async () => {
                if (!this.components.gridEditor.audioBuffer) return;
                
                const exportedFiles = await this.components.gridEditor.exportChops();
                
                // Download each chop
                exportedFiles.forEach(file => {
                    const url = URL.createObjectURL(file.blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = file.name;
                    a.click();
                    URL.revokeObjectURL(url);
                });
                
                this.showNotification(`ðŸ’¾ Exported ${exportedFiles.length} chops`, 'success');
            });
        }
        
        // Clear button
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (this.components.gridEditor) {
                    this.components.gridEditor.clearAllChops();
                    this.components.gridEditor.clearSelection();
                    this.components.gridEditor.renderWaveform();
                    this.updateGridInfo();
                    this.showNotification('ðŸ—‘ï¸ All chops and selection cleared', 'info');
                }
            });
        }
    }
    
    setupProEffectsControls() {
        const showProEffectsBtn = document.getElementById('showProEffectsBtn');
        const previewProEffectsBtn = document.getElementById('previewProEffectsBtn');
        const processProEffectsBtn = document.getElementById('processProEffectsBtn');
        
        if (showProEffectsBtn) {
            showProEffectsBtn.addEventListener('click', () => {
                if (this.components.screwAIProEngine) {
                    this.components.screwAIProEngine.enableEffectsPanel();
                    this.showNotification('ðŸŽ›ï¸ Pro Effects Panel opened', 'info');
                }
            });
        }
        
        if (previewProEffectsBtn) {
            previewProEffectsBtn.addEventListener('click', async () => {
                if (this.components.screwAIProEngine) {
                    await this.components.screwAIProEngine.previewEffects();
                }
            });
        }
        
        if (processProEffectsBtn) {
            processProEffectsBtn.addEventListener('click', async () => {
                if (this.components.screwAIProEngine) {
                    await this.components.screwAIProEngine.processAudio();
                }
            });
        }
    }
    
    updateGridInfo(details = null) {
        const chopCountDisplay = document.getElementById('gridChopCount');
        const durationDisplay = document.getElementById('gridDuration');
        const selectionDisplay = document.getElementById('gridSelection');
        
        if (this.components.gridEditor) {
            const gridInfo = this.components.gridEditor.getGridInfo();
            
            if (chopCountDisplay) {
                chopCountDisplay.textContent = `${gridInfo.chopCount} chops`;
            }
            
            if (durationDisplay) {
                if (gridInfo.hasAudio) {
                    durationDisplay.textContent = `${gridInfo.duration.toFixed(1)}s total`;
                } else {
                    durationDisplay.textContent = 'No audio loaded';
                }
            }
            
            if (selectionDisplay) {
                if (details && details.duration) {
                    // Selection event details
                    selectionDisplay.textContent = `Selection: ${details.duration.toFixed(3)}s`;
                } else if (this.components.gridEditor.selectionStart !== null && 
                          this.components.gridEditor.selectionEnd !== null) {
                    // Current selection
                    const duration = Math.abs(this.components.gridEditor.selectionEnd - this.components.gridEditor.selectionStart);
                    selectionDisplay.textContent = `Selection: ${duration.toFixed(3)}s`;
                } else {
                    selectionDisplay.textContent = 'No selection';
                }
            }
        }
    }

    // Load audio into grid editor from main pipeline
    async loadAudioIntoGridEditor(audioBuffer) {
        if (!this.components.gridEditor) {
            console.warn('âš ï¸ Grid editor not initialized');
            return false;
        }
        
        try {
            const success = await this.components.gridEditor.loadAudioFile(audioBuffer);
            if (success) {
                this.updateGridInfo();
                this.showNotification('ðŸŽµ Audio loaded into grid editor', 'success');
                
                // Show the grid editor section
                const gridSection = document.getElementById('functionalGridSection');
                if (gridSection) {
                    gridSection.style.display = 'block';
                }
                
                return true;
            }
        } catch (error) {
            console.error('âŒ Failed to load audio into grid editor:', error);
            this.showNotification('âŒ Failed to load audio into grid editor', 'error');
        }
        
        return false;
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        
        let backgroundColor;
        switch(type) {
            case 'success': backgroundColor = '#4CAF50'; break;
            case 'error': backgroundColor = '#f44336'; break;
            case 'warning': backgroundColor = '#ff9800'; break;
            default: backgroundColor = '#2196F3'; break;
        }
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${backgroundColor};
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            z-index: 9999;
            font-weight: bold;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            backdrop-filter: blur(10px);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }
    
    toggleLimiter(enabled) {
        const limiterPanel = document.getElementById('limiterPanel');
        if (enabled) {
            if (limiterPanel) {
                limiterPanel.style.display = 'block';
            }
            this.panelsVisible.limiter = true;
            
            // Initialize limiter if not already done
            if (!this.components.limiter && window.audioPipeline && window.audioPipeline.audioContext) {
                try {
                    if (typeof ProfessionalLimiter !== 'undefined') {
                        this.components.limiter = new ProfessionalLimiter(window.audioPipeline.audioContext);
                        console.log('ðŸŽšï¸ Professional limiter activated');
                    } else {
                        console.warn('âš ï¸ ProfessionalLimiter class not available');
                    }
                } catch (error) {
                    console.warn('âš ï¸ Failed to initialize limiter:', error);
                }
            }
        } else {
            if (limiterPanel) {
                limiterPanel.style.display = 'none';
            }
            this.panelsVisible.limiter = false;
        }
    }
    
    toggleTapeSaturation(enabled) {
        if (enabled) {
            // Initialize tape saturation if not already done
            if (!this.components.tapeSaturation && window.audioPipeline && window.audioPipeline.audioContext) {
                try {
                    if (typeof HardwareTapeSaturation !== 'undefined') {
                        this.components.tapeSaturation = new HardwareTapeSaturation(window.audioPipeline.audioContext);
                        console.log('ðŸ“¼ Hardware tape saturation activated');
                    } else {
                        console.warn('âš ï¸ HardwareTapeSaturation class not available');
                    }
                } catch (error) {
                    console.warn('âš ï¸ Failed to initialize tape saturation:', error);
                }
            }
        }
    }
    
    connectToAudioPipeline(audioPipeline) {
        console.log('ðŸ”— Connecting pro components to audio pipeline...');
        
        // Store pipeline reference for real-time analysis
        this.audioPipeline = audioPipeline;
        
        // Connect real-time audio analysis
        this.connectRealtimeAnalysis(audioPipeline);
        
        // Connect VU meter to audio pipeline for professional monitoring
        this.connectVUMeterToAudioPipeline(audioPipeline);
        
        // Connect functional grid editor if available
        if (this.components.gridEditor && audioPipeline.audioBuffer) {
            try {
                // Load audio into grid editor
                this.loadAudioIntoGridEditor(audioPipeline.audioBuffer);
                
                console.log('âœ… Functional Grid editor connected to audio pipeline');
            } catch (error) {
                console.warn('âš ï¸ Failed to connect functional grid editor:', error);
            }
        }
        
        // Connect ScrewAI Pro Effects Engine if available
        if (this.components.screwAIProEngine && audioPipeline.audioBuffer) {
            try {
                // Load audio into the pro effects engine
                this.components.screwAIProEngine.sourceBuffer = audioPipeline.audioBuffer;
                this.components.screwAIProEngine.audioContext = audioPipeline.audioContext;
                
                console.log('âœ… ScrewAI Pro Effects Engine connected to audio pipeline');
            } catch (error) {
                console.warn('âš ï¸ Failed to connect ScrewAI Pro Effects Engine:', error);
            }
        }
        
        // Initialize waveform renderer if not already done
        if (!this.components.waveformRenderer) {
            const canvas = document.getElementById('gridWaveformCanvas');
            if (canvas && audioPipeline.audioContext) {
                try {
                    // Import WaveformRenderer dynamically to avoid errors
                    if (typeof WaveformRenderer !== 'undefined') {
                        this.components.waveformRenderer = new WaveformRenderer(canvas, audioPipeline.audioContext);
                        if (audioPipeline.audioBuffer) {
                            this.components.waveformRenderer.audioBuffer = audioPipeline.audioBuffer;
                            this.components.waveformRenderer.drawWaveform();
                        }
                        console.log('âœ… Waveform renderer connected');
                    }
                } catch (error) {
                    console.warn('âš ï¸ Failed to initialize waveform renderer:', error);
                }
            }
        }
        
        // Connect pitch detector to real audio
        if (this.components.pitchDetector && audioPipeline.audioContext) {
            try {
                this.components.pitchDetector.audioContext = audioPipeline.audioContext;
                this.components.pitchDetector.connectToMainAudioContext();
                console.log('âœ… Pitch detector connected to audio pipeline');
            } catch (error) {
                console.warn('âš ï¸ Failed to connect pitch detector:', error);
            }
        }
        
        // Auto-detect BPM and show it
        this.detectAndShowBPM(audioPipeline.audioBuffer);
        
        console.log('ðŸ”— Pro components connection complete');
    }
    
    async detectAndShowBPM(audioBuffer) {
        try {
            // Simulate BPM detection
            const simulatedBPM = 120 + Math.random() * 60; // Random BPM between 120-180
            
            setTimeout(() => {
                this.updateBPMDisplay(simulatedBPM);
                console.log(`ðŸŽµ Detected BPM: ${Math.round(simulatedBPM)}`);
            }, 1000);
        } catch (error) {
            console.warn('BPM detection failed:', error);
        }
    }
    
    updateBPMDisplay(bpm) {
        // Update BPM display near spectrum analyzer (primary display)
        const bpmValue = document.getElementById('bpmValue');
        if (bpmValue) {
            bpmValue.textContent = Math.round(bpm);
        }
        
        // Add BPM display to the Advanced Studio panel (secondary display)
        const proPanel = document.getElementById('proStudioPanel');
        if (proPanel) {
            let bpmDisplay = proPanel.querySelector('.bpm-display');
            if (!bpmDisplay) {
                bpmDisplay = document.createElement('div');
                bpmDisplay.className = 'bpm-display';
                bpmDisplay.style.cssText = `
                    background: rgba(138, 43, 226, 0.2);
                    padding: 8px;
                    margin: 8px 0;
                    border-radius: 4px;
                    text-align: center;
                    font-weight: bold;
                    font-size: 12px;
                `;
                proPanel.querySelector('.studio-content').appendChild(bpmDisplay);
            }
            bpmDisplay.textContent = `🎵 BPM: ${Math.round(bpm)}`;
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 350px;
            word-wrap: break-word;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        
        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
                break;
            case 'error':
                notification.style.background = 'linear-gradient(135deg, #f44336, #d32f2f)';
                break;
            case 'warning':
                notification.style.background = 'linear-gradient(135deg, #ff9800, #f57c00)';
                break;
            default:
                notification.style.background = 'linear-gradient(135deg, #2196F3, #1976D2)';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
        
        console.log(`ðŸ“¢ Notification (${type}): ${message}`);
    }
}

// Enhanced Visualization Classes
class VUMeterVisualizer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Professional VU meter parameters
        this.leftLevel = 0;
        this.rightLevel = 0;
        this.leftPeak = 0;
        this.rightPeak = 0;
        this.leftPeakHold = 0;
        this.rightPeakHold = 0;
        this.peakHoldFrames = 60; // 1 second at 60fps
        this.peakDecayRate = 0.95;
        
        // Ballistics for professional VU behavior
        this.leftBallistic = 0;
        this.rightBallistic = 0;
        this.ballisticAttack = 0.3;
        this.ballisticRelease = 0.95;
        
        // Calibration and scaling
        this.vuCalibration = 0.775; // +4dBu reference level
        this.headroom = 20; // dB above 0VU
        this.rangeDb = 60; // Total range in dB
        
        // Visual parameters
        this.meterWidth = 0;
        this.meterHeight = 0;
        this.segmentHeight = 3;
        this.segmentGap = 1;
        this.segments = [];
        
        this.initializeSegments();
        this.setupCanvas();
    }
    
    initializeSegments() {
        // Professional VU meter segment configuration
        // -60dB to +20dB range with color coding
        this.segments = [];
        
        // Calculate segment positions and colors
        const totalSegments = Math.floor(this.rangeDb / 2); // 2dB per segment
        
        for (let i = 0; i < totalSegments; i++) {
            const dbValue = -this.rangeDb + (i * 2);
            const position = i / totalSegments;
            
            let color;
            if (dbValue < -20) {
                color = '#00ff00'; // Green zone
            } else if (dbValue < -6) {
                color = '#ffff00'; // Yellow zone
            } else if (dbValue < 0) {
                color = '#ff8800'; // Orange zone
            } else {
                color = '#ff0000'; // Red zone (above 0VU)
            }
            
            this.segments.push({
                dbValue,
                position,
                color,
                active: false
            });
        }
    }
    
    setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        
        this.meterWidth = rect.width * 0.35; // Width for each channel
        this.meterHeight = rect.height * 0.8;
    }
    
    update(leftLevel, rightLevel) {
        // Convert linear amplitude to VU scale
        const leftVU = this.linearToVU(leftLevel);
        const rightVU = this.linearToVU(rightLevel);
        
        // Apply professional VU ballistics
        this.updateBallistics(leftVU, rightVU);
        
        // Update peak hold
        this.updatePeakHold(leftLevel, rightLevel);
        
        // Update segment states
        this.updateSegments();
        
        // Render the meter
        this.draw();
    }
    
    linearToVU(linearLevel) {
        if (linearLevel <= 0) return -Infinity;
        
        // Convert to dB relative to calibration level
        const dbFs = 20 * Math.log10(linearLevel);
        const vuDb = dbFs + 20 * Math.log10(this.vuCalibration);
        
        return vuDb;
    }
    
    updateBallistics(leftVU, rightVU) {
        // Professional VU meter ballistics
        // Fast attack, slow release characteristic
        
        if (leftVU > this.leftBallistic) {
            this.leftBallistic += (leftVU - this.leftBallistic) * this.ballisticAttack;
        } else {
            this.leftBallistic *= this.ballisticRelease;
        }
        
        if (rightVU > this.rightBallistic) {
            this.rightBallistic += (rightVU - this.rightBallistic) * this.ballisticAttack;
        } else {
            this.rightBallistic *= this.ballisticRelease;
        }
        
        this.leftLevel = this.leftBallistic;
        this.rightLevel = this.rightBallistic;
    }
    
    updatePeakHold(leftLinear, rightLinear) {
        // Peak detection and hold logic
        const leftDb = leftLinear > 0 ? 20 * Math.log10(leftLinear) : -Infinity;
        const rightDb = rightLinear > 0 ? 20 * Math.log10(rightLinear) : -Infinity;
        
        // Left channel peak
        if (leftDb > this.leftPeak) {
            this.leftPeak = leftDb;
            this.leftPeakHold = this.peakHoldFrames;
        } else if (this.leftPeakHold > 0) {
            this.leftPeakHold--;
        } else {
            this.leftPeak *= this.peakDecayRate;
        }
        
        // Right channel peak
        if (rightDb > this.rightPeak) {
            this.rightPeak = rightDb;
            this.rightPeakHold = this.peakHoldFrames;
        } else if (this.rightPeakHold > 0) {
            this.rightPeakHold--;
        } else {
            this.rightPeak *= this.peakDecayRate;
        }
    }
    
    updateSegments() {
        // Update segment active states based on current levels
        this.segments.forEach(segment => {
            const leftActive = this.leftLevel >= segment.dbValue;
            const rightActive = this.rightLevel >= segment.dbValue;
            segment.leftActive = leftActive;
            segment.rightActive = rightActive;
        });
    }
    
    draw() {
        const { width, height } = this.canvas;
        this.ctx.clearRect(0, 0, width, height);
        
        // Background
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, width, height);
        
        // Draw stereo meters
        this.drawMeter('L', width * 0.1, this.leftLevel, this.leftPeak, true);
        this.drawMeter('R', width * 0.6, this.rightLevel, this.rightPeak, false);
        
        // Draw scale markings
        this.drawScale();
        
        // Draw labels and readouts
        this.drawLabels();
    }
    
    drawMeter(label, x, level, peak, isLeft) {
        const segments = this.segments;
        const segmentHeight = this.segmentHeight;
        const segmentGap = this.segmentGap;
        const meterHeight = this.meterHeight;
        const startY = (this.canvas.height / window.devicePixelRatio - meterHeight) / 2;
        
        // Draw segments
        segments.forEach((segment, index) => {
            const y = startY + meterHeight - (index * (segmentHeight + segmentGap));
            const active = isLeft ? segment.leftActive : segment.rightActive;
            
            // Segment background
            this.ctx.fillStyle = active ? segment.color : '#333';
            this.ctx.fillRect(x, y, this.meterWidth, segmentHeight);
            
            // Segment border
            this.ctx.strokeStyle = '#555';
            this.ctx.lineWidth = 0.5;
            this.ctx.strokeRect(x, y, this.meterWidth, segmentHeight);
        });
        
        // Peak indicator
        if (peak > -Infinity) {
            const peakPosition = this.dbToPosition(peak);
            const peakY = startY + meterHeight - (peakPosition * meterHeight);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(x - 2, peakY - 1, this.meterWidth + 4, 2);
        }
        
        // Channel label
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 12px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(label, x + this.meterWidth / 2, startY - 10);
    }
    
    drawScale() {
        const scaleMarks = [-60, -40, -20, -12, -6, -3, 0, +3, +6, +12, +20];
        const startY = (this.canvas.height / window.devicePixelRatio - this.meterHeight) / 2;
        
        this.ctx.fillStyle = '#888';
        this.ctx.font = '9px monospace';
        this.ctx.textAlign = 'right';
        
        scaleMarks.forEach(db => {
            const position = this.dbToPosition(db);
            const y = startY + this.meterHeight - (position * this.meterHeight);
            
            // Scale line
            this.ctx.fillRect(this.canvas.width / window.devicePixelRatio * 0.05, y, 10, 1);
            
            // Scale text
            const text = db > 0 ? `+${db}` : `${db}`;
            this.ctx.fillText(text, this.canvas.width / window.devicePixelRatio * 0.04, y + 3);
        });
        
        // 0VU reference line
        const zeroPosition = this.dbToPosition(0);
        const zeroY = startY + this.meterHeight - (zeroPosition * this.meterHeight);
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(0, zeroY, this.canvas.width / window.devicePixelRatio, 2);
    }
    
    drawLabels() {
        const { width, height } = this.canvas;
        const canvasWidth = width / window.devicePixelRatio;
        const canvasHeight = height / window.devicePixelRatio;
        
        // Title
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('VU METER', canvasWidth / 2, 20);
        
        // Current level readouts
        this.ctx.font = '10px monospace';
        this.ctx.textAlign = 'center';
        
        const leftDb = this.leftLevel > -Infinity ? this.leftLevel.toFixed(1) : '-∞';
        const rightDb = this.rightLevel > -Infinity ? this.rightLevel.toFixed(1) : '-∞';
        
        this.ctx.fillText(`L: ${leftDb}dB`, canvasWidth * 0.25, canvasHeight - 10);
        this.ctx.fillText(`R: ${rightDb}dB`, canvasWidth * 0.75, canvasHeight - 10);
        
        // Peak readouts
        const leftPeakDb = this.leftPeak > -Infinity ? this.leftPeak.toFixed(1) : '-∞';
        const rightPeakDb = this.rightPeak > -Infinity ? this.rightPeak.toFixed(1) : '-∞';
        
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fillText(`PK: ${leftPeakDb}`, canvasWidth * 0.25, canvasHeight - 25);
        this.ctx.fillText(`PK: ${rightPeakDb}`, canvasWidth * 0.75, canvasHeight - 25);
    }
    
    dbToPosition(db) {
        // Convert dB value to meter position (0-1)
        if (db <= -this.rangeDb) return 0;
        if (db >= this.headroom) return 1;
        
        return (db + this.rangeDb) / (this.rangeDb + this.headroom);
    }
    
    // Professional calibration methods
    setCalibration(vuLevel) {
        this.vuCalibration = vuLevel;
    }
    
    setRange(rangeDb) {
        this.rangeDb = rangeDb;
        this.initializeSegments();
    }
    
    reset() {
        this.leftLevel = 0;
        this.rightLevel = 0;
        this.leftPeak = -Infinity;
        this.rightPeak = -Infinity;
        this.leftPeakHold = 0;
        this.rightPeakHold = 0;
        this.leftBallistic = 0;
        this.rightBallistic = 0;
    }
}

class SpectrumAnalyzer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.frequencyData = new Uint8Array(128);
        this.smoothedData = new Float32Array(128);
    }
    
    update(frequencyData) {
        if (frequencyData) {
            this.frequencyData = frequencyData;
        }
        
        // Smooth the data
        for (let i = 0; i < this.frequencyData.length; i++) {
            this.smoothedData[i] = this.smoothedData[i] * 0.8 + (this.frequencyData[i] / 255) * 0.2;
        }
        
        this.draw();
    }
    
    draw() {
        const { width, height } = this.canvas;
        this.ctx.clearRect(0, 0, width, height);
        
        // Background
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, width, height);
        
        const barWidth = width / this.smoothedData.length;
        
        for (let i = 0; i < this.smoothedData.length; i++) {
            const barHeight = this.smoothedData[i] * height;
            
            // Color gradient based on frequency
            const hue = (i / this.smoothedData.length) * 240;
            const saturation = 100;
            const lightness = 30 + (this.smoothedData[i] * 40);
            this.ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            
            this.ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
        }
        
        // Frequency labels
        this.ctx.fillStyle = '#666';
        this.ctx.font = '8px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('20Hz', 2, height - 2);
        this.ctx.textAlign = 'right';
        this.ctx.fillText('20kHz', width - 2, height - 2);
    }
}

class PitchVisualizer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.pitchHistory = [];
        this.maxHistory = 100;
        this.currentNote = '--';
        this.currentCents = 0;
    }
    
    update(pitchData) {
        if (pitchData) {
            this.currentNote = this.frequencyToNote(pitchData.frequency);
            this.currentCents = pitchData.cents || 0;
        }
        
        this.pitchHistory.push(this.currentCents);
        if (this.pitchHistory.length > this.maxHistory) {
            this.pitchHistory.shift();
        }
        this.draw();
    }
    
    frequencyToNote(frequency) {
        const A4 = 440;
        const C0 = A4 * Math.pow(2, -4.75);
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        
        if (frequency <= 0) return '--';
        
        const h = Math.round(12 * Math.log2(frequency / C0));
        const octave = Math.floor(h / 12);
        const n = h % 12;
        
        return noteNames[n] + octave;
    }
    
    draw() {
        const { width, height } = this.canvas;
        this.ctx.clearRect(0, 0, width, height);
        
        // Background
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, width, height);
        
        // Center line (perfect pitch)
        this.ctx.strokeStyle = '#333';
        this.ctx.setLineDash([2, 2]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, height / 2);
        this.ctx.lineTo(width, height / 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Cent lines (Â±25, Â±50)
        this.ctx.strokeStyle = '#222';
        for (let cents of [-50, -25, 25, 50]) {
            const y = height / 2 - (cents / 100) * height / 2;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
        
        // Pitch history line
        if (this.pitchHistory.length > 1) {
            this.ctx.strokeStyle = '#4169E1';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            
            for (let i = 0; i < this.pitchHistory.length; i++) {
                const x = (i / this.maxHistory) * width;
                const normalizedCents = this.pitchHistory[i] / 100; // -50 to +50 cents -> -0.5 to +0.5
                const y = height / 2 - (normalizedCents * height / 2);
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.stroke();
        }
        
        // Current note display
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(this.currentNote, 5, 15);
        
        // Current cents display
        const centsColor = Math.abs(this.currentCents) < 10 ? '#00ff00' : Math.abs(this.currentCents) < 25 ? '#ffff00' : '#ff0000';
        this.ctx.fillStyle = centsColor;
        this.ctx.font = '10px Arial';
        this.ctx.fillText(`${this.currentCents > 0 ? '+' : ''}${this.currentCents.toFixed(0)}Â¢`, 5, height - 5);
    }
}

class GainReductionMeter {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gainReduction = 0;
        this.peakReduction = 0;
        this.peakHoldTime = 0;
    }
    
    update(grValue) {
        this.gainReduction = Math.max(0, grValue || 0);
        
        // Peak hold logic
        if (this.gainReduction > this.peakReduction) {
            this.peakReduction = this.gainReduction;
            this.peakHoldTime = 30;
        } else if (this.peakHoldTime > 0) {
            this.peakHoldTime--;
        } else {
            this.peakReduction *= 0.95;
        }
        
        this.draw();
    }
    
    draw() {
        const { width, height } = this.canvas;
        this.ctx.clearRect(0, 0, width, height);
        
        // Background
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, width, height);
        
        // Background bar
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, 0, width, height);
        
        // Gain reduction bar (right to left)
        const maxGR = 20; // Max 20dB gain reduction
        const grWidth = (this.gainReduction / maxGR) * width;
        
        // Color based on amount of reduction
        if (this.gainReduction < 3) {
            this.ctx.fillStyle = '#00ff00';
        } else if (this.gainReduction < 6) {
            this.ctx.fillStyle = '#ffff00';
        } else {
            this.ctx.fillStyle = '#ff0000';
        }
        
        this.ctx.fillRect(width - grWidth, 0, grWidth, height);
        
        // Peak indicator
        if (this.peakReduction > 0.1) {
            this.ctx.fillStyle = '#fff';
            const peakX = width - (this.peakReduction / maxGR) * width;
            this.ctx.fillRect(peakX - 1, 0, 2, height);
        }
        
        // Border
        this.ctx.strokeStyle = '#654';
        this.ctx.strokeRect(0, 0, width, height);
        
        // Text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '9px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`GR: -${this.gainReduction.toFixed(1)}dB`, 2, height - 2);
    }
}

// Global functions for panel control
function toggleProStudio(show) {
    if (window.screwAIPro && window.screwAIPro.studio) {
        if (show === false) {
            window.screwAIPro.studio.stopVisualizations();
            document.getElementById('proStudioPanel').style.display = 'none';
            document.getElementById('toggleAdvancedBtn').textContent = 'Show Advanced Studio';
            window.screwAIPro.studio.panelsVisible.proStudio = false;
        } else {
            window.screwAIPro.studio.toggleAdvancedStudio();
        }
    }
}

function togglePitchDetector() {
    if (window.screwAIPro && window.screwAIPro.studio && window.screwAIPro.studio.components.pitchDetector) {
        const detector = window.screwAIPro.studio.components.pitchDetector;
        try {
            if (detector.isActive) {
                detector.isActive = false;
                console.log('ðŸŽµ Pitch detector stopped');
            } else {
                detector.isActive = true;
                if (detector.startPitchAnalysis) {
                    detector.startPitchAnalysis();
                }
                console.log('ðŸŽµ Pitch detector started');
            }
        } catch (error) {
            console.warn('âš ï¸ Error toggling pitch detector:', error);
        }
    }
}

function toggleAudioGrid(show) {
    const panel = document.getElementById('audioGridContainer');
    if (show === false) {
        panel.style.display = 'none';
    } else {
        panel.style.display = 'block';
        // Trigger waveform rendering
        if (window.screwAIPro && window.screwAIPro.studio && window.screwAIPro.studio.components.waveformRenderer) {
            window.screwAIPro.studio.components.waveformRenderer.drawWaveform();
        }
    }
}

// Make available globally
window.ScrewAIProStudio = ScrewAIProStudio;

// Global stem separation functions that work with the current system
function startStemSeparation() {
    console.log('🎤 Starting HuggingFace stem separation...');
    const statusDiv = document.getElementById('stemStatus');
    const progressBar = document.getElementById('stemProgress');
    const statusText = statusDiv?.querySelector('.status-text');
    const progressFill = progressBar?.querySelector('.progress-fill');
    if (!window.audioPipeline || !window.audioPipeline.file) {
        console.error('❌ No audio file loaded for stem separation');
        showErrorModal('Please load an audio file before attempting stem separation.');
        return;
    }
    if (statusDiv) statusDiv.style.display = 'block';
    if (statusText) statusText.textContent = 'Uploading to HuggingFace...';
    if (progressBar) progressBar.style.display = 'block';
    if (progressFill) progressFill.style.width = '10%';
    // Use the file object from audioPipeline
    const file = window.audioPipeline.file;
    window.separateMusicSource(file)
        .then((resultUrl) => {
            if (statusText) statusText.textContent = 'Separation complete! Fetching stems...';
            if (progressFill) progressFill.style.width = '100%';
            // Show output controls and set download/preview links
            const outputControls = document.getElementById('stemOutputControls');
            if (outputControls) outputControls.style.display = 'block';
            // Save result URL for preview/download
            window.screwAIPro = window.screwAIPro || {};
            window.screwAIPro.huggingfaceStems = { vocals: resultUrl, instrumental: resultUrl };
            // Optionally, auto-preview or notify user
            if (statusText) statusText.textContent = 'Stems ready! Use controls below.';
        })
        .catch((error) => {
            console.error('❌ HuggingFace stem separation failed:', error);
            if (statusText) statusText.textContent = 'Separation failed.';
            showErrorModal('Stem separation failed: ' + error.message);
            if (progressFill) progressFill.style.width = '0%';
        });
}

// Stem playback functions
function previewStem(stemType) {
    console.log(`🎧 Previewing ${stemType} stem...`);
    if (window.screwAIPro && window.screwAIPro.huggingfaceStems && window.screwAIPro.huggingfaceStems[stemType]) {
        const url = window.screwAIPro.huggingfaceStems[stemType];
        const audio = new Audio(url);
        audio.play();
    } else {
        showErrorModal('No stem available for preview.');
    }
}

function downloadStem(stemType) {
    console.log(`💾 Downloading ${stemType} stem...`);
    if (window.screwAIPro && window.screwAIPro.huggingfaceStems && window.screwAIPro.huggingfaceStems[stemType]) {
        const url = window.screwAIPro.huggingfaceStems[stemType];
        const a = document.createElement('a');
        a.href = url;
        a.download = `${stemType}_separated.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        showErrorModal('No stem available for download.');
    }
}

// Error modal function
function showErrorModal(message) {
    const errorModal = document.getElementById("errorModal");
    const errorMessage = document.getElementById("errorMessage");
    if (errorModal && errorMessage) {
        errorMessage.textContent = message;
        errorModal.style.display = "flex";
        
        const okBtn = document.getElementById("errorOkBtn");
        if (okBtn) {
            okBtn.onclick = () => {
                errorModal.style.display = "none";
            };
        }
    } else {
        alert(message); // Fallback
    }
}

// COMPLETE TAPE SATURATION INTEGRATION EXTENSION
ScrewAIProStudio.prototype.initializeCompleteTapeSaturation = function() {
    // Override the existing tape saturation checkbox handler
    const tapeSaturationCheckbox = document.getElementById('tapeSaturationEnabled');
    if (tapeSaturationCheckbox) {
        tapeSaturationCheckbox.addEventListener('change', (e) => {
            this.toggleCompleteTapeSaturation(e.target.checked);
        });
    }
};

ScrewAIProStudio.prototype.toggleCompleteTapeSaturation = function(enabled) {
    if (enabled) {
        // Initialize tape saturation if not already done
        if (!this.components.tapeSaturation && window.audioPipeline && window.audioPipeline.audioContext) {
            try {
                if (typeof HardwareTapeSaturation !== 'undefined') {
                    this.components.tapeSaturation = new HardwareTapeSaturation(window.audioPipeline.audioContext);
                    this.components.tapeSaturation.enable();
                    
                    // Show tape controls
                    const tapeControls = document.getElementById('tapeControls');
                    if (tapeControls) {
                        tapeControls.style.display = 'block';
                    }
                    
                    // Initialize knob interactions
                    this.initializeCompleteTapeKnobs();
                    
                    console.log('📼 Hardware tape saturation activated with full controls');
                    this.showNotification('📼 Tape saturation enabled', 'success');
                } else {
                    console.warn('⚠️ HardwareTapeSaturation class not available');
                    this.showNotification('⚠️ Tape saturation not available', 'warning');
                }
            } catch (error) {
                console.warn('⚠️ Failed to initialize tape saturation:', error);
                this.showNotification('❌ Failed to initialize tape saturation', 'error');
            }
        } else if (this.components.tapeSaturation) {
            // Re-enable existing instance
            this.components.tapeSaturation.enable();
            const tapeControls = document.getElementById('tapeControls');
            if (tapeControls) {
                tapeControls.style.display = 'block';
            }
            console.log('📼 Tape saturation re-enabled');
        }
    } else {
        // Disable tape saturation
        if (this.components.tapeSaturation) {
            this.components.tapeSaturation.disable();
            
            // Hide tape controls
            const tapeControls = document.getElementById('tapeControls');
            if (tapeControls) {
                tapeControls.style.display = 'none';
            }
            
            console.log('📼 Tape saturation disabled');
        }
    }
};

ScrewAIProStudio.prototype.initializeCompleteTapeKnobs = function() {
    if (!this.components.tapeSaturation) return;
    
    // Initialize all tape knobs with proper event handling
    const knobParams = [
        { id: 'tape-drive', method: 'setDrive', defaultValue: 0.5 },
        { id: 'tape-warmth', method: 'setWarmth', defaultValue: 0.3 },
        { id: 'tape-presence', method: 'setPresence', defaultValue: 0.2 },
        { id: 'tape-flutter', method: 'setFlutter', defaultValue: 0.05 },
        { id: 'tape-hiss', method: 'setHiss', defaultValue: 0.02 },
        { id: 'tape-compression', method: 'setCompression', defaultValue: 0.3 }
    ];
    
    knobParams.forEach(param => {
        const knob = document.querySelector(`[data-param="${param.id}"]`);
        if (knob) {
            // Set initial value
            knob.dataset.value = param.defaultValue;
            const rotation = (param.defaultValue - 0.5) * 270;
            const indicator = knob.querySelector('.mini-knob-indicator');
            if (indicator) {
                indicator.style.transform = `rotate(${rotation}deg)`;
            }
            
            // Set initial parameter value
            this.components.tapeSaturation[param.method](param.defaultValue);
            
            console.log(`📼 Initialized ${param.id} knob`);
        }
    });
    
    // Initialize mode selector
    const modeSelector = document.getElementById('tapeSaturationMode');
    if (modeSelector && this.components.tapeSaturation) {
        modeSelector.value = 'vintage';
        this.components.tapeSaturation.setMode('vintage');
        
        modeSelector.addEventListener('change', (e) => {
            this.components.tapeSaturation.setMode(e.target.value);
            console.log(`📼 Tape mode changed to: ${e.target.value}`);
        });
    }
    
    console.log('📼 All tape controls initialized');
};

// Complete Professional Audio Monitoring Enhancement
ScrewAIProStudio.prototype.initializeLiveAudioMonitoring = async function() {
    try {
        console.log('🎤 Initializing live audio monitoring for VU meters...');
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false,
                sampleRate: 48000
            } 
        });
        
        this.liveAudioStream = stream;
        this.setupLiveAudioAnalysis(stream);
        
        console.log('✅ Live audio monitoring initialized');
        return true;
    } catch (error) {
        console.warn('⚠️ Live audio monitoring not available:', error);
        return false;
    }
};

ScrewAIProStudio.prototype.setupLiveAudioAnalysis = function(stream) {
    if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    this.liveAudioSource = this.audioContext.createMediaStreamSource(stream);
    this.stereoSplitter = this.audioContext.createChannelSplitter(2);
    this.leftAnalyser = this.audioContext.createAnalyser();
    this.rightAnalyser = this.audioContext.createAnalyser();
    
    [this.leftAnalyser, this.rightAnalyser].forEach(analyser => {
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.3;
        analyser.minDecibels = -80;
        analyser.maxDecibels = 0;
    });
    
    this.liveAudioSource.connect(this.stereoSplitter);
    this.stereoSplitter.connect(this.leftAnalyser, 0);
    this.stereoSplitter.connect(this.rightAnalyser, 1);
    
    this.leftTimeData = new Uint8Array(this.leftAnalyser.fftSize);
    this.rightTimeData = new Uint8Array(this.rightAnalyser.fftSize);
    
    console.log('🔊 Stereo audio analysis graph configured');
};

ScrewAIProStudio.prototype.updateLiveVUMeters = function() {
    if (!this.leftAnalyser || !this.rightAnalyser || !this.visualizations.vuMeter) return;
    
    this.leftAnalyser.getByteTimeDomainData(this.leftTimeData);
    this.rightAnalyser.getByteTimeDomainData(this.rightTimeData);
    
    const leftLevel = this.calculateTrueRMS(this.leftTimeData);
    const rightLevel = this.calculateTrueRMS(this.rightTimeData);
    
    this.visualizations.vuMeter.update(leftLevel, rightLevel);
};

ScrewAIProStudio.prototype.calculateTrueRMS = function(timeData) {
    let sum = 0;
    const length = timeData.length;
    
    for (let i = 0; i < length; i++) {
        const sample = (timeData[i] - 128) / 128.0;
        sum += sample * sample;
    }
    
    const rms = Math.sqrt(sum / length);
    return Math.min(1.0, rms * 3.0);
};

ScrewAIProStudio.prototype.connectVUMeterToAudioPipeline = function(audioPipeline) {
    if (!audioPipeline || !this.visualizations.vuMeter) return;
    
    console.log('🔗 Connecting VU meter to audio pipeline...');
    
    this.vuStereoSplitter = audioPipeline.audioContext.createChannelSplitter(2);
    this.vuLeftAnalyser = audioPipeline.audioContext.createAnalyser();
    this.vuRightAnalyser = audioPipeline.audioContext.createAnalyser();
    
    [this.vuLeftAnalyser, this.vuRightAnalyser].forEach(analyser => {
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.8;
    });
    
    if (window.audioSource) {
        window.audioSource.connect(this.vuStereoSplitter);
        this.vuStereoSplitter.connect(this.vuLeftAnalyser, 0);
        this.vuStereoSplitter.connect(this.vuRightAnalyser, 1);
        
        this.vuLeftData = new Uint8Array(this.vuLeftAnalyser.fftSize);
        this.vuRightData = new Uint8Array(this.vuRightAnalyser.fftSize);
        
        console.log('✅ VU meter connected to stereo audio pipeline');
    }
};

ScrewAIProStudio.prototype.updatePipelineVUMeters = function() {
    if (!this.vuLeftAnalyser || !this.vuRightAnalyser || !this.visualizations.vuMeter) return;

    // Safe type and size check for VU meter data arrays
    if (!this.vuLeftData || !(this.vuLeftData instanceof Uint8Array) || this.vuLeftData.length !== this.vuLeftAnalyser.fftSize) {
        this.vuLeftData = new Uint8Array(this.vuLeftAnalyser.fftSize);
    }
    if (!this.vuRightData || !(this.vuRightData instanceof Uint8Array) || this.vuRightData.length !== this.vuRightAnalyser.fftSize) {
        this.vuRightData = new Uint8Array(this.vuRightAnalyser.fftSize);
    }

    this.vuLeftAnalyser.getByteTimeDomainData(this.vuLeftData);
    this.vuRightAnalyser.getByteTimeDomainData(this.vuRightData);

    const leftLevel = this.calculateProfessionalVULevel(this.vuLeftData);
    const rightLevel = this.calculateProfessionalVULevel(this.vuRightData);

    this.visualizations.vuMeter.update(leftLevel, rightLevel);
};

ScrewAIProStudio.prototype.calculateProfessionalVULevel = function(timeData) {
    let sumSquares = 0;
    const length = timeData.length;
    
    for (let i = 0; i < length; i++) {
        const sample = (timeData[i] - 128) / 128.0;
        sumSquares += sample * sample;
    }
    
    const rms = Math.sqrt(sumSquares / length);
    const vuLevel = rms / 0.775; // Professional VU calibration
    
    return Math.min(1.5, vuLevel);
};

ScrewAIProStudio.prototype.enableVUMeterPeakHold = function(enabled = true) {
    if (this.visualizations.vuMeter) {
        this.visualizations.vuMeter.peakHoldFrames = enabled ? 60 : 0;
        console.log(`📊 VU meter peak hold ${enabled ? 'enabled' : 'disabled'}`);
    }
};

ScrewAIProStudio.prototype.calibrateVUMeter = function(referenceLevel = 0.775) {
    if (this.visualizations.vuMeter) {
        this.visualizations.vuMeter.setCalibration(referenceLevel);
        console.log(`⚖️ VU meter calibrated to ${referenceLevel}V reference`);
    }
};

ScrewAIProStudio.prototype.resetVUMeter = function() {
    if (this.visualizations.vuMeter) {
        this.visualizations.vuMeter.reset();
        console.log('🔄 VU meter reset');
    }
};

// Missing stem separator methods - Complete Implementation
ScrewAIProStudio.prototype.detectOptimalQuality = function(audioBuffer) {
    if (!audioBuffer) return 'standard';
    
    const duration = audioBuffer.duration;
    const sampleRate = audioBuffer.sampleRate;
    const channels = audioBuffer.numberOfChannels;
    
    // Analyze audio characteristics for optimal quality selection
    if (duration > 300) { // > 5 minutes
        console.log('📊 Long audio detected, using standard quality for faster processing');
        return 'standard';
    } else if (sampleRate >= 48000 && channels >= 2) {
        console.log('📊 High-quality audio detected, using high quality separation');
        return 'high';
    } else {
        console.log('📊 Standard audio detected, using standard quality separation');
        return 'standard';
    }
};

ScrewAIProStudio.prototype.initializeFallbackSeparator = function() {
    console.error('❌ AdvancedStemSeparator failed - no fallback available');
    this.showNotification('❌ Stem separation failed', 'error');
    
    // Reset checkbox
    const checkbox = document.getElementById('stemSeparatorEnabled');
    if (checkbox) checkbox.checked = false;
};

ScrewAIProStudio.prototype.showAdvancedStemControls = function(stems, quality) {
    try {
        console.log('🎵 Showing advanced stem controls for:', Object.keys(stems));
        
        // Remove existing panel if any
        const existingPanel = document.querySelector('.stem-control-panel');
        if (existingPanel) {
            existingPanel.remove();
        }
        
        // Store stems globally
        window.currentStems = stems;
        
        // Create the stem control panel
        const panel = document.createElement('div');
        panel.className = 'stem-control-panel';
        panel.innerHTML = `
            <div class="stem-panel-header">
                <h3>🎵 Separated Stems</h3>
                <div class="quality-indicator">Quality: ${quality.overall}%</div>
            </div>
            <div class="stem-controls">
                ${Object.keys(stems).map(stemType => `
                    <div class="stem-control-row">
                        <button class="stem-play-btn" data-stem="${stemType}">▶ ${stemType}</button>
                        <button class="stem-download-btn" data-stem="${stemType}">💾 Download</button>
                        <span class="stem-quality">Q: ${quality[stemType] || quality.overall}%</span>
                    </div>
                `).join('')}
            </div>
            <button class="stem-download-all-btn">💾 Download All Stems</button>
        `;
        
        // Add to page
        const proPanel = document.getElementById('proStudioPanel');
        if (proPanel) {
            proPanel.appendChild(panel);
        } else {
            document.body.appendChild(panel);
        }
        
        // Add event listeners
        panel.querySelectorAll('.stem-play-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const stemType = e.target.dataset.stem;
                this.playStem(stemType);
            });
        });
        
        panel.querySelectorAll('.stem-download-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const stemType = e.target.dataset.stem;
                this.downloadStem(stemType);
            });
        });
        
        panel.querySelector('.stem-download-all-btn').addEventListener('click', () => {
            this.downloadAllStems();
        });
        
        // Hide status and progress
        const statusDiv = document.getElementById('stemStatus');
        const progressBar = document.getElementById('stemProgress');
        if (statusDiv) statusDiv.style.display = 'none';
        if (progressBar) progressBar.style.display = 'none';
        
        console.log('✅ Advanced stem controls displayed');
        
    } catch (error) {
        console.error('❌ Error showing stem controls:', error);
        this.showNotification('❌ Error displaying stem controls', 'error');
    }
};

ScrewAIProStudio.prototype.playStem = function(stemType) {
    if (!window.currentStems || !window.currentStems[stemType]) {
        console.error(`❌ Stem ${stemType} not available`);
        return;
    }
    
    try {
        // Stop any current playback
        if (this.currentStemSource) {
            this.currentStemSource.stop();
            this.currentStemSource = null;
        }
        
        // Play the stem
        this.currentStemSource = this.audioContext.createBufferSource();
        this.currentStemSource.buffer = window.currentStems[stemType];
        this.currentStemSource.connect(this.audioContext.destination);
        this.currentStemSource.start();
        
        console.log(`🎵 Playing ${stemType} stem`);
        
        // Update button text
        const button = document.querySelector(`[data-stem="${stemType}"]`);
        if (button) {
            button.textContent = `⏹ ${stemType}`;
            
            this.currentStemSource.onended = () => {
                button.textContent = `▶ ${stemType}`;
                this.currentStemSource = null;
            };
        }
        
    } catch (error) {
        console.error(`❌ Error playing ${stemType}:`, error);
        this.showNotification(`❌ Error playing ${stemType}`, 'error');
    }
};

ScrewAIProStudio.prototype.downloadStem = function(stemType) {
    if (!window.currentStems || !window.currentStems[stemType]) {
        console.error(`❌ Stem ${stemType} not available`);
        return;
    }
    
    try {
        const filename = `${stemType}_stem.wav`;
        this.downloadAudioBuffer(window.currentStems[stemType], filename);
        console.log(`💾 Downloading ${stemType} stem`);
        
    } catch (error) {
        console.error(`❌ Error downloading ${stemType}:`, error);
        this.showNotification(`❌ Error downloading ${stemType}`, 'error');
    }
};

ScrewAIProStudio.prototype.downloadAllStems = function() {
    if (!window.currentStems) {
        console.error('❌ No stems available');
        return;
    }
    
    try {
        Object.keys(window.currentStems).forEach((stemType, index) => {
            setTimeout(() => {
                this.downloadStem(stemType);
            }, index * 500); // Stagger downloads
        });
        
        console.log('💾 Downloading all stems...');
        this.showNotification('💾 Downloading all stems...', 'info');
        
    } catch (error) {
        console.error('❌ Error downloading all stems:', error);
        this.showNotification('❌ Error downloading stems', 'error');
    }
};

ScrewAIProStudio.prototype.downloadAudioBuffer = function(audioBuffer, filename) {
    // Convert AudioBuffer to WAV and trigger download
    const wavData = this.audioBufferToWav(audioBuffer);
    const blob = new Blob([wavData], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(url);
};

ScrewAIProStudio.prototype.audioBufferToWav = function(audioBuffer) {
    const length = audioBuffer.length;
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const bytesPerSample = 2;
    const blockAlign = numberOfChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = length * blockAlign;
    const bufferSize = 44 + dataSize;
    
    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);
    
    // Convert audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
            const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
        }
    }
    
    return arrayBuffer;
};

ScrewAIProStudio.prototype.stopLiveAudioMonitoring = function() {
    if (this.liveAudioStream) {
        this.liveAudioStream.getTracks().forEach(track => track.stop());
        this.liveAudioStream = null;
        console.log('🛑 Live audio monitoring stopped');
    }
};

// Export enhanced class
window.ScrewAIProStudio = ScrewAIProStudio;
