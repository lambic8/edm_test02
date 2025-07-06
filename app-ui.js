// EDM学習アプリ - UI・インタラクション処理（スマホ対応版・18ステップ対応）
class EDMInterface {
    constructor(core) {
        this.core = core;
        this.floatingGuide = null;
    }
    
    async init() {
        this.setupUIEventListeners();
        this.initFloatingGuide();
        console.log("✅ EDM Interface initialized");
    }
    
    initFloatingGuide() {
        this.floatingGuide = new FloatingGuideController(this);
    }
    
    updateFloatingGuide(stepData) {
        if (this.floatingGuide) {
            this.floatingGuide.updateContent(stepData);
        }
    }
    
    setupUIEventListeners() {
        this.core.bindElement('continueBtn', 'click', () => this.hideModal());
        
        document.addEventListener('click', (e) => {
            const sectionItem = e.target.closest('.section-item');
            if (sectionItem?.dataset.section) {
                this.switchSection(sectionItem.dataset.section);
                return;
            }
        });
    }
    
    switchSection(sectionKey) {
        if (this.core.state.currentSection === sectionKey || this.core.state.isTransitioning) return;
        
        this.core.switchToSection(sectionKey, this.core.state.currentSection);
        this.updateSectionUI();
        this.core.loadCurrentStep();
    }
    
    showSectionTransition(newSection, oldSection) {
        if (!this.floatingGuide) return;
        
        const sectionInfo = this.getSectionInfo(newSection);
        if (!sectionInfo) return;
        
        this.floatingGuide.showSectionTransition(sectionInfo, oldSection);
    }
    
    getSectionInfo(sectionKey) {
        const sectionData = {
            intro: {
                name: "Intro",
                description: "楽曲の導入部分。基本的なリズムパターンを構築し、聴き手を楽曲世界に誘います。",
                features: "4つ打ちキック、シンプルなベースライン"
            },
            preBuildup: {
                name: "PreBuild",
                description: "イントロからビルドアップへの移行準備。エネルギーを徐々に蓄積し始めます。",
                features: "アップリフター追加、期待感演出"
            },
            buildup: {
                name: "Buildup",
                description: "エネルギーを段階的に高める重要なセクション。密度とテンションを上げてドロップへ導きます。",
                features: "キック密度アップ、クラップ追加、ハイハット強化"
            },
            preDrop: {
                name: "PreDrop",
                description: "ドロップ直前の最大テンション。聴き手の期待感を頂点まで押し上げます。",
                features: "ライザー追加、最大密度、テンション頂点"
            },
            drop: {
                name: "Drop",
                description: "楽曲のクライマックス。最も印象的なメロディとハーモニーで聴き手を圧倒します。",
                features: "メロディライン、コード進行、最大音圧"
            },
            preBreakdown: {
                name: "PreBreak",
                description: "ドロップからブレイクダウンへの移行準備。ドラム要素を徐々に除去し始めます。",
                features: "ドラム除去開始、メロディ要素重視"
            },
            breakdown: {
                name: "Break",
                description: "静寂と美しさで感情を表現。ドラムを取り除き、メロディの美しさを際立たせます。",
                features: "ドラム除去、アンビエントパッド、情感豊かなメロディ"
            },
            outro: {
                name: "Outro",
                description: "楽曲の締めくくり。シンプルで美しい終結部で聴き手に余韻を残します。",
                features: "シンプルなメロディ、フェードアウト効果"
            }
        };
        
        return sectionData[sectionKey];
    }
    
