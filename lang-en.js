// =============================================================================
// ENGLISH LANGUAGE TRANSLATIONS
// =============================================================================

const translations_en = {
    // Page title
    pageTitle: 'Three-Signal Communication',

    // Calibration screen
    calibration: {
        title: 'Eye Tracking Calibration',
        welcomeText: 'Welcome! We need to calibrate the system.',
        btnStartUp: 'Start UP Calibration',
        btnStartDown: 'Start DOWN Calibration',
        btnStartLeft: 'Start LEFT Calibration',
        btnStartRight: 'Start RIGHT Calibration',
        btnComplete: 'Complete Calibration',

        // Calibration instructions
        introText: 'The calibration process will start soon.\n\n📌 Keep your head still during calibration for best results.\n\n📌 After calibration, try to keep your head relatively steady for optimal performance.\n\n⚙️ You can further adjust sensitivity thresholds in settings if needed.\n\nCalibration will start automatically...',
        upInstruction: 'When you see the ↑ arrow, look UP (off the screen) until you hear the sound.',
        downInstruction: 'When you see the ↓ arrow, look DOWN until you hear the sound.',
        leftInstruction: 'When you see the ← arrow, look LEFT until you hear the sound.',
        rightInstruction: 'When you see the → arrow, look RIGHT until you hear the sound.',
        preparing: 'Preparing...',
        lookUp: 'Look UP!',
        lookDown: 'Look DOWN!',
        lookLeft: 'Look LEFT!',
        lookRight: 'Look RIGHT!',
        error: 'Error! Try again.',
        completed: '✓ Completed!',
        threshold: 'Threshold',
        calibrationComplete: '✓ Calibration Complete!'
    },

    // Gaze indicator
    gazeIndicator: {
        initializing: '🎯 Initializing...',
        active: '✓ Eye Tracking Active'
    },

    // Settings panel
    settings: {
        toggleBtn: '⚙️ Settings',
        title: 'Eye Tracking Settings',

        // Language setting
        language: 'Language',
        languageGreek: '🏛️ Ελληνικά',
        languageEnglish: '🗽 English',

        // Threshold settings
        upThreshold: 'Up Threshold',
        downThreshold: 'Down Threshold',
        leftThreshold: 'Left Threshold',
        rightThreshold: 'Right Threshold',
        upHelp: 'Look up sensitivity (0.1 = easy, 1.5 = hard)',
        downHelp: 'Look down sensitivity (0.1 = easy, 1.5 = hard)',
        leftHelp: 'Look left sensitivity (0.1 = easy, 1.5 = hard)',
        rightHelp: 'Look right sensitivity (0.1 = easy, 1.5 = hard)',

        // Duration settings
        holdDuration: 'Hold Duration',
        holdHelp: 'How long to hold gaze (100-2000ms)',

        // Stability settings
        stabilityFrames: 'Stability Frames',
        stabilityHelp: 'How stable direction must be (2-10 frames)',

        // Smoothing settings
        smoothingFactor: 'Smoothing Factor',
        smoothingHelp: 'Reduce jitter (0.1 = responsive, 0.9 = smooth)',

        // Toggle settings
        showEyeVisualization: 'Show Eye Visualization',
        soundOnDetection: 'Sound on Detection',

        // Buttons
        resetBtn: 'Reset to Defaults',
        recalibrateBtn: 'Re-calibrate Thresholds',
        helpText: 'Press \'O\' key to log current eye tracking values to console'
    },

    // Help panel
    help: {
        toggleBtn: '❓ Help',
        closeBtn: '✖ Close',
        title: '❓ Helper\'s Guide',

        howItWorks: {
            title: '📖 How This App Works',
            description: 'This app lets the user communicate by looking at different areas of the screen. The camera tracks their eye movements to select letters, words, and commands.',
            lookLeft: 'Look Left:',
            lookLeftDesc: 'Select items from the left column',
            lookRight: 'Look Right:',
            lookRightDesc: 'Select items from the right column',
            lookUp: 'Look Up:',
            lookUpDesc: 'Access special menu or go back',
            lookDown: 'Look Down:',
            lookDownDesc: 'Speak text or undo menu navigation'
        },

        calibration: {
            title: '🎯 About Calibration',
            whatItIs: 'What it is:',
            whatItIsDesc: 'Calibration teaches the system to recognize the user\'s specific eye movements (up, down, left, right).',
            whyNeeded: 'Why it\'s needed:',
            whyNeededDesc: 'Every person\'s eyes are different. Calibration creates a personalized baseline for accurate tracking.',
            important: '⚠️ Important:',
            importantDesc: 'After calibration, the user\'s head position and screen position should remain unchanged. Moving the head or screen will require re-calibration for accurate tracking.'
        },

        fineTuning: {
            title: '🔧 Fine-Tuning Settings',
            description: 'Even after calibration, the system may need adjustment. Use the Settings panel to optimize performance:',
            thresholds: 'Direction Thresholds (Up/Down/Left/Right):',
            thresholdsDesc: 'How far the user must look to trigger detection. Lower = easier to trigger, Higher = harder to trigger.',
            holdDuration: 'Hold Duration:',
            holdDurationDesc: 'How long the user must hold their gaze (100-2000ms). Shorter = faster but may trigger accidentally.',
            stability: 'Stability Frames:',
            stabilityDesc: 'How steady the gaze must be (2-10 frames). Lower = more responsive, Higher = more stable.',
            smoothing: 'Smoothing Factor:',
            smoothingDesc: 'Reduces jitter in detection (0.1 = responsive, 0.9 = smooth).',
            tip: '💡 Tip: If selections trigger too easily, increase thresholds. If they\'re too hard, decrease thresholds.'
        },

        recalibration: {
            title: '🔄 Re-calibration',
            description: 'Click "Re-calibrate Thresholds" in Settings if:',
            reason1: 'The user\'s position has changed',
            reason2: 'The screen has been moved',
            reason3: 'Accuracy has decreased'
        }
    },

    // Instructions
    instructions: 'Look Left Select Left & Continue | Look Right Select Right & Continue | Look Up Special Menu / Back | Look Down Speech / menu undo',

    // Mode indicator
    modes: {
        letterSelection: 'Letter Selection Mode',
        specialMenu: 'Special Menu',
        suggestions: 'Word Suggestions',
        searchResults: 'Search Results',
        customManage: 'Manage Custom Words'
    },

    // Result viewer
    resultViewer: {
        loading: 'Loading...',
        backInstructions: '👆 Up to Return | ⬅️ Scroll Up | ➡️ Scroll Down'
    },

    // Text area placeholder
    textAreaPlaceholder: 'Your text will appear here...',

    // Menu items
    menu: {
        backspace: '⌫ Backspace',
        space: '␣ Space',
        speak: '🔊 Speak',
        deleteWord: '⌫ Delete Word',
        deleteAll: '⌫⌫ Delete All',
        undo: '← Undo',
        newLine: '↵ New Line',
        copy: '📋 Copy',
        paste: '📄 Paste',
        webSearch: '🔍 Web Search',
        addCustom: '➕ Add to Custom',
        deleteCustom: '🗑️ Delete Custom',
        return: '⌂ Return',
        cancel: '✗ Cancel',
        noCustomEntries: 'No Custom Entries',
        nextPage: '▼ Next Page',
        previousPage: '▲ Previous Page',
        closeResults: '✖ Close Results'
    },

    // Notifications
    notifications: {
        resetSettings: 'Resetting all settings to defaults...',
        resetComplete: 'Settings reset complete!',
        startingCalibration: 'Starting calibration process...',
        eyeTrackerNotReady: 'Eye tracker not initialized. Please wait for the camera to start.',
        corsProxiesUnavailable: 'Unable to fetch search results. All CORS proxies are unavailable. Please try again later.',
        noSearchResults: 'No search results found after 3 attempts. Please try a different query.',
        parseSearchFailed: 'Failed to parse search results after 3 attempts. Please try again.',
        textCopied: 'Text copied to clipboard!',
        noTextToCopy: 'No text to copy',
        textPasted: 'Text pasted!',
        noTextToPaste: 'No text in clipboard',
        customWordAdded: 'Custom word added!',
        noWordToAdd: 'No word to add',
        customEntryDeleted: 'Custom entry deleted!',
        searchPrompt: 'Type your search query and look up to search or down to cancel.',
        searchCancelled: 'Search cancelled',
        searching: 'Searching...',
        loadingResults: 'Loading results...',
        addCustomPrompt: 'Type a word or phrase and look up to save or down to cancel.',
        addCustomCancelled: 'Add custom word cancelled',
        languageChanged: 'Language changed to'
    }
};
