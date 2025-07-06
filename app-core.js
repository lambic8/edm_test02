// EDM学習アプリ - コア機能（Avicii風対応版・18ステップ対応・音量最適化版）
class EDMCore {
    constructor() {
        this.state = {
            currentStep: 1,
            currentSection: "intro",
            isPlaying: false,
            audioInitialized: false,
            bpm: 128,
            isInitialized: false,
            isTransitioning: false,
            currentStepIndex: 0,
            isPlayingFullSong: false
        };
        
        this.constants = {
            DRUM_TRACKS: ['kick', 'snare', 'hihat', 'clap'],
            MELODY_TRACKS: ['bass', 'melody', 'chord', 'piano', 'pluck', 'strings'],
            TRANSITION_TRACKS: ['uplifter', 'riser', 'sweep'],
            STEPS_PER_PATTERN: 16,
            TOTAL_STEPS: 18,
            AUDIO: {
                NOTE_LENGTH: '16n',
                BEAT_DIVISION: 4,
                DEFAULT_BPM: 128
            }
        };
        
        this.elements = {};
        this.synths = {};
        this.effects = {};
        this.sequence = null;
        this.fullSongSequence = null;
        this.transport = Tone.Transport;
        this.isDestroyed = false;
        this.ui = null;
        
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
    }
    
    async init() {
        await this.waitForDependencies();
        this.cacheElements();
        this.initSongData();
        this.setupEventListeners();
        
        this.state.isInitialized = true;
        console.log("✅ EDM Core initialized");
        
        if (window.EDMInterface) {
            this.ui = new window.EDMInterface(this);
            await this.ui.init();
        }
        
        this.loadCurrentStep();
    }
    
    async waitForDependencies() {
        return new Promise((resolve, reject) => {
            let retries = 0;
            const check = () => {
                if (typeof window.EDMCourse !== 'undefined' && 
                    window.EDMCourse.steps && 
                    window.EDMCourse.initialData) {
                    resolve();
                } else if (retries >= 100) {
                    reject(new Error('Dependencies timeout'));
                } else {
                    retries++;
                    setTimeout(check, 100);
                }
            };
            
            document.addEventListener('edmCourseReady', () => {
                if (typeof window.EDMCourse !== 'undefined') {
                    resolve();
                }
            }, { once: true });
            
            check();
        });
    }
    
    cacheElements() {
        const ids = [
            'playBtn', 'bpmValue',
            'continueBtn',
            'sequencerArea',
            'successModal', 'successMessage', 'playFullSongBtn'
        ];
        
        ids.forEach(id => {
            this.elements[id] = document.getElementById(id);
        });
    }
    
    initSongData() {
        if (window.EDMCourse?.initialData) {
            this.songData = JSON.parse(JSON.stringify(window.EDMCourse.initialData));
        } else {
            this.songData = this.createMinimalSongData();
        }
    }
    
    createMinimalSongData() {
        const emptyPattern = Array(16).fill(0);
        const sections = ['intro', 'preBuildup', 'buildup', 'preDrop', 'drop', 'preBreakdown', 'breakdown', 'preOutro', 'outro'];
        const tracks = [...this.constants.DRUM_TRACKS, ...this.constants.MELODY_TRACKS, ...this.constants.TRANSITION_TRACKS];
        
        const songData = { sections: {} };
        
        sections.forEach(section => {
            songData.sections[section] = { patterns: {}, matrix: {} };
            tracks.forEach(track => {
                songData.sections[section].patterns[track] = [...emptyPattern];
                
                const isPreSection = ['preBuildup', 'preDrop', 'preBreakdown', 'preOutro'].includes(section);
                if (isPreSection) {
                    songData.sections[section].matrix[track] = { repeat1: false };
                } else {
                    songData.sections[section].matrix[track] = { repeat1: false, repeat2: false };
                }
            });
        });
        
        return songData;
    }
    
    updateState(updates) {
        if (this.isDestroyed) return;
        Object.assign(this.state, updates);
        this.onStateChange(updates);
    }
    
