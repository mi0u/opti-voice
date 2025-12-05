// =============================================================================
// MENU DEFINITIONS AND MANAGEMENT
// =============================================================================

// Lowercase Greek alphabet + common functions
const greekMenu = [
    'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ',
    'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω',
    { label: '⌫ Backspace', action: 'backspace' }, { label: '␣ Space', action: 'space' }
];

// Lowercase English alphabet + common functions
const englishMenu = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    { label: '⌫ Backspace', action: 'backspace' }, { label: '␣ Space', action: 'space' }
];

// Numerical keyboard + common functions
const numericalMenu = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    '+', '-', '*', '/', '=', '.', ',',
    { label: '⌫ Backspace', action: 'backspace' }, { label: '␣ Space', action: 'space' }
];

// Main menu reference - starts with Greek
let mainMenu = [...greekMenu];

// Keyboard type state
let currentKeyboardType = 'greek'; // 'greek', 'english', or 'numerical'

const specialMenu = [
    { label: '🔊 Speak', action: 'speak' },
    { label: '⌫ Delete Word', action: 'delete_word' },
    { label: '⌫⌫ Delete All', action: 'delete_all' },
    { label: '← Undo', action: 'undo' },
    { label: '↵ New Line', action: 'newline' },
    { label: '📋 Copy', action: 'copy' },
    { label: '📄 Paste', action: 'paste' },
    { label: '🔍 Web Search', action: 'google_search' },
    { label: '➕ Add to Custom', action: 'add_custom' },
    { label: '🗑️ Delete Custom', action: 'manage_custom' },
    { label: '⌨️ Keyboard Type', action: 'keyboard_type' },
    { label: '⌂ Return', action: 'return' }
];

// Keyboard type selection menu
function createKeyboardTypeMenu() {
    const menu = [
        { label: '🏛️ Greek', action: 'set_keyboard', keyboardType: 'greek' },
        { label: '🗽 English', action: 'set_keyboard', keyboardType: 'english' },
        { label: '🔢 Numerical', action: 'set_keyboard', keyboardType: 'numerical' },
        { label: '⌂ Return', action: 'return' }
    ];

    // Update labels with translations if available
    if (typeof t === 'function') {
        menu[0].label = t('menu.keyboardGreek');
        menu[1].label = t('menu.keyboardEnglish');
        menu[2].label = t('menu.keyboardNumerical');
        menu[3].label = t('menu.return');
    }

    return menu;
}

// Create menu for managing (deleting) custom entries
function createManageCustomMenu() {
    let entries = [];

    // Collect all custom words
    Object.keys(customWords).sort().forEach(letter => {
        if (customWords[letter] && customWords[letter].length > 0) {
            customWords[letter].forEach(word => {
                entries.push({
                    label: `🗑️ ${word}`,
                    action: 'delete_custom_entry',
                    type: 'word',
                    letter: letter,
                    entry: word
                });
            });
        }
    });

    // Add custom phrases
    customPhrases.forEach(phrase => {
        entries.push({
            label: `🗑️ ${phrase}`,
            action: 'delete_custom_entry',
            type: 'phrase',
            entry: phrase
        });
    });

    if (entries.length === 0) {
        entries.push({
            label: t('menu.noCustomEntries'),
            action: 'return'
        });
    }

    entries.push({ label: t('menu.return'), action: 'return' });

    return entries;
}

function createSuggestionsMenu() {
    const suggestions = getSuggestions();
    const currentWord = getCurrentWord();

    if (suggestions.length === 0) {
        return null;
    }

    const menu = suggestions.map(suggestion => ({
        label: `→ ${suggestion}`,
        action: 'complete',
        completion: suggestion
    }));

    menu.push({ label: t('menu.cancel'), action: 'return' });

    return menu;
}

function createSearchResultsMenu() {
    const menu = [];

    // Add search results (up to 10)
    searchResults.forEach((result, index) => {
        const globalIndex = currentSearchPage * 10 + index + 1;
        // Shorter title for rich display
        const displayTitle = result.title.length > 50
            ? result.title.substring(0, 50) + '...'
            : result.title;

        menu.push({
            label: `${globalIndex}. ${displayTitle}`,
            action: 'open_result',
            url: result.url,
            fullTitle: result.title,
            snippet: result.snippet,
            image: result.image
        });
    });

    // Add navigation options
    const hasMore = true; // Always show Next to allow fetching more results
    const hasPrevious = currentSearchPage > 0;

    if (hasPrevious) {
        menu.push({ label: t('menu.previousPage'), action: 'previous_page' });
    }
    if (hasMore) {
        menu.push({ label: t('menu.nextPage'), action: 'next_page' });
    }

    menu.push({ label: t('menu.return'), action: 'return' });

    return menu;
}

