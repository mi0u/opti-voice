// =============================================================================
// SETTINGS PANEL MANAGEMENT
// =============================================================================

let settingsPanelVisible = false;

// Initialize settings panel
function initializeSettingsPanel() {
    const settingsToggleBtn = document.getElementById('settingsToggleBtn');
    const settingsPanel = document.getElementById('settingsPanel');
    const resetBtn = document.getElementById('resetBtn');

    // Toggle settings panel visibility
    settingsToggleBtn.addEventListener('click', () => {
        settingsPanelVisible = !settingsPanelVisible;
        if (settingsPanelVisible) {
            settingsPanel.classList.add('visible');
        } else {
            settingsPanel.classList.remove('visible');
        }
    });

    // Setup all sliders
    setupSlider('upThreshold', 'upValue', 'UP_THRESHOLD', (val) => val.toFixed(2));
    setupSlider('downThreshold', 'downValue', 'DOWN_THRESHOLD', (val) => val.toFixed(2));
    setupSlider('leftThreshold', 'leftValue', 'LEFT_THRESHOLD', (val) => val.toFixed(2));
    setupSlider('rightThreshold', 'rightValue', 'RIGHT_THRESHOLD', (val) => val.toFixed(2));
    setupSlider('holdDuration', 'holdValue', 'HOLD_DURATION', (val) => Math.round(val));
    setupSlider('stabilityFrames', 'stabilityValue', 'STABILITY_FRAMES', (val) => Math.round(val));
    setupSlider('smoothingFactor', 'smoothingValue', 'SMOOTHING_FACTOR', (val) => val.toFixed(2));

    // Reset button
    resetBtn.addEventListener('click', () => {
        if (confirm('Reset all settings to defaults?')) {
            resetToDefaults();
        }
    });

    // Eye visualization toggle
    const eyeViewToggle = document.getElementById('eyeViewToggle');
    const eyeVisualization = document.getElementById('eyeVisualization');
    eyeViewToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            eyeVisualization.style.display = 'block';
            console.log('[SETTINGS] Eye visualization enabled');
        } else {
            eyeVisualization.style.display = 'none';
            console.log('[SETTINGS] Eye visualization disabled');
        }
    });

    // Sound toggle
    const soundToggle = document.getElementById('soundToggle');
    soundToggle.addEventListener('change', (e) => {
        EYE_DETECTION_CONFIG.SOUND_ENABLED = e.target.checked;
        console.log('[SETTINGS] Sound', e.target.checked ? 'enabled' : 'disabled');
    });

    // Initialize slider values from current config
    updateSlidersFromConfig();

    console.log('[SETTINGS] Settings panel initialized');
}

// Setup individual slider
function setupSlider(sliderId, valueId, configKey, formatter) {
    const slider = document.getElementById(sliderId);
    const valueDisplay = document.getElementById(valueId);

    slider.addEventListener('input', (e) => {
        let value = parseFloat(e.target.value);

        // Update display
        valueDisplay.textContent = formatter(value);

        // Update configuration
        EYE_DETECTION_CONFIG[configKey] = value;

        console.log(`[SETTINGS] ${configKey} updated to ${value}`);
    });
}

// Update all sliders from current configuration
function updateSlidersFromConfig() {
    document.getElementById('upThreshold').value = EYE_DETECTION_CONFIG.UP_THRESHOLD;
    document.getElementById('upValue').textContent = EYE_DETECTION_CONFIG.UP_THRESHOLD.toFixed(2);

    document.getElementById('downThreshold').value = EYE_DETECTION_CONFIG.DOWN_THRESHOLD;
    document.getElementById('downValue').textContent = EYE_DETECTION_CONFIG.DOWN_THRESHOLD.toFixed(2);

    document.getElementById('leftThreshold').value = EYE_DETECTION_CONFIG.LEFT_THRESHOLD;
    document.getElementById('leftValue').textContent = EYE_DETECTION_CONFIG.LEFT_THRESHOLD.toFixed(2);

    document.getElementById('rightThreshold').value = EYE_DETECTION_CONFIG.RIGHT_THRESHOLD;
    document.getElementById('rightValue').textContent = EYE_DETECTION_CONFIG.RIGHT_THRESHOLD.toFixed(2);

    document.getElementById('holdDuration').value = EYE_DETECTION_CONFIG.HOLD_DURATION;
    document.getElementById('holdValue').textContent = Math.round(EYE_DETECTION_CONFIG.HOLD_DURATION);

    document.getElementById('stabilityFrames').value = EYE_DETECTION_CONFIG.STABILITY_FRAMES;
    document.getElementById('stabilityValue').textContent = Math.round(EYE_DETECTION_CONFIG.STABILITY_FRAMES);

    document.getElementById('smoothingFactor').value = EYE_DETECTION_CONFIG.SMOOTHING_FACTOR;
    document.getElementById('smoothingValue').textContent = EYE_DETECTION_CONFIG.SMOOTHING_FACTOR.toFixed(2);
}