    onStateChange(changes) {
        if ('currentSection' in changes && this.ui) {
            this.ui.updateSectionUI();
        }
        if ('isPlaying' in changes && this.ui) {
            this.ui.updatePlayButtonUI();
        }
        if ('isTransitioning' in changes && this.ui) {
            this.ui.updateTransitionUI();
        }
        if ('currentStepIndex' in changes && this.ui) {
            this.ui.updateStepIndicator(changes.currentStepIndex);
        }
        if ('bpm' in changes && this.elements.bpmValue) {
            this.elements.bpmValue.textContent = this.state.bpm.toString();
        }
        if ('isPlayingFullSong' in changes && this.ui) {
            this.ui.updateFullSongButtonUI();
        }
    }
    
    async initAudio() {
        if (this.state.audioInitialized || this.isDestroyed) return true;
        
        try {
            await Tone.start();
            this.effects = await this.createEffects();
            this.synths = await this.createSynths();
            this.transport.bpm.value = this.state.bpm;
            this.updateState({ audioInitialized: true });
            console.log("🎵 Avicii-style audio system initialized with optimized volumes");
            return true;
        } catch (error) {
            console.error("Audio init failed:", error);
            return false;
        }
    }
    
    async createEffects() {
        const effects = {};
        
        // Avicii風エフェクト（音量最適化）
        effects.reverb = new Tone.Reverb({
            decay: 3.0,
            wet: 0.25  // 0.3 → 0.25に軽減
        });
        
        effects.delay = new Tone.PingPongDelay({
            delayTime: "8n",
            feedback: 0.3,  // 0.35 → 0.3に軽減
            wet: 0.15       // 0.2 → 0.15に軽減
        });
        
        effects.chorus = new Tone.Chorus({
            frequency: 2,
            delayTime: 3.5,
            depth: 0.6,     // 0.7 → 0.6に軽減
            wet: 0.25       // 0.3 → 0.25に軽減
        });
        
        // エフェクトを初期化（非同期）
        await effects.reverb.generate();
        
        // マスターに接続
        effects.reverb.toDestination();
        effects.delay.toDestination();
        effects.chorus.toDestination();
        
        return effects;
    }
    