    createElement(tag, className = '', attributes = {}) {
        const element = document.createElement(tag);
        
        if (className) {
            element.className = className;
        }
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'textContent') {
                element.textContent = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else {
                element.setAttribute(key, value);
            }
        });
        
        return element;
    }
    
    async toggleStep(track, step) {
        if (this.core.state.isTransitioning) return;
        
        const currentValue = this.core.songData.sections[this.core.state.currentSection].patterns[track][step];
        const newValue = currentValue ? 0 : 1;
        
        const dataResult = this.core.updatePatternData(track, step, newValue);
        if (!dataResult.success) return;
        
        this.updateStepButtonUI(track, step, newValue === 1);
        
        if (newValue === 1) {
            await this.core.playInstrumentPreview(track);
        }
    }
    
    async toggleNote(track, step, note) {
        if (this.core.state.isTransitioning) return;
        
        const currentValue = this.core.songData.sections[this.core.state.currentSection].patterns[track][step];
        const newValue = (currentValue === note) ? 0 : note;
        
        const dataResult = this.core.updatePatternData(track, step, newValue);
        if (!dataResult.success) return;
        
        this.updateNoteButtonUI(track, step, newValue === note ? note : null);
        
        if (newValue === note) {
            await this.core.playInstrumentPreview(track, note);
        }
    }
    
    updateSectionUI() {
        document.querySelectorAll('.section-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeSection = document.querySelector(`[data-section="${this.core.state.currentSection}"]`);
        if (activeSection) {
            activeSection.classList.add('active');
        }
        
        const sectionName = window.EDMCourse.sections[this.core.state.currentSection]?.name || this.core.state.currentSection;
        this.core.safeUpdateElement(this.core.elements.activeSectionName, { textContent: sectionName });
    }
    
    updatePlayButtonUI() {
        if (!this.core.elements.playBtn) return;
        
        const isDisabled = this.core.state.isTransitioning;
        this.core.elements.playBtn.disabled = isDisabled;
        this.core.elements.playBtn.classList.remove('loading');
        
        const content = this.core.state.isPlaying 
            ? '<span>⏸️</span> 一時停止'
            : '<span>▶️</span> 再生';
            
        this.core.safeUpdateElement(this.core.elements.playBtn, { innerHTML: content });
    }
    
    updateFullSongButtonUI() {
        if (!this.core.elements.playFullSongBtn) return;
        
        const isDisabled = this.core.state.isTransitioning;
        this.core.elements.playFullSongBtn.disabled = isDisabled;
        this.core.elements.playFullSongBtn.classList.remove('loading');
        
        const content = this.core.state.isPlayingFullSong 
            ? '<span>⏸️</span> 停止'
            : '<span>🎵</span> フルソング再生';
            
        this.core.safeUpdateElement(this.core.elements.playFullSongBtn, { innerHTML: content });
    }
    
    updateTransitionUI() {
        const isTransitioning = this.core.state.isTransitioning;
        
        document.querySelectorAll('.section-item').forEach(item => {
            item.style.pointerEvents = isTransitioning ? 'none' : 'auto';
            item.classList.toggle('loading', isTransitioning);
        });
        
        ['playBtn', 'playFullSongBtn', 'stopBtn'].forEach(btnId => {
            if (this.core.elements[btnId]) {
                this.core.elements[btnId].disabled = isTransitioning;
                this.core.elements[btnId].classList.toggle('loading', isTransitioning);
            }
        });
        
        ['guideCheckBtn', 'guideHintBtn'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.disabled = isTransitioning;
            }
        });
    }
    
    updateStepIndicator(currentStepIndex) {
        document.querySelectorAll('.step-button, .note-button').forEach((button, index) => {
            const stepIndex = parseInt(button.dataset.step);
            if (stepIndex === currentStepIndex) {
                button.classList.add('playing');
            } else {
                button.classList.remove('playing');
            }
        });
    }
    
    updateStepButtonUI(track, step, isActive) {
        const button = document.querySelector(`[data-track="${track}"][data-step="${step}"]`);
        if (button) {
            button.classList.toggle('active', isActive);
        }
    }
    
    updateNoteButtonUI(track, step, activeNote) {
        const buttons = document.querySelectorAll(`[data-track="${track}"][data-step="${step}"]`);
        buttons.forEach(button => {
            const noteValue = button.dataset.note;
            const isActive = noteValue === activeNote;
            button.classList.toggle('active', isActive);
        });
    }
    
    loadCurrentStep(stepData) {
        this.updateStepInfo(stepData);
        this.updateNavigationButtons();
        this.showStepContent(stepData);
        this.updateFloatingGuide(stepData);
        
        setTimeout(() => {
            this.updateFloatingGuide(stepData);
        }, 100);
    }
    
    updateStepInfo(stepData) {
        const updates = {
            currentStep: `ステップ ${this.core.state.currentStep}/${this.core.constants.TOTAL_STEPS}`,
            currentSection: `${window.EDMCourse.sections[this.core.state.currentSection]?.name || this.core.state.currentSection}作成中`,
            stepTitle: stepData.title,
            stepDescription: stepData.description
        };
        
        Object.entries(updates).forEach(([key, value]) => {
            this.core.safeUpdateElement(this.core.elements[key], { textContent: value });
        });
        
        const progressPercent = (this.core.state.currentStep / this.core.constants.TOTAL_STEPS) * 100;
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill) {
            progressFill.style.width = `${progressPercent}%`;
        }
        if (progressText) {
            progressText.textContent = `ステップ ${this.core.state.currentStep}/${this.core.constants.TOTAL_STEPS} (${Math.round(progressPercent)}%)`;
        }
    }
    
    updateNavigationButtons() {
        // BPM固定、ナビゲーションボタン削除につき処理なし
    }
    
    showStepContent(stepData) {
        const showSequencer = stepData.mode === 'sequencer' || stepData.mode === 'preview';
        
        if (this.core.elements.sequencerArea) {
            this.core.elements.sequencerArea.style.display = showSequencer ? 'block' : 'none';
        }
        
        if (stepData.mode === 'sequencer') {
            this.showSequencer(stepData);
        } else if (stepData.mode === 'preview') {
            this.showPreview(stepData);
        }
    }
    
    showSequencer(stepData) {
        const container = this.core.elements.sequencerArea;
        if (!container) return;
        
        container.innerHTML = '';
        
        const drumTracks = stepData.tracks.filter(track => 
            this.core.constants.DRUM_TRACKS.includes(track)
        );
        if (drumTracks.length > 0) {
            const drumSequencer = this.createDrumSequencer(drumTracks);
            if (drumSequencer) container.appendChild(drumSequencer);
        }
        
        const transitionTracks = stepData.tracks.filter(track => 
            this.core.constants.TRANSITION_TRACKS.includes(track)
        );
        if (transitionTracks.length > 0) {
            const transitionSequencer = this.createTransitionSequencer(transitionTracks);
            if (transitionSequencer) container.appendChild(transitionSequencer);
        }
        
        const melodyTracks = stepData.tracks.filter(track => 
            this.core.constants.MELODY_TRACKS.includes(track)
        );
        melodyTracks.forEach(track => {
            const pianoRoll = this.createPianoRoll(track);
            if (pianoRoll) container.appendChild(pianoRoll);
        });
    }
    
    createDrumSequencer(tracks) {
        const container = this.createElement('div', 'sequencer-container');
        
        const header = this.createElement('div', 'track-header', {
            innerHTML: '<div class="track-name">🥁 Drum</div>'
        });
        container.appendChild(header);
        
        const sequencer = this.createElement('div', 'drum-sequencer');
        sequencer.appendChild(this.createStepNumberHeader());
        
        tracks.forEach(track => {
            const trackRow = this.createDrumTrackRow(track);
            if (trackRow) sequencer.appendChild(trackRow);
        });
        
        container.appendChild(sequencer);
        return container;
    }
    
    createTransitionSequencer(tracks) {
        const container = this.createElement('div', 'sequencer-container');
        
        const header = this.createElement('div', 'track-header', {
            innerHTML: '<div class="track-name">🎛️ Effect</div>'
        });
        container.appendChild(header);
        
        const sequencer = this.createElement('div', 'drum-sequencer');
        sequencer.appendChild(this.createStepNumberHeader());
        
        tracks.forEach(track => {
            const trackRow = this.createTransitionTrackRow(track);
            if (trackRow) sequencer.appendChild(trackRow);
        });
        
        container.appendChild(sequencer);
        return container;
    }
    
    createDrumTrackRow(track) {
        const drumTrack = this.createElement('div', 'drum-track');
        
        const instrument = window.EDMCourse.instruments.drums[track];
        if (!instrument) return null;
        
        const label = this.createElement('div', 'drum-label');
        const icon = this.createElement('span', 'drum-icon', { textContent: instrument.icon });
        const name = this.createElement('span', 'drum-name', { textContent: instrument.name });
        label.appendChild(icon);
        label.appendChild(name);
        drumTrack.appendChild(label);
        
        for (let i = 0; i < this.core.constants.STEPS_PER_PATTERN; i++) {
            const button = this.createStepButton(track, i);
            if (button) drumTrack.appendChild(button);
        }
        
        return drumTrack;
    }
    
    createTransitionTrackRow(track) {
        const transitionTrack = this.createElement('div', 'drum-track');
        
        const instrument = window.EDMCourse.instruments.transitions[track];
        if (!instrument) return null;
        
        const label = this.createElement('div', 'drum-label');
        const icon = this.createElement('span', 'drum-icon', { textContent: instrument.icon });
        const name = this.createElement('span', 'drum-name', { textContent: instrument.name });
        label.appendChild(icon);
        label.appendChild(name);
        transitionTrack.appendChild(label);
        
        for (let i = 0; i < this.core.constants.STEPS_PER_PATTERN; i++) {
            const button = this.createStepButton(track, i);
            if (button) transitionTrack.appendChild(button);
        }
        
        return transitionTrack;
    }
    
    createStepButton(track, step) {
        const button = this.createElement('button', 'step-button', {
            dataset: { track, step: step.toString() }
        });
        
        const currentValue = this.core.songData.sections[this.core.state.currentSection].patterns[track][step];
        
        if (currentValue && currentValue !== 0) {
            button.classList.add('active');
        }
        
        if (step % this.core.constants.AUDIO.BEAT_DIVISION === 0) {
            button.classList.add('beat-start');
        }
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleStep(track, step);
        });
        
        return button;
    }
    
    createPianoRoll(track) {
        const container = this.createElement('div', 'sequencer-container');
        
        const instrument = this.core.getInstrumentData(track);
        if (!instrument) return null;
        
        const header = this.createElement('div', 'track-header');
        const trackName = this.createElement('div', 'track-name', 
            { textContent: `${instrument.icon} ${instrument.name}` }
        );
        header.appendChild(trackName);
        container.appendChild(header);
        
        const pianoRoll = this.createElement('div', 'piano-roll');
        pianoRoll.classList.add(`${track}-track`);
        
        pianoRoll.appendChild(this.createPianoStepHeader());
        
        const noteRows = this.createNoteRows(track);
        noteRows.forEach(row => {
            if (row) pianoRoll.appendChild(row);
        });
        
        container.appendChild(pianoRoll);
        return container;
    }
    
    createNoteRows(track) {
        const scale = window.EDMCourse.scales[track];
        if (!scale) return [];
        
        return scale.slice().reverse().map(note => {
            const noteRow = this.createElement('div', 'note-row');
            
            const noteLabel = this.createElement('div', 'note-label', {
                textContent: note
            });
            noteRow.appendChild(noteLabel);
            
            for (let i = 0; i < this.core.constants.STEPS_PER_PATTERN; i++) {
                const button = this.createNoteButton(track, i, note);
                if (button) noteRow.appendChild(button);
            }
            
            return noteRow;
        });
    }
    
    createNoteButton(track, step, note) {
        const button = this.createElement('button', 'step-button note-button', {
            dataset: { track, step: step.toString(), note }
        });
        
        const currentValue = this.core.songData.sections[this.core.state.currentSection].patterns[track][step];
        if (currentValue === note) {
            button.classList.add('active');
        }
        
        if (step % this.core.constants.AUDIO.BEAT_DIVISION === 0) {
            button.classList.add('beat-start');
        }
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleNote(track, step, note);
        });
        
        return button;
    }
    
    createStepNumberHeader() {
        const stepNumbers = this.createElement('div', 'step-numbers');
        stepNumbers.appendChild(this.createElement('div', 'empty-label'));
        
        for (let i = 1; i <= this.core.constants.STEPS_PER_PATTERN; i++) {
            const stepNum = this.createElement('div', 'step-number', {
                textContent: i.toString(),
                dataset: { step: i.toString() }
            });
            
            if ((i - 1) % this.core.constants.AUDIO.BEAT_DIVISION === 0) {
                stepNum.classList.add('beat-start');
            }
            
            stepNumbers.appendChild(stepNum);
        }
        
        return stepNumbers;
    }
    
    createPianoStepHeader() {
        const stepNumbers = this.createElement('div', 'piano-step-numbers');
        stepNumbers.appendChild(this.createElement('div', 'note-label-placeholder'));
        
        for (let i = 1; i <= this.core.constants.STEPS_PER_PATTERN; i++) {
            const stepNum = this.createElement('div', 'step-number', {
                textContent: i.toString(),
                dataset: { step: i.toString() }
            });
            
            if ((i - 1) % this.core.constants.AUDIO.BEAT_DIVISION === 0) {
                stepNum.classList.add('beat-start');
            }
            
            stepNumbers.appendChild(stepNum);
        }
        
        return stepNumbers;
    }
    
    checkPattern() {
        if (this.core.state.isTransitioning) return;
        
        const stepData = window.EDMCourse.steps[this.core.state.currentStep - 1];
        if (!stepData?.validation) {
            this.showSuccess();
            return;
        }
        
        const isValid = this.validateStepData(stepData.validation);
        
        if (isValid) {
            this.showSuccess();
        } else {
            this.showValidationError();
        }
    }
    
    validateStepData(validation) {
        switch (validation.type) {
            case 'pattern':
                return this.validatePattern(validation);
            case 'multiple':
                return this.validateMultiplePatterns(validation);
            default:
                return true;
        }
    }
    
    validatePattern(validation) {
        const track = validation.track;
        const expectedPattern = validation.pattern;
        
        const currentPattern = this.core.songData.sections[this.core.state.currentSection].patterns[track];
        if (!currentPattern) return false;
        
        for (let i = 0; i < expectedPattern.length; i++) {
            if (expectedPattern[i] !== currentPattern[i]) {
                return false;
            }
        }
        
        return true;
    }
    
    validateMultiplePatterns(validation) {
        for (const patternValidation of validation.patterns) {
            if (!this.validatePattern(patternValidation)) {
                return false;
            }
        }
        return true;
    }
    
    showValidationError() {
        const message = 'パターンが正しくありません。説明をもう一度確認してください。';
        alert(`❌ ${message}`);
    }
    
    showSuccess() {
        const message = window.EDMCourse.successMessages[this.core.state.currentStep] || 'ステップが完了しました！';
        
        if (this.core.elements.successMessage) {
            this.core.safeUpdateElement(this.core.elements.successMessage, { textContent: message });
        }
        
        if (this.core.elements.successModal) {
            this.core.elements.successModal.style.display = 'flex';
        } else {
            alert(message);
        }
    }
    
    hideModal() {
        if (this.core.elements.successModal) {
            this.core.elements.successModal.style.display = 'none';
        }
        
        if (this.core.state.currentStep < this.core.constants.TOTAL_STEPS) {
            this.core.nextStep();
        }
    }
    
    showPreview(stepData) {
        const container = this.core.elements.sequencerArea;
        if (!container) return;
        
        container.innerHTML = '';
        
        if (stepData.isComplete) {
            const preview = this.createElement('div', 'preview-container', {
                innerHTML: `
                    <div class="congratulations">
                        <h2>🎉 楽曲完成おめでとうございます！</h2>
                        <p>あなたは完全なEDM楽曲を作成しました。各セクションとプレセクションを切り替えて、自然な移行を確認してみましょう。</p>
                        <div class="section-guide">
                            <h3>📖 セクション構成</h3>
                            <ul>
                                <li><strong>Intro</strong> → <em>PreBuild</em> → <strong>Buildup</strong></li>
                                <li><strong>Buildup</strong> → <em>PreDrop</em> → <strong>Drop</strong></li>
                                <li><strong>Drop</strong> → <em>PreBreak</em> → <strong>Break</strong></li>
                                <li><strong>Break</strong> → <strong>Outro</strong></li>
                            </ul>
                            <p>プレセクション（1小節）が各セクション間の自然な移行を実現しています。</p>
                        </div>
                    </div>
                `
            });
            container.appendChild(preview);
        }
    }
}

