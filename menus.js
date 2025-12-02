// =============================================================================
// MENU DEFINITIONS AND MANAGEMENT
// =============================================================================

// Lowercase Greek alphabet + common functions
const mainMenu = [
    'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ',
    'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω',
    { label: '⌫ Backspace', action: 'backspace' }, { label: '␣ Space', action: 'space' }
];

const specialMenu = [
    { label: '🔊 Speak', action: 'speak' },
    { label: '⌫ Delete Word', action: 'delete_word' },
    { label: '⌫⌫ Delete All', action: 'delete_all' },
    { label: '← Undo', action: 'undo' },
    { label: '↵ New Line', action: 'newline' },
    { label: '📋 Copy', action: 'copy' },
    { label: '📄 Paste', action: 'paste' },
    { label: '🔍 Google Search', action: 'google_search' },
    { label: '➕ Add to Custom', action: 'add_custom' },
    { label: '🗑️ Delete Custom', action: 'manage_custom' },
    { label: '⌂ Return', action: 'return' }
];

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
            label: 'No Custom Entries',
            action: 'return'
        });
    }

    entries.push({ label: '⌂ Return', action: 'return' });

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

    menu.push({ label: '✗ Cancel', action: 'return' });

    return menu;
}

function createSearchResultsMenu() {
    const menu = searchResults.map((result, index) => ({
        label: `${index + 1}. ${result.title.substring(0, 50)}${result.title.length > 50 ? '...' : ''}`,
        action: 'open_result',
        url: result.url
    }));

    menu.push({ label: '✗ Close Search', action: 'close_search' });
    menu.push({ label: '⌂ Return to Menu', action: 'return' });

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

function renderMenu() {
    const mid = Math.ceil(currentMenu.length / 2);
    const leftItems = currentMenu.slice(0, mid);
    const rightItems = currentMenu.slice(mid);

    leftColumn.innerHTML = '';
    rightColumn.innerHTML = '';

    leftItems.forEach(item => {
        const div = document.createElement('div');
        if (typeof item === 'object') {
            if (item.action === 'complete') {
                div.className = 'item suggestion-item';
            } else if (item.action === 'delete_custom_entry') {
                div.className = 'item custom-item';
            } else {
                div.className = 'item special-item';
            }
            div.textContent = item.label;
        } else {
            div.className = 'item';
            div.textContent = item;
        }
        leftColumn.appendChild(div);
    });

    rightItems.forEach(item => {
        const div = document.createElement('div');
        if (typeof item === 'object') {
            if (item.action === 'complete') {
                div.className = 'item suggestion-item';
            } else if (item.action === 'delete_custom_entry') {
                div.className = 'item custom-item';
            } else {
                div.className = 'item special-item';
            }
            div.textContent = item.label;
        } else {
            div.className = 'item';
            div.textContent = item;
        }
        rightColumn.appendChild(div);
    });

    // Update mode indicator
    if (isCustomManageMode) {
        modeIndicator.textContent = 'Delete Custom Entries';
        modeIndicator.className = 'mode-indicator custom';
    } else if (isSuggestionMode) {
        modeIndicator.textContent = 'Word Suggestions';
        modeIndicator.className = 'mode-indicator suggestions';
    } else if (isSpecialMode) {
        modeIndicator.textContent = 'Special Functions Menu';
        modeIndicator.className = 'mode-indicator special';
    } else {
        modeIndicator.textContent = 'Letter Selection Mode';
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