    async createSynths() {
        const synths = {};
        
        // 🥁 KICK - Avicii風の深いキック（音量維持）
        synths.kick = new Tone.MembraneSynth({
            pitchDecay: 0.03,
            octaves: 8,
            oscillator: { 
                type: "sine"
            },
            envelope: { 
                attack: 0.001, 
                decay: 0.5, 
                sustain: 0.01, 
                release: 1.2
            }
        }).toDestination();
        
        // 🥁 SNARE - クリアで鋭いスネア（音量調整）
        synths.snare = new Tone.NoiseSynth({
            noise: { 
                type: "white"
            },
            envelope: { 
                attack: 0.005, 
                decay: 0.2, 
                sustain: 0, 
                release: 0.15
            }
        });
        
        const snareFilter = new Tone.Filter({
            frequency: 5000,
            type: "highpass",
            rolloff: -12
        });
        
        const snareGain = new Tone.Gain(-6);  // -5 → -6に軽減
        synths.snare.chain(snareFilter, snareGain, Tone.Destination);
        
        // 🥁 HIHAT - 明るいハイハット（新規音量設定）
        synths.hihat = new Tone.NoiseSynth({
            noise: { 
                type: "white"
            },
            envelope: { 
                attack: 0.001, 
                decay: 0.05, 
                sustain: 0, 
                release: 0.03
            }
        });
        
        const hihatFilter = new Tone.Filter({
            frequency: 10000,
            type: "highpass",
            rolloff: -24
        });
        
        const hihatGain = new Tone.Gain(-8);  // 新規追加：控えめな音量
        synths.hihat.chain(hihatFilter, hihatGain, Tone.Destination);
        
        // 🥁 CLAP - パワフルなクラップ（大幅音量軽減）
        synths.clap = new Tone.NoiseSynth({
            noise: { 
                type: "white"
            },
            envelope: { 
                attack: 0.02, 
                decay: 0.1, 
                sustain: 0.3, 
                release: 0.2
            }
        });
        
        const clapFilter = new Tone.Filter({
            frequency: 3000,
            type: "bandpass",
            Q: 3
        });
        
        const clapGain = new Tone.Gain(-8);  // 新規追加：控えめな音量
        synths.clap.chain(clapFilter, clapGain, Tone.Destination);
        
        // 🎸 BASS - Avicii風の温かいベース（大幅音量軽減）
        synths.bass = new Tone.MonoSynth({
            oscillator: { 
                type: "sawtooth"
            },
            envelope: { 
                attack: 0.01, 
                decay: 0.6, 
                sustain: 0.4,  // 0.5 → 0.4に軽減
                release: 1.5
            },
            filter: { 
                frequency: 280,  // 300 → 280に軽減（少し暗めに）
                type: "lowpass", 
                rolloff: -12,
                Q: 5  // 6 → 5に軽減
            },
            filterEnvelope: {
                attack: 0.02,
                decay: 0.4,
                sustain: 0.5,  // 0.6 → 0.5に軽減
                release: 1.0,
                baseFrequency: 140,  // 150 → 140に軽減
                octaves: 1.8  // 2 → 1.8に軽減
            }
        });
        
        const bassGain = new Tone.Gain(-7);  // -5 → -7にさらに軽減
        synths.bass.chain(bassGain, Tone.Destination);
        
        // 🎵 MELODY - 感動的なリードシンセ（大幅音量軽減）
        synths.melody = new Tone.MonoSynth({
            oscillator: { 
                type: "sawtooth"
            },
            envelope: { 
                attack: 0.05, 
                decay: 0.4, 
                sustain: 0.6,  // 0.7 → 0.6に軽減
                release: 1.0
            },
            filter: { 
                frequency: 2200,  // 2500 → 2200に軽減（少し暗めに）
                type: "lowpass", 
                rolloff: -12,
                Q: 1.8  // 2 → 1.8に軽減
            },
            filterEnvelope: {
                attack: 0.1,
                decay: 0.3,
                sustain: 0.7,  // 0.8 → 0.7に軽減
                release: 0.8,
                baseFrequency: 900,  // 1000 → 900に軽減
                octaves: 1.8  // 2 → 1.8に軽減
            }
        });
        
        const melodyGain = new Tone.Gain(-9);  // -7 → -9にさらに軽減
        synths.melody.chain(melodyGain, this.effects.reverb);
        
        // 🎹 CHORD - 温かいコードシンセ（音量調整）
        synths.chord = new Tone.PolySynth({
            voice: Tone.MonoSynth,
            options: {
                oscillator: { 
                    type: "sawtooth"
                },
                envelope: { 
                    attack: 0.05, 
                    decay: 0.8, 
                    sustain: 0.6, 
                    release: 1.5
                },
                filter: { 
                    frequency: 2000, 
                    type: "lowpass", 
                    rolloff: -12,
                    Q: 2
                }
            }
        });
        
        const chordGain = new Tone.Gain(-8);  // -6 → -8に軽減
        synths.chord.chain(chordGain, this.effects.chorus);
        
        // 🎹 PIANO - Avicii特有の温かいピアノ（音量調整）
        synths.piano = new Tone.PolySynth({
            voice: Tone.MonoSynth,
            options: {
                oscillator: { 
                    type: "sine"
                },
                envelope: { 
                    attack: 0.02, 
                    decay: 0.5, 
                    sustain: 0.3, 
                    release: 2.0
                },
                filter: { 
                    frequency: 4000, 
                    type: "lowpass", 
                    rolloff: -12,
                    Q: 1
                }
            }
        });
        
        const pianoGain = new Tone.Gain(-6);  // -4 → -6に軽減
        synths.piano.chain(pianoGain, this.effects.reverb);
        
        // ✨ PLUCK - 「Levels」風プラックシンセ（音量調整）
        synths.pluck = new Tone.PluckSynth({
            attackNoise: 1,
            dampening: 4000,
            resonance: 0.9
        });
        
        const pluckGain = new Tone.Gain(-4);  // -2 → -4に軽減
        const pluckFilter = new Tone.Filter({
            frequency: 3000,
            type: "lowpass",
            Q: 10
        });
        
        synths.pluck.chain(pluckFilter, pluckGain, this.effects.delay);
        
        // 🎻 STRINGS - 感動的なストリングス（大幅音量軽減）
        synths.strings = new Tone.PolySynth({
            voice: Tone.MonoSynth,
            options: {
                oscillator: { 
                    type: "sawtooth"
                },
                envelope: { 
                    attack: 1.0,
                    decay: 1.5, 
                    sustain: 0.8, 
                    release: 3.0
                },
                filter: { 
                    frequency: 1800, 
                    type: "lowpass", 
                    rolloff: -12,
                    Q: 2
                }
            }
        });
        
        const stringsGain = new Tone.Gain(-10);  // -8 → -10に軽減（最も控えめ）
        synths.strings.chain(stringsGain, this.effects.reverb);
        
        // 🚀 UPLIFTER - エネルギッシュなアップリフター（雑音対策・大幅簡素化）
        synths.uplifter = new Tone.MonoSynth({
            oscillator: { 
                type: "sine"  // sawtooth → sine に変更（雑音軽減）
            },
            envelope: { 
                attack: 0.05,  // 0.1 → 0.05に短縮
                decay: 0.3,    // 0.2 → 0.3に延長
                sustain: 0.6,  // 0.8 → 0.6に軽減
                release: 0.4   // 0.5 → 0.4に短縮
            },
            filter: { 
                frequency: 1200,  // 800 → 1200に上昇（明るく）
                type: "lowpass", 
                rolloff: -12,
                Q: 3  // 6 → 3に軽減（雑音対策）
            },
            filterEnvelope: {
                attack: 0.2,  // 0.3 → 0.2に短縮
                decay: 0.05,  // 0.1 → 0.05に短縮
                sustain: 0.5, // 0.7 → 0.5に軽減
                release: 0.3, // 0.4 → 0.3に短縮
                baseFrequency: 600,  // 400 → 600に上昇
                octaves: 2  // 3 → 2に軽減（雑音対策）
            }
        });
        
        const uplifterGain = new Tone.Gain(-10);  // -6 → -10に大幅軽減
        synths.uplifter.chain(uplifterGain, Tone.Destination);
        
        // 📈 RISER - 強力なライザー（音量調整）
        synths.riser = new Tone.NoiseSynth({
            noise: { 
                type: "white"
            },
            envelope: { 
                attack: 1.5,
                decay: 0.1, 
                sustain: 0.9, 
                release: 1.0
            }
        });
        
        const riserFilter = new Tone.Filter({
            frequency: 100,
            type: "highpass",
            rolloff: -24,
            Q: 10
        });
        
        const riserFilterEnv = new Tone.FrequencyEnvelope({
            attack: 1.2,
            decay: 0.1,
            sustain: 0.9,
            release: 0.6,
            baseFrequency: 100,
            octaves: 7
        });
        
        riserFilterEnv.connect(riserFilter.frequency);
        
        const riserGain = new Tone.Gain(-6);  // -2 → -6に軽減
        synths.riser.chain(riserFilter, riserGain, this.effects.reverb);
        
        const originalRiserTrigger = synths.riser.triggerAttackRelease.bind(synths.riser);
        synths.riser.triggerAttackRelease = function(duration, time) {
            riserFilterEnv.triggerAttackRelease(duration, time);
            return originalRiserTrigger(duration, time);
        };
        
        // 🌊 SWEEP - スムーズなスイープ（音量調整）
        synths.sweep = new Tone.MonoSynth({
            oscillator: { 
                type: "sine"
            },
            envelope: { 
                attack: 0.05, 
                decay: 1.0, 
                sustain: 0.3, 
                release: 0.8
            },
            filter: { 
                frequency: 5000, 
                type: "lowpass", 
                rolloff: -12,
                Q: 5
            },
            filterEnvelope: {
                attack: 0.2,
                decay: 0.8,
                sustain: 0.4,
                release: 0.6,
                baseFrequency: 3000,
                octaves: -2
            }
        });
        
        const sweepGain = new Tone.Gain(-6);  // 新規追加：控えめな音量
        synths.sweep.chain(sweepGain, this.effects.delay);
        
        console.log("🎛️ Avicii-style synths created with optimized volumes");
        return synths;
    }
    