function createFallbackSearchMenu() {
    return [
        { label: '🔄 Reload Search', action: 'reload_search' },
        { label: '✗ Close Search', action: 'close_search' },
        { label: '↩️ Reopen Last Search', action: 'reopen_search' },
        { label: '⌂ Return to Menu', action: 'return' }
    ];
}

function renderMenu(animationDirection = null) {
    const mid = Math.ceil(currentMenu.length / 2);
    const leftItems = currentMenu.slice(0, mid);
    const rightItems = currentMenu.slice(mid);

    // If animation is requested, first animate the current items
    if (animationDirection) {
        animateMenuTransition(leftItems, rightItems, animationDirection);
        return;
    }

    // No animation - direct render
    renderMenuDirect(leftItems, rightItems);
}

function animateMenuTransition(newLeftItems, newRightItems, direction) {
    // Get current items before clearing
    const currentLeftItems = Array.from(leftColumn.children);
    const currentRightItems = Array.from(rightColumn.children);

    // Enable overflow on columns during animation
    leftColumn.classList.add('animating');
    rightColumn.classList.add('animating');

    // Set animation duration based on hold duration setting
    const animationDuration = `${EYE_DETECTION_CONFIG.HOLD_DURATION}ms`;
    document.documentElement.style.setProperty('--animation-duration', animationDuration);

    if (direction === 'left') {
        // User selected left column
        // Items from second half of left column need to slide right
        const mid = Math.ceil(currentLeftItems.length / 2);
        const itemsMovingRight = currentLeftItems.slice(mid);

        // Calculate vertical offset for each item to its destination
        itemsMovingRight.forEach((item, index) => {
            const currentRect = item.getBoundingClientRect();
            // Target position is in right column at index position
            const targetIndex = index;
            const targetItem = currentLeftItems[targetIndex];
            const targetRect = targetItem.getBoundingClientRect();
            const verticalOffset = targetRect.top - currentRect.top;

            // Set custom property for vertical movement
            item.style.setProperty('--vertical-offset', `${verticalOffset}px`);
            item.classList.add('slide-to-right');
        });

        // Fade out all right column items
        currentRightItems.forEach(item => {
            item.classList.add('fade-out');
        });

    } else if (direction === 'right') {
        // User selected right column
        // Items from first half of right column need to slide left
        const mid = Math.ceil(currentRightItems.length / 2);
        const itemsMovingLeft = currentRightItems.slice(0, mid);

        // Calculate vertical offset for each item to its destination
        itemsMovingLeft.forEach((item, index) => {
            const currentRect = item.getBoundingClientRect();
            // Target position is in left column at index position
            const targetIndex = index;
            const targetItem = currentRightItems[targetIndex];
            const targetRect = targetItem.getBoundingClientRect();
            const verticalOffset = targetRect.top - currentRect.top;

            // Set custom property for vertical movement
            item.style.setProperty('--vertical-offset', `${verticalOffset}px`);
            item.classList.add('slide-to-left');
        });

        // Fade out all left column items
        currentLeftItems.forEach(item => {
            item.classList.add('fade-out');
        });
    }

    // After animation completes, render the new menu
    setTimeout(() => {
        // Remove animating class from columns
        leftColumn.classList.remove('animating');
        rightColumn.classList.remove('animating');
        renderMenuDirect(newLeftItems, newRightItems, false);
    }, EYE_DETECTION_CONFIG.HOLD_DURATION);
}

function renderMenuDirect(leftItems, rightItems, fadeIn = false) {
    leftColumn.innerHTML = '';
    rightColumn.innerHTML = '';

    leftItems.forEach((item, index) => {
        const div = createMenuItem(item);
        if (fadeIn) {
            div.classList.add('fade-in');
        }
        leftColumn.appendChild(div);
    });

    rightItems.forEach((item, index) => {
        const div = createMenuItem(item);
        if (fadeIn) {
            div.classList.add('fade-in');
        }
        rightColumn.appendChild(div);
    });

    // Clean up animation classes after fade-in completes
    if (fadeIn) {
        setTimeout(() => {
            document.querySelectorAll('.item').forEach(item => {
                item.classList.remove('fade-in');
            });
        }, 300);
    }

    // Update mode indicator
    updateModeIndicator();
}

