// EDM学習コース - ステップ定義（Avicii風対応版）
window.EDMCourseSteps = {
    steps: [
        // Phase 1: Piano Foundation (ステップ 1-4)
        {
            step: 1, section: "intro", mode: "sequencer",
            title: "ステップ 1: イントロ - 美しいピアノアルペジオ",
            description: "Avicii風の美しいピアノアルペジオから楽曲を開始しましょう。1, 3, 5, 7, 9, 11, 13, 15拍目にC4, E4, G4, C5, E5, C5, G4, E4を配置して、「Levels」や「Waiting for Love」のような感動的なイントロを作成してください。",
            tracks: ["piano"],
            validation: { type: "pattern", track: "piano", pattern: ["C4",0,"E4",0,"G4",0,"C5",0,"E5",0,"C5",0,"G4",0,"E4",0] }
        },
        {
            step: 2, section: "intro", mode: "sequencer", 
            title: "ステップ 2: イントロ - ストリングスハーモニー",
            description: "ピアノアルペジオに深みを与えるストリングスを追加しましょう。1, 9拍目にC3, G3のロングトーンを配置して、Avicii特有の温かいハーモニーを作成してください。",
            tracks: ["piano", "strings"],
            validation: { type: "pattern", track: "strings", pattern: ["C3",0,0,0,0,0,0,0,"G3",0,0,0,0,0,0,0] }
        },
        {
            step: 3, section: "intro", mode: "sequencer",
            title: "ステップ 3: イントロ - リズム導入",
            description: "アコースティックからエレクトロニックへの変化を開始します。1, 5, 9, 13拍目に4つ打ちキックを追加して、楽曲にグルーヴを与えてください。",
            tracks: ["piano", "strings", "kick"],
            validation: { type: "pattern", track: "kick", pattern: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0] }
        },
        {
            step: 4, section: "intro", mode: "sequencer",
            title: "ステップ 4: イントロ - ベースライン",
            description: "1, 5, 9, 13拍目にC2, F2, G2, C2のベースパターンを追加しましょう。このI-IV-V-I進行がAvicii風の安定感と推進力を生み出します。",
            tracks: ["piano", "strings", "kick", "bass"],
            validation: { type: "pattern", track: "bass", pattern: ["C2",0,0,0,"F2",0,0,0,"G2",0,0,0,"C2",0,0,0] }
        },
        
        // Phase 2: Electronic Elements (ステップ 5-8)
        {
            step: 5, section: "preBuildup", mode: "sequencer",
            title: "ステップ 5: プレビルドアップ - プラックシンセ導入",
            description: "イントロから継承：ピアノアルペジオ、ストリングスハーモニー、キック、ベースラインがすべて維持されます。ここにAvicii特有のプラックシンセを追加します。6, 8, 14, 16拍目にG4を配置して、「Levels」のようなシンコペーションとアクセントを作成してください。オフビートの躍動感が楽曲に生命力を与えます。",
            tracks: ["piano", "strings", "kick", "bass", "pluck"],
            validation: { type: "pattern", track: "pluck", pattern: [0,0,0,0,0,"G4",0,"G4",0,0,0,0,0,"G4",0,"G4"] }
        },
        
        // Phase 3: Rhythm Development (ステップ 6-8)
        {
            step: 6, section: "buildup", mode: "sequencer",
            title: "ステップ 6: ビルドアップ - リズムセクション強化",
            description: "プレビルドアップから継承：ピアノ、ストリングス、キック、ベース、プラックがすべて維持されます。ここでリズムセクションを強化します。5, 13拍目にスネアと、3, 7, 11, 15拍目にハイハットを追加して、完全なEDMリズムセクションを構築しましょう。",
            tracks: ["piano", "strings", "kick", "bass", "pluck", "snare", "hihat"],
            validation: { type: "multiple", patterns: [
                { track: "snare", pattern: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0] },
                { track: "hihat", pattern: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0] }
            ]}
        },
        {
            step: 7, section: "buildup", mode: "sequencer",
            title: "ステップ 7: ビルドアップ - メロディックリード",
            description: "感動的なAvicii風メロディを追加します。1-16拍目に連続してE4, D4, E4, F4, G4, F4, E4, D4, C4, D4, E4, F4, E4, D4, C4を配置し、16拍目は空白にして印象的なメロディラインを作成してください。",
            tracks: ["piano", "strings", "kick", "bass", "pluck", "snare", "hihat", "melody"],
            validation: { type: "pattern", track: "melody", pattern: ["E4","D4","E4","F4","G4","F4","E4","D4","C4","D4","E4","F4","E4","D4","C4",0] }
        },
        {
            step: 8, section: "buildup", mode: "sequencer",
            title: "ステップ 8: ビルドアップ - エネルギー完成",
            description: "5, 13拍目にクラップを追加して、ビルドアップのエネルギーを最大化しましょう。すべての要素が調和したAviciiサウンドの完成です。",
            tracks: ["piano", "strings", "kick", "bass", "pluck", "snare", "hihat", "melody", "clap"],
            validation: { type: "pattern", track: "clap", pattern: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0] }
        },
        
        // Phase 4: Build to Drop (ステップ 9-10)
        {
            step: 9, section: "buildup", mode: "sequencer",
            title: "ステップ 9: ビルドアップ - アップリフター追加",
            description: "13, 15拍目にアップリフターを追加して、ドロップへの期待感を構築しましょう。Aviciiの楽曲では段階的な感情構築が重要な要素です。",
            tracks: ["piano", "strings", "kick", "bass", "pluck", "snare", "hihat", "melody", "clap", "uplifter"],
            validation: { type: "pattern", track: "uplifter", pattern: [0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0] }
        },
        
        // Phase 4: Pre-Drop (ステップ 10)
        {
            step: 10, section: "preDrop", mode: "sequencer",
            title: "ステップ 10: プレドロップ - 最終テンション",
            description: "ビルドアップから継承：キック、スネア、ハイハット、クラップ、ベース、プラックが維持されます。注意：ピアノ、ストリングス、メロディは除去され、次のドロップでの爆発的効果を演出します。14, 15, 16拍目にライザーを追加して、ドロップへの最終的な期待感を最高潮に高めましょう。この瞬間の緊張感が次の爆発的なドロップを際立たせます。",
            tracks: ["kick", "snare", "hihat", "clap", "bass", "pluck", "riser"],
            validation: { type: "pattern", track: "riser", pattern: [0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1] }
        },
        
        // Phase 5: Euphoric Drop (ステップ 11-13)
        {
            step: 11, section: "drop", mode: "sequencer",
            title: "ステップ 11: ドロップ - 感動的ピアノドロップ",
            description: "プレドロップから継承：キック、スネア、ハイハット、クラップ、ベース、プラックのリズム基盤が維持されます。ここにAvicii風の感動的なピアノが復活します！1-16拍目に連続してC4, E4, G4, C5, E5, C5, G4, E4, F4, A4, C5, F5, C5, A4, F4を配置し、16拍目は空白にして壮大なクライマックスを作成してください。",
            tracks: ["kick", "snare", "hihat", "clap", "bass", "pluck", "piano"],
            validation: { type: "pattern", track: "piano", pattern: ["C4","E4","G4","C5","E5","C5","G4","E4","F4","A4","C5","F5","C5","A4","F4",0] }
        },
        {
            step: 12, section: "drop", mode: "sequencer",
            title: "ステップ 12: ドロップ - ハーモニー構築",
            description: "1, 5, 9, 13拍目にC4, F4, G4, C5のコード進行を追加して、豊かなハーモニーを構築しましょう。I-IV-V-I進行でAvicii特有の感動的な響きを実現します。",
            tracks: ["kick", "snare", "hihat", "clap", "bass", "pluck", "piano", "chord"],
            validation: { type: "pattern", track: "chord", pattern: ["C4",0,0,0,"F4",0,0,0,"G4",0,0,0,"C5",0,0,0] }
        },
        {
            step: 13, section: "drop", mode: "sequencer",
            title: "ステップ 13: ドロップ - プラック強化",
            description: "2, 4, 6, 8, 10, 12, 14, 16拍目（全ての偶数拍）にG4のプラックパターンを追加して、「Levels」のような中毒性のあるリズムを完成させましょう。連続するG4が楽曲に強烈なグルーヴを与えます。",
            tracks: ["kick", "snare", "hihat", "clap", "bass", "pluck", "piano", "chord"],
            validation: { type: "pattern", track: "pluck", pattern: [0,"G4",0,"G4",0,"G4",0,"G4",0,"G4",0,"G4",0,"G4",0,"G4"] }
        },
        
        // Phase 6: Transition (ステップ 14)
        {
            step: 14, section: "preBreakdown", mode: "sequencer",
            title: "ステップ 14: プレブレイクダウン - 感情的移行",
            description: "ドロップから継承：ピアノ、メロディ、ストリングスの美しい要素のみが維持されます。注意：すべてのドラム系楽器（キック、スネア、ハイハット、クラップ）、ベース、プラック、コードは除去され、静寂への移行が始まります。13, 14, 15, 16拍目にスイープを追加して、感動的なブレイクダウンへの移行を準備しましょう。Aviciiの楽曲では、エネルギーの後に必ず美しい瞬間が訪れます。",
            tracks: ["piano", "melody", "strings", "sweep"],
            validation: { type: "pattern", track: "sweep", pattern: [0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1] }
        },
        
        // Phase 7: Emotional Breakdown (ステップ 15-16)
        {
            step: 15, section: "breakdown", mode: "sequencer",
            title: "ステップ 15: ブレイクダウン - 美しいハーモニー",
            description: "プレブレイクダウンから継承：ピアノとストリングスのみが維持されます。注意：メロディとスイープは除去され、純粋な美しさが際立ちます。1, 4, 7, 10拍目にD4, F4, A4, D5のピアノメロディを配置し、1, 9拍目にF3, A3のストリングスを配置して、感動的なブレイクダウンを作成しましょう。静寂の中の美しさを表現してください。",
            tracks: ["piano", "strings"],
            validation: { type: "multiple", patterns: [
                { track: "piano", pattern: ["D4",0,0,"F4",0,0,"A4",0,0,"D5",0,0,0,0,0,0] },
                { track: "strings", pattern: ["F3",0,0,0,0,0,0,0,"A3",0,0,0,0,0,0,0] }
            ]}
        },
        {
            step: 16, section: "breakdown", mode: "sequencer",
            title: "ステップ 16: ブレイクダウン - 感情の深化",
            description: "ピアノとストリングスのハーモニーを調整して、より深い感情表現を作り出しましょう。Aviciiの「Wake Me Up」のような美しい瞬間を体験してください。",
            tracks: ["piano", "strings"],
            validation: { type: "pattern", track: "strings", pattern: ["F3",0,0,0,0,0,0,0,"A3",0,0,0,0,0,0,0] }
        },
        
        // Phase 8: Resolution Preparation (ステップ 17)
        {
            step: 17, section: "preOutro", mode: "sequencer",
            title: "ステップ 17: プレアウトロ - 要素削減",
            description: "ブレイクダウンから継承：ピアノのみが維持されます。注意：ストリングスは除去され、シンプルな美学への移行が始まります。楽曲の終結に向けて要素をシンプル化します。1, 5拍目にのみC4, G4のピアノを配置して、純粋な美しさを表現しましょう。残りの拍は空白にして静寂の美学を感じてください。",
            tracks: ["piano"],
            validation: { type: "pattern", track: "piano", pattern: ["C4",0,0,0,"G4",0,0,0,0,0,0,0,0,0,0,0] }
        },
        
        // Phase 9: Beautiful Outro (ステップ 18-19)
        {
            step: 18, section: "outro", mode: "sequencer",
            title: "ステップ 18: アウトロ - ピアノソロ",
            description: "プレアウトロから継承：美しいピアノソロが維持されます。楽曲の核心的要素のみが残り、感動的な終結を迎えます。1, 5拍目にのみC4, G4を配置し、残りの拍は空白にして、Avicii特有のシンプルで心に残る終結を作成してください。",
            tracks: ["piano"],
            validation: { type: "pattern", track: "piano", pattern: ["C4",0,0,0,"G4",0,0,0,0,0,0,0,0,0,0,0] }
        },
        {
            step: 19, section: "outro", mode: "sequencer",
            title: "ステップ 19: アウトロ - 感動的余韻",
            description: "同じピアノパターンを継続して、楽曲に美しい余韻を残しましょう。1, 5拍目にC4, G4を配置し、残りの拍は空白にして、Aviciiの楽曲のように終わった後も心に残る感動を演出してください。",
            tracks: ["piano"],
            validation: { type: "pattern", track: "piano", pattern: ["C4",0,0,0,"G4",0,0,0,0,0,0,0,0,0,0,0] }
        },
        
        // Phase 10: Completion (ステップ 20)
        {
            step: 20, section: "complete", mode: "preview",
            title: "ステップ 20: 楽曲完成 - Avicii風感動的な旅路",
            description: "🎉 おめでとうございます！美しいピアノアルペジオから始まり、感動的なドロップを経て、心に残る美しさで終わるAvicii風楽曲が完成しました。「Levels」「Wake Me Up」「Waiting for Love」と同じDNAを持つ、世界中で愛される音楽を作り上げました！",
            tracks: ["kick", "snare", "hihat", "clap", "bass", "melody", "chord", "piano", "pluck", "strings", "uplifter", "riser", "sweep"],
            isComplete: true
        }
    ]
};

// コース拡張用ヘルパー関数
window.EDMCourseSteps.addStep = function(stepData) {
    this.steps.push(stepData);
    return this.steps.length;
};

window.EDMCourseSteps.insertStep = function(position, stepData) {
    this.steps.splice(position, 0, stepData);
    // ステップ番号を再計算
    this.steps.forEach((step, index) => {
        step.step = index + 1;
    });
    return this.steps.length;
};

window.EDMCourseSteps.removeStep = function(stepNumber) {
    const index = stepNumber - 1;
    if (index >= 0 && index < this.steps.length) {
        this.steps.splice(index, 1);
        // ステップ番号を再計算
        this.steps.forEach((step, index) => {
            step.step = index + 1;
        });
    }
    return this.steps.length;
};

window.EDMCourseSteps.getStepsForSection = function(sectionKey) {
    return this.steps.filter(step => step.section === sectionKey);
};

window.EDMCourseSteps.getTotalSteps = function() {
    return this.steps.length;
};