    async playInstrumentPreview(track, note = null) {
        if (!await this.initAudio() || this.isDestroyed) return false;
        
        try {
            const synth = this.synths[track];
            if (!synth) return false;
            
            const instrumentType = this.getInstrumentType(track);
            
            switch (instrumentType) {
                case 'drum':
                    if (track === 'kick') {
                        synth.triggerAttackRelease('C1', this.constants.AUDIO.NOTE_LENGTH);
                    } else {
                        synth.triggerAttackRelease(this.constants.AUDIO.NOTE_LENGTH);
                    }
                    break;
                case 'melody':
                    const playNote = note || this.getDefaultNote(track);
                    synth.triggerAttackRelease(playNote, this.constants.AUDIO.NOTE_LENGTH);
                    break;
                case 'transition':
                    if (track === 'uplifter') {
                        synth.triggerAttackRelease('C4', '4n');
                    } else if (track === 'riser') {
                        synth.triggerAttackRelease('8n');
                    } else if (track === 'sweep') {
                        synth.triggerAttackRelease('A4', '2n');
                    }
                    break;
            }
            return true;
        } catch (error) {
            console.warn(`Preview failed: ${track}`, error);
            return false;
        }
    }
    
    async togglePlayback() {
        if (this.isDestroyed || !this.state || !await this.initAudio() || this.state.isTransitioning) return;
        
        if (this.state.isPlaying) {
            this.stopPlayback();
        } else {
            const patterns = this.songData.sections[this.state.currentSection].patterns;
            const hasActivePatterns = Object.values(patterns).some(pattern => 
                pattern.some(value => value !== 0)
            );
            
            if (hasActivePatterns) {
                this.startPlayback();
            }
        }
    }
    
