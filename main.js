// =============================================================================
// MAIN APPLICATION STATE AND INITIALIZATION
// =============================================================================

// Notification system for non-blocking messages (globally accessible)
window.showNotification = function(message, duration = 5000) {
    let notification = document.getElementById('autoNotification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'autoNotification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px 40px;
            border-radius: 10px;
            font-size: 18px;
            z-index: 10000;
            max-width: 80%;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(notification);
    }

    notification.textContent = message;
    notification.style.opacity = '1';
    notification.style.display = 'block';

    // Auto-dismiss after duration
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 300);
    }, duration);
};

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
let allSearchResults = [];
let currentSearchPage = 0;
let isSearchMode = false;
let lastSearchUrl = '';

// Eye tracking state
let eyeTracker = null;
let isEyeTrackingActive = false;
let currentDirection = null;
let directionHoldTimer = null;
let directionStabilityCounter = 0;
let lastStableDirection = null;

// Make eyeTracker globally available for settings panel
window.eyeTracker = eyeTracker;

// DOM elements
const leftColumn = document.getElementById('leftColumn');
const rightColumn = document.getElementById('rightColumn');
const textArea = document.getElementById('textArea');
const modeIndicator = document.getElementById('modeIndicator');
const gazeIndicator = document.getElementById('gazeIndicator');
const videoPreview = document.getElementById('videoPreview');

// Keyboard event handler (fallback)
document.addEventListener('keydown', (e) => {
    //if (isEyeTrackingActive) return;

    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        // If viewing a search result, scroll page up
        if (window.isViewingResult) {
            scrollResultPage('left');
        } else {
            selectColumn('left');
        }
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        // If viewing a search result, scroll page down
        if (window.isViewingResult) {
            scrollResultPage('right');
        } else {
            selectColumn('right');
        }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        // If viewing a search result, return to results
        if (window.isViewingResult) {
            closeResultViewer();
        } else {
            toggleSpecialMenu();
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        // Down does nothing when viewing results
        if (!window.isViewingResult) {
            // Check if menu is in initial state or has navigation history
            if (menuStack.length > 0) {
                // Menu has history - go back one level
                goBackInMenu();
            } else {
                // Menu is at initial state - trigger text-to-speech
                executeAction('speak', null, null);
            }
        }
    }
});

// Initialize application
loadCustomEntries();

// Load keyboard type preference (must be done before renderMenu)
if (typeof loadKeyboardTypePreference === 'function') {
    loadKeyboardTypePreference();
}

renderMenu();

// Start eye tracking when page loads
window.addEventListener('load', () => {
    setTimeout(() => {
        initializeEyeTrackingWithCalibration();
    }, 500);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (eyeTracker) {
        eyeTracker.stop();
    }
});
