// EDM学習コース - 統合版（軽量化）
// course-data.js と course-steps.js を統合して window.EDMCourse を作成

window.EDMCourse = {};

// 依存関係の確認と統合
document.addEventListener('DOMContentLoaded', function() {
    // データとステップが両方読み込まれるまで待機
    const checkDependencies = () => {
        if (typeof window.EDMCourseData !== 'undefined' && 
            typeof window.EDMCourseSteps !== 'undefined') {
            
            // EDMCourseData から基本データをコピー
            Object.assign(window.EDMCourse, window.EDMCourseData);
            
            // EDMCourseSteps からステップデータを追加
            window.EDMCourse.steps = window.EDMCourseSteps.steps;
            window.EDMCourse.totalSteps = window.EDMCourseSteps.getTotalSteps();
            
            // 初期データを生成
            window.EDMCourse.initialData = window.EDMCourseData.createInitialData();
            
            // 拡張関数を追加
            window.EDMCourse.addStep = window.EDMCourseSteps.addStep.bind(window.EDMCourseSteps);
            window.EDMCourse.insertStep = window.EDMCourseSteps.insertStep.bind(window.EDMCourseSteps);
            window.EDMCourse.removeStep = window.EDMCourseSteps.removeStep.bind(window.EDMCourseSteps);
            window.EDMCourse.getStepsForSection = window.EDMCourseSteps.getStepsForSection.bind(window.EDMCourseSteps);
            
            console.log("✅ EDM Course data merged successfully");
            console.log(`📚 Total sections: ${Object.keys(window.EDMCourse.sections).length}`);
            console.log(`📖 Total steps: ${window.EDMCourse.totalSteps}`);
            
            // 統合完了を通知
            document.dispatchEvent(new CustomEvent('edmCourseReady'));
            
        } else {
            // 500ms後に再試行
            setTimeout(checkDependencies, 500);
        }
    };
    
    checkDependencies();
});