    async toggleFullSongPlayback() {
        if (this.isDestroyed || !this.state || !await this.initAudio() || this.state.isTransitioning) return;
        
        if (this.state.isPlayingFullSong) {
            this.stopFullSongPlayback();
        } else {
            this.startFullSongPlayback();
        }
    }
    
    startPlayback() {
        if (!this.state || this.state.audioInitialized === false || this.isDestroyed || this.state.isTransitioning) return;
        
        try {
            this.forceStopSequence();
            this.updateState({ isPlaying: true, currentStepIndex: 0 });
            
            const patterns = this.songData.sections[this.state.currentSection].patterns;
            
            this.sequence = new Tone.Sequence((time, index) => {
                if (this.isDestroyed || !this.state) return;
                this.updateState({ currentStepIndex: index });
                Object.keys(patterns).forEach(track => {
                    const value = patterns[track][index];
                    if (value && this.synths[track]) {
                        this.playSequenceStep(track, value, time);
                    }
                });
            }, Array.from({length: this.constants.STEPS_PER_PATTERN}, (_, i) => i), this.constants.AUDIO.NOTE_LENGTH);
            
            this.sequence.loop = true;
            this.sequence.start(0);
            
            if (Tone.Transport.state !== 'started') {
                Tone.Transport.start();
            }
        } catch (error) {
            console.error('Start playback failed:', error);
            if (this.state) {
                this.updateState({ isPlaying: false });
            }
        }
    }
    
