// =============================================================================
// MAIN APPLICATION STATE AND INITIALIZATION
// =============================================================================

// Application state
let currentMenu = [...mainMenu];
let isSpecialMode = false;
let isSuggestionMode = false;
let isCustomManageMode = false;
let menuStack = [];
let undoStack = [];
let customWords = {};
let customPhrases = [];
let searchWindow = null;
let searchResults = [];
let isSearchMode = false;
let lastSearchUrl = '';

// Eye tracking state
let eyeTracker = null;
let isEyeTrackingActive = false;
let currentDirection = null;
let directionHoldTimer = null;
let directionStabilityCounter = 0;
let lastStableDirection = null;

// DOM elements
const leftColumn = document.getElementById('leftColumn');
const rightColumn = document.getElementById('rightColumn');
const textArea = document.getElementById('textArea');
const modeIndicator = document.getElementById('modeIndicator');
const gazeIndicator = document.getElementById('gazeIndicator');
const videoPreview = document.getElementById('videoPreview');

// Keyboard event handler (fallback)
document.addEventListener('keydown', (e) => {
    if (isEyeTrackingActive) return;

    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        selectColumn('left');
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        selectColumn('right');
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        toggleSpecialMenu();
    }
});

// Initialize application
loadCustomEntries();
renderMenu();

// Start eye tracking when page loads
window.addEventListener('load', () => {
    setTimeout(() => {
        initializeEyeTracking();
    }, 500);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (eyeTracker) {
        eyeTracker.stop();
    }
});