function createMenuItem(item) {
    const div = document.createElement('div');
    if (typeof item === 'object') {
        if (item.action === 'complete') {
            div.className = 'item suggestion-item';
            div.textContent = item.label;
        } else if (item.action === 'delete_custom_entry') {
            div.className = 'item custom-item';
            div.textContent = item.label;
        } else if (item.action === 'open_result') {
            div.className = 'item search-result-item';
            // Create rich search result
            if (item.image) {
                const img = document.createElement('img');
                img.src = item.image;
                img.className = 'search-result-image';
                img.onerror = () => img.style.display = 'none';
                div.appendChild(img);
            }
            const content = document.createElement('div');
            content.className = 'search-result-content';
            const title = document.createElement('div');
            title.className = 'search-result-title';
            title.textContent = item.label;
            content.appendChild(title);
            if (item.snippet) {
                const snippet = document.createElement('div');
                snippet.className = 'search-result-snippet';
                snippet.textContent = item.snippet.substring(0, 80) + (item.snippet.length > 80 ? '...' : '');
                content.appendChild(snippet);
            }
            div.appendChild(content);
        } else {
            div.className = 'item special-item';
            div.textContent = item.label;
        }
    } else {
        div.className = 'item';
        div.textContent = item;
    }
    return div;
}

function updateModeIndicator() {
    const modeIndicator = document.getElementById('modeIndicator');
    if (!modeIndicator) return;

    if (isSearchMode) {
        modeIndicator.textContent = t('modes.searchResults');
        modeIndicator.className = 'mode-indicator search';
    } else if (isCustomManageMode) {
        modeIndicator.textContent = t('modes.customManage');
        modeIndicator.className = 'mode-indicator custom';
    } else if (isSuggestionMode) {
        modeIndicator.textContent = t('modes.suggestions');
        modeIndicator.className = 'mode-indicator suggestions';
    } else if (isSpecialMode) {
        modeIndicator.textContent = t('modes.specialMenu');
        modeIndicator.className = 'mode-indicator special';
    } else {
        modeIndicator.textContent = t('modes.letterSelection');
        modeIndicator.className = 'mode-indicator';
    }
}

function toggleSpecialMenu() {
    isSpecialMode = !isSpecialMode;
    isSuggestionMode = false;
    isCustomManageMode = false;
    isSearchMode = false;
    if (isSpecialMode) {
        currentMenu = [...specialMenu];
    } else {
        currentMenu = [...mainMenu];
    }
    menuStack = [];
    renderMenu();
}

function goBackInMenu() {
    // Go back one level in the menu navigation
    if (menuStack.length > 0) {
        currentMenu = menuStack.pop();
        renderMenu();
        return true; // Successfully went back
    }
    return false; // Already at initial state
}

// Set keyboard type and update main menu
function setKeyboardType(type) {
    if (type !== 'greek' && type !== 'english' && type !== 'numerical') {
        console.error('[KEYBOARD] Invalid keyboard type:', type);
        return;
    }

    currentKeyboardType = type;

    // Update mainMenu based on keyboard type
    if (type === 'greek') {
        mainMenu = [...greekMenu];
    } else if (type === 'english') {
        mainMenu = [...englishMenu];
    } else if (type === 'numerical') {
        mainMenu = [...numericalMenu];
    }

    // Switch word and phrase databases
    if (typeof switchWordDatabase === 'function') {
        switchWordDatabase(type);
    }
    if (typeof switchPhraseDatabase === 'function') {
        switchPhraseDatabase(type);
    }

    // Save preference
    saveKeyboardTypePreference(type);

    console.log('[KEYBOARD] Keyboard type changed to:', type);
}

// Save keyboard type preference to localStorage
function saveKeyboardTypePreference(type) {
    try {
        localStorage.setItem('keyboardType', type);
        console.log('[KEYBOARD] Saved keyboard type preference:', type);
    } catch (error) {
        console.error('[KEYBOARD] Error saving keyboard type preference:', error);
    }
}

// Load keyboard type preference from localStorage
function loadKeyboardTypePreference() {
    try {
        const stored = localStorage.getItem('keyboardType');
        if (stored && (stored === 'greek' || stored === 'english' || stored === 'numerical')) {
            setKeyboardType(stored);
            console.log('[KEYBOARD] Loaded keyboard type preference:', stored);
            return stored;
        }
    } catch (error) {
        console.error('[KEYBOARD] Error loading keyboard type preference:', error);
    }
    console.log('[KEYBOARD] Using default keyboard type: greek');
    return 'greek';
}