    startFullSongPlayback() {
        if (!this.state || this.state.audioInitialized === false || this.isDestroyed || this.state.isTransitioning) return;
        
        try {
            this.forceStopSequence();
            this.updateState({ isPlayingFullSong: true, currentStepIndex: 0 });
            
            const fullSongPattern = this.createFullSongPattern();
            let currentPatternIndex = 0;
            
            this.fullSongSequence = new Tone.Sequence((time, index) => {
                if (this.isDestroyed || !this.state) return;
                
                const globalIndex = currentPatternIndex * this.constants.STEPS_PER_PATTERN + index;
                this.updateState({ currentStepIndex: globalIndex });
                
                const currentPattern = fullSongPattern[currentPatternIndex];
                if (currentPattern) {
                    Object.keys(currentPattern).forEach(track => {
                        const value = currentPattern[track][index];
                        if (value && this.synths[track]) {
                            this.playSequenceStep(track, value, time);
                        }
                    });
                }
                
                if (index === this.constants.STEPS_PER_PATTERN - 1) {
                    currentPatternIndex++;
                    if (currentPatternIndex >= fullSongPattern.length) {
                        this.stopFullSongPlayback();
                    }
                }
            }, Array.from({length: this.constants.STEPS_PER_PATTERN}, (_, i) => i), this.constants.AUDIO.NOTE_LENGTH);
            
            this.fullSongSequence.loop = true;
            this.fullSongSequence.start(0);
            
            if (Tone.Transport.state !== 'started') {
                Tone.Transport.start();
            }
        } catch (error) {
            console.error('Start full song playback failed:', error);
            if (this.state) {
                this.updateState({ isPlayingFullSong: false });
            }
        }
    }
    
    createFullSongPattern() {
        const sectionOrder = ['intro', 'preBuildup', 'buildup', 'preDrop', 'drop', 'preBreakdown', 'breakdown', 'outro'];
        const sectionBars = {
            intro: 8, preBuildup: 1, buildup: 8, preDrop: 1, 
            drop: 16, preBreakdown: 1, breakdown: 8, outro: 8
        };
        
        const fullPattern = [];
        
        sectionOrder.forEach(sectionKey => {
            const sectionPatterns = this.songData.sections[sectionKey].patterns;
            const bars = sectionBars[sectionKey];
            
            for (let bar = 0; bar < bars; bar++) {
                fullPattern.push(sectionPatterns);
            }
        });
        
        return fullPattern;
    }
    
    playSequenceStep(track, value, time) {
        try {
            const instrumentType = this.getInstrumentType(track);
            const synth = this.synths[track];
            
            if (!synth) return;
            
            switch (instrumentType) {
                case 'drum':
                    if (track === 'kick') {
                        synth.triggerAttackRelease('C1', this.constants.AUDIO.NOTE_LENGTH, time);
                    } else {
                        synth.triggerAttackRelease(this.constants.AUDIO.NOTE_LENGTH, time);
                    }
                    break;
                case 'melody':
                    if (typeof value === 'string') {
                        synth.triggerAttackRelease(value, this.constants.AUDIO.NOTE_LENGTH, time);
                    }
                    break;
                case 'transition':
                    if (track === 'uplifter') {
                        synth.triggerAttackRelease('C4', this.constants.AUDIO.NOTE_LENGTH, time);
                    } else if (track === 'riser') {
                        synth.triggerAttackRelease(this.constants.AUDIO.NOTE_LENGTH, time);
                    } else if (track === 'sweep') {
                        synth.triggerAttackRelease('A4', this.constants.AUDIO.NOTE_LENGTH, time);
                    }
                    break;
            }
        } catch (error) {
            console.warn(`Sequence playback error: ${track}`, error);
        }
    }
    
    stopPlayback() {
        if (this.isDestroyed || !this.state) return;
        this.forceStopSequence();
        this.updateState({ isPlaying: false });
    }
    
    stopFullSongPlayback() {
        if (this.isDestroyed || !this.state) return;
        this.forceStopFullSongSequence();
        this.updateState({ isPlayingFullSong: false });
    }
    
    forceStopSequence() {
        try {
            if (this.sequence) {
                this.sequence.stop();
                this.sequence.dispose();
                this.sequence = null;
            }
            if (this.fullSongSequence) {
                this.forceStopFullSongSequence();
            }
            if (!this.state.isPlayingFullSong) {
                Tone.Transport.stop();
            }
        } catch (error) {
            console.error('Force stop failed:', error);
        }
    }
    
    forceStopFullSongSequence() {
        try {
            if (this.fullSongSequence) {
                this.fullSongSequence.stop();
                this.fullSongSequence.dispose();
                this.fullSongSequence = null;
            }
            Tone.Transport.stop();
        } catch (error) {
            console.error('Force stop full song failed:', error);
        }
    }
    