// Reset all settings to defaults
function resetToDefaults() {
    EYE_DETECTION_CONFIG.UP_THRESHOLD = DEFAULT_CONFIG.UP_THRESHOLD;
    EYE_DETECTION_CONFIG.DOWN_THRESHOLD = DEFAULT_CONFIG.DOWN_THRESHOLD;
    EYE_DETECTION_CONFIG.LEFT_THRESHOLD = DEFAULT_CONFIG.LEFT_THRESHOLD;
    EYE_DETECTION_CONFIG.RIGHT_THRESHOLD = DEFAULT_CONFIG.RIGHT_THRESHOLD;
    EYE_DETECTION_CONFIG.HOLD_DURATION = DEFAULT_CONFIG.HOLD_DURATION;
    EYE_DETECTION_CONFIG.STABILITY_FRAMES = DEFAULT_CONFIG.STABILITY_FRAMES;
    EYE_DETECTION_CONFIG.SMOOTHING_FACTOR = DEFAULT_CONFIG.SMOOTHING_FACTOR;
    EYE_DETECTION_CONFIG.SOUND_ENABLED = DEFAULT_CONFIG.SOUND_ENABLED;

    updateSlidersFromConfig();

    // Reset sound toggle checkbox
    document.getElementById('soundToggle').checked = DEFAULT_CONFIG.SOUND_ENABLED;

    console.log('[SETTINGS] All settings reset to defaults');
    console.log('[SETTINGS] Current config:', EYE_DETECTION_CONFIG);
}

// =============================================================================
// EYE TRACKING DEBUG - Press 'O' to log current values
// =============================================================================

function logCurrentEyeTrackingValues() {
    console.log('\n========================================');
    console.log('EYE TRACKING CONFIGURATION VALUES');
    console.log('========================================');
    console.log('Up Threshold:', EYE_DETECTION_CONFIG.UP_THRESHOLD);
    console.log('Down Threshold:', EYE_DETECTION_CONFIG.DOWN_THRESHOLD);
    console.log('Left Threshold:', EYE_DETECTION_CONFIG.LEFT_THRESHOLD);
    console.log('Right Threshold:', EYE_DETECTION_CONFIG.RIGHT_THRESHOLD);
    console.log('Hold Duration (ms):', EYE_DETECTION_CONFIG.HOLD_DURATION);
    console.log('Stability Frames:', EYE_DETECTION_CONFIG.STABILITY_FRAMES);
    console.log('Smoothing Factor:', EYE_DETECTION_CONFIG.SMOOTHING_FACTOR);
    console.log('Debug Mode:', EYE_DETECTION_CONFIG.DEBUG_MODE);

    // Log current eye tracking state if available
    if (typeof eyeTracker !== 'undefined' && eyeTracker) {
        console.log('\n--- LIVE EYE TRACKING STATE ---');
        console.log('Smoothed Blend Shapes:', eyeTracker.smoothedBlendShapes);
        console.log('Current Direction:', currentDirection || 'none');
        console.log('Last Stable Direction:', lastStableDirection || 'none');
        console.log('Direction Stability Counter:', directionStabilityCounter || 0);
    }

    console.log('========================================\n');
}

// Keyboard listener for 'O' key
document.addEventListener('keydown', (event) => {
    if (event.key === 'o' || event.key === 'O') {
        logCurrentEyeTrackingValues();
    }
});

// Initialize settings panel when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSettingsPanel);
} else {
    initializeSettingsPanel();
}