class FloatingGuideController {
    constructor(uiInstance) {
        this.ui = uiInstance;
        this.core = uiInstance.core;
        this.panel = document.getElementById('floatingGuidePanel');
        this.hintModal = document.getElementById('hintModal');
        this.isMinimized = false;
        this.sectionTransitionTimeout = null;
        this.init();
    }
    
    init() {
        const minimizeBtn = document.getElementById('guideMinimizeBtn');
        const hintBtn = document.getElementById('guideHintBtn');
        const checkBtn = document.getElementById('guideCheckBtn');
        const hintCloseBtn = document.getElementById('hintCloseBtn');
        
        minimizeBtn?.addEventListener('click', () => this.toggleMinimize());
        hintBtn?.addEventListener('click', () => this.showHint());
        hintCloseBtn?.addEventListener('click', () => this.hideHint());
        
        checkBtn?.addEventListener('click', () => {
            if (this.ui && this.ui.checkPattern) {
                this.ui.checkPattern();
            }
        });
        
        this.hintModal?.addEventListener('click', (e) => {
            if (e.target === this.hintModal) {
                this.hideHint();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.hintModal?.classList.contains('active')) {
                this.hideHint();
            }
        });
    }
    
    showSectionTransition(sectionInfo, oldSection) {
        const titleElement = document.getElementById('guideStepTitle');
        const descElement = document.getElementById('guideDescription');
        const actionsElement = document.querySelector('.guide-actions');
        
        if (!titleElement || !descElement || !actionsElement) return;
        
        this.originalContent = {
            title: titleElement.textContent,
            description: descElement.textContent,
            actionsDisplay: actionsElement.style.display
        };
        
        const inheritanceInfo = this.getInheritanceInfo(oldSection, sectionInfo.name.toLowerCase());
        
        titleElement.innerHTML = `🎵 ${sectionInfo.name}セクション開始！`;
        descElement.innerHTML = `
            <div style="margin-bottom: 0.5rem;"><strong>${sectionInfo.description}</strong></div>
            <div style="font-size: 0.85rem; opacity: 0.9;">特徴: ${sectionInfo.features}</div>
            ${inheritanceInfo ? `<div style="font-size: 0.8rem; margin-top: 0.5rem; padding: 0.25rem; background: rgba(96, 165, 250, 0.2); border-radius: 4px;">${inheritanceInfo}</div>` : ''}
        `;
        actionsElement.style.display = 'none';
        
        this.panel?.classList.add('section-transition');
        
        if (this.sectionTransitionTimeout) {
            clearTimeout(this.sectionTransitionTimeout);
        }
        
        this.sectionTransitionTimeout = setTimeout(() => {
            this.restoreNormalContent();
        }, 3000);
    }
    