    setBPM(bpm) {
        const newBpm = parseInt(bpm);
        if (isNaN(newBpm) || newBpm < 60 || newBpm > 200) return;
        
        this.updateState({ bpm: newBpm });
        
        if (this.state.audioInitialized) {
            this.transport.bpm.value = newBpm;
        }
    }
    
    safeUpdateElement(element, updates) {
        if (!element || this.isDestroyed) return false;
        
        if (updates.textContent !== undefined) {
            element.textContent = updates.textContent;
        }
        if (updates.innerHTML !== undefined) {
            element.innerHTML = updates.innerHTML;
        }
        if (updates.className !== undefined) {
            element.className = updates.className;
        }
        if (updates.classList) {
            if (updates.classList.add) element.classList.add(...updates.classList.add);
            if (updates.classList.remove) element.classList.remove(...updates.classList.remove);
            if (updates.classList.toggle) element.classList.toggle(updates.classList.toggle);
        }
        return true;
    }
    
    getInstrumentType(track) {
        if (this.constants.DRUM_TRACKS.includes(track)) return 'drum';
        if (this.constants.MELODY_TRACKS.includes(track)) return 'melody';
        if (this.constants.TRANSITION_TRACKS.includes(track)) return 'transition';
        return 'unknown';
    }
    
    getInstrumentData(track) {
        try {
            if (this.constants.DRUM_TRACKS.includes(track)) {
                return window.EDMCourse.instruments.drums[track];
            }
            if (this.constants.MELODY_TRACKS.includes(track)) {
                return window.EDMCourse.instruments[track];
            }
            if (this.constants.TRANSITION_TRACKS.includes(track)) {
                return window.EDMCourse.instruments.transitions[track];
            }
            return null;
        } catch (error) {
            console.warn(`Failed to get instrument data for ${track}:`, error);
            return null;
        }
    }
    
    getDefaultNote(track) {
        const defaults = {
            bass: 'C2',
            melody: 'C4',
            chord: 'C4',
            piano: 'C4',
            pluck: 'G4',
            strings: 'C3'
        };
        return defaults[track] || 'C4';
    }
    
    handleVisibilityChange() {
        if (this.isDestroyed || !this.state) return;
        if (document.hidden && (this.state.isPlaying || this.state.isPlayingFullSong)) {
            this.stopPlayback();
            this.stopFullSongPlayback();
        }
    }
    
    handleBeforeUnload() {
        this.cleanup();
    }
    
    setupEventListeners() {
        this.bindElement('playBtn', 'click', () => this.togglePlayback());
        this.bindElement('playFullSongBtn', 'click', () => this.toggleFullSongPlayback());
        
        window.addEventListener('beforeunload', this.handleBeforeUnload);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
    
    bindElement(elementKey, event, handler) {
        const element = this.elements[elementKey];
        if (element) {
            element.addEventListener(event, handler);
        }
    }
    
    loadCurrentStep() {
        const stepData = window.EDMCourse.steps[this.state.currentStep - 1];
        if (!stepData) {
            console.error(`Step data not found: ${this.state.currentStep}`);
            return;
        }
        
        const oldSection = this.state.currentSection;
        const newSection = stepData.section;
        
        if (oldSection !== newSection) {
            this.switchToSection(newSection, oldSection);
        }
        
        if (this.ui && typeof this.ui.loadCurrentStep === 'function') {
            this.ui.loadCurrentStep(stepData);
        } else {
            setTimeout(() => this.loadCurrentStep(), 100);
        }
    }
    
    switchToSection(newSection, oldSection = null) {
        this.updateState({ isTransitioning: true });
        this.forceStopSequence();
        this.updateState({ isPlaying: false });
        
        if (oldSection && oldSection !== newSection) {
            this.inheritPatterns(oldSection, newSection);
        }
        
        this.updateState({ currentSection: newSection });
        
        if (this.ui && oldSection && oldSection !== newSection) {
            this.ui.showSectionTransition(newSection, oldSection);
        }
        
        setTimeout(() => {
            this.updateState({ isTransitioning: false });
        }, 50);
    }
    
    inheritPatterns(from, to) {
        const ruleKey = `${from}-${to}`;
        const rule = window.EDMCourse.inheritanceRules[ruleKey];
        
        if (!rule || !rule.inherit) return;
        
        const tracks = rule.inherit;
        tracks.forEach(track => {
            const pattern = this.songData.sections[from].patterns[track];
            if (pattern) {
                this.songData.sections[to].patterns[track] = [...pattern];
            }
        });
    }
    
    nextStep() {
        if (this.state.currentStep < this.constants.TOTAL_STEPS) {
            this.updateState({ currentStep: this.state.currentStep + 1 });
            this.loadCurrentStep();
        }
    }
    
    previousStep() {
        if (this.state.currentStep > 1) {
            this.updateState({ currentStep: this.state.currentStep - 1 });
            this.loadCurrentStep();
        }
    }
    
    updatePatternData(track, step, value) {
        if (this.isDestroyed || !this.state) return { success: false };
        
        const section = this.state.currentSection;
        if (!this.songData.sections[section]?.patterns[track]) {
            return { success: false };
        }
        
        this.songData.sections[section].patterns[track][step] = value;
        return { success: true };
    }
    
    cleanup() {
        if (this.isDestroyed) return;
        
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        
        try {
            this.stopPlayback();
            this.stopFullSongPlayback();
            this.cleanupAudioObjects();
            this.state.audioInitialized = false;
            this.state.isPlaying = false;
            this.state.isPlayingFullSong = false;
        } catch (error) {
            console.error('Cleanup failed:', error);
        }
    }
    
    cleanupAudioObjects() {
        try {
            if (this.sequence) {
                this.sequence.stop();
                this.sequence.dispose();
                this.sequence = null;
            }
            
            if (this.fullSongSequence) {
                this.fullSongSequence.stop();
                this.fullSongSequence.dispose();
                this.fullSongSequence = null;
            }
            
            Object.values(this.synths).forEach(synth => {
                if (synth && typeof synth.dispose === 'function') {
                    synth.dispose();
                }
            });
            this.synths = {};
            
            Object.values(this.effects).forEach(effect => {
                if (effect && typeof effect.dispose === 'function') {
                    effect.dispose();
                }
            });
            this.effects = {};
            
            if (Tone.Transport.state === 'started') {
                Tone.Transport.stop();
            }
        } catch (error) {
            console.error('Audio cleanup error:', error);
        }
    }
    
    destroy() {
        if (this.isDestroyed) return;
        
        this.isDestroyed = true;
        this.cleanup();
        
        this.state = null;
        this.elements = null;
        this.synths = null;
        this.effects = null;
        this.sequence = null;
        this.fullSongSequence = null;
        this.ui = null;
        this.songData = null;
    }
    
    getDebugInfo() {
        try {
            return {
                state: this.state,
                currentPatterns: this.songData.sections[this.state.currentSection].patterns,
                audioState: {
                    initialized: this.state.audioInitialized,
                    playing: this.state.isPlaying,
                    playingFullSong: this.state.isPlayingFullSong,
                    bpm: this.state.bpm
                },
                effects: Object.keys(this.effects),
                synths: Object.keys(this.synths),
                volumeOptimization: {
                    kick: "0dB (baseline)",
                    snare: "-6dB",
                    hihat: "-8dB", 
                    clap: "-8dB",
                    bass: "-7dB (reduced from -5dB)",
                    melody: "-9dB (reduced from -7dB)",
                    chord: "-8dB", 
                    piano: "-6dB",
                    pluck: "-4dB",
                    strings: "-10dB (most reduced)",
                    uplifter: "-10dB (noise reduction)",
                    riser: "-6dB",
                    sweep: "-6dB"
                }
            };
        } catch (error) {
            console.error('Debug info generation failed:', error);
            return { error: 'Debug info unavailable' };
        }
    }
}

window.EDMCore = EDMCore;
            