    getInheritanceInfo(oldSection, newSectionKey) {
        if (!oldSection) return null;
        
        const ruleKey = `${oldSection}-${newSectionKey}`;
        const rule = window.EDMCourse?.inheritanceRules?.[ruleKey];
        
        if (rule && rule.inherit) {
            return `🔄 継承: ${rule.inherit.join(', ')} - ${rule.explanation}`;
        }
        
        return null;
    }
    
    restoreNormalContent() {
        const titleElement = document.getElementById('guideStepTitle');
        const descElement = document.getElementById('guideDescription');
        const actionsElement = document.querySelector('.guide-actions');
        
        if (this.originalContent && titleElement && descElement && actionsElement) {
            titleElement.textContent = this.originalContent.title;
            descElement.innerHTML = this.originalContent.description;
            actionsElement.style.display = this.originalContent.actionsDisplay;
        }
        
        this.panel?.classList.remove('section-transition');
        this.originalContent = null;
        
        const currentStepData = window.EDMCourse?.steps?.[this.core?.state?.currentStep - 1];
        if (currentStepData) {
            setTimeout(() => {
                this.updateContent(currentStepData);
            }, 100);
        }
    }
    
    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        const minimizeIcon = document.getElementById('minimizeIcon');
        
        if (this.isMinimized) {
            this.panel.classList.add('minimized');
            if (minimizeIcon) minimizeIcon.textContent = '▲';
        } else {
            this.panel.classList.remove('minimized');
            if (minimizeIcon) minimizeIcon.textContent = '▼';
        }
    }
    
    showHint() {
        const currentStep = this.core?.state?.currentStep || 1;
        const hintContent = window.EDMCourse?.learningTips?.[currentStep] || 
            'このステップのヒントはまだ準備中です。基本的な操作方法に従って進めてください。';
        
        const hintModalBody = document.getElementById('hintModalBody');
        if (hintModalBody) {
            hintModalBody.textContent = hintContent;
        }
        
        this.hintModal?.classList.add('active');
    }
    
    hideHint() {
        this.hintModal?.classList.remove('active');
    }
    
    updateContent(stepData) {
        if (this.originalContent) return;
        
        const titleElement = document.getElementById('guideStepTitle');
        if (titleElement && stepData.title) {
            titleElement.textContent = stepData.title;
        }
        
        const descElement = document.getElementById('guideDescription');
        if (descElement && stepData.description) {
            descElement.textContent = stepData.description;
        }
        
        const isTransitioning = this.core?.state?.isTransitioning || false;
        
        const checkBtn = document.getElementById('guideCheckBtn');
        if (checkBtn) {
            checkBtn.disabled = isTransitioning;
        }
        
        const hintBtn = document.getElementById('guideHintBtn');
        if (hintBtn) {
            hintBtn.disabled = isTransitioning;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        window.edmCore = new EDMCore();
        window.EDMInterface = EDMInterface;
        window.edmCore.init();
        window.edmApp = window.edmCore;
        
        window.addEventListener('beforeunload', () => {
            if (window.edmCore && !window.edmCore.isDestroyed) {
                window.edmCore.destroy();
            }
        });
    } catch (error) {
        console.error('Critical startup error:', error);
        alert('アプリケーションの起動に失敗しました。ページを再読み込みしてください。');
    }
});

window.debugEDM = () => {
    if (window.edmCore && !window.edmCore.isDestroyed) {
        console.log('🐛 Debug Info:', window.edmCore.getDebugInfo());
    } else {
        console.log('❌ App not initialized or destroyed');
    }
};

window.forceCleanup = () => {
    if (window.edmCore) {
        window.edmCore.destroy();
        console.log('🧹 Force cleanup completed');
    }
};

window.EDMInterface = EDMInterface;
window.FloatingGuideController = FloatingGuideController;