// =============================================================================
// CUSTOM WORDS AND PHRASES STORAGE
// =============================================================================

// Load custom entries from localStorage
function loadCustomEntries() {
    try {
        const savedWords = localStorage.getItem('customWords');
        const savedPhrases = localStorage.getItem('customPhrases');

        if (savedWords) {
            customWords = JSON.parse(savedWords);
        }
        if (savedPhrases) {
            customPhrases = JSON.parse(savedPhrases);
        }
    } catch (e) {
        console.error('Error loading custom entries:', e);
    }
}

// Save custom entries to localStorage
function saveCustomEntries() {
    try {
        localStorage.setItem('customWords', JSON.stringify(customWords));
        localStorage.setItem('customPhrases', JSON.stringify(customPhrases));
    } catch (e) {
        console.error('Error saving custom entries:', e);
    }
}

// Add current text area content to custom database
function addCurrentToCustom() {
    const entry = textArea.value.trim();

    if (!entry) {
        return; // Nothing to add
    }

    const entryNoAccent = removeAccents(entry.toLowerCase());
    const firstLetter = entryNoAccent[0];

    // Determine if it's a phrase (contains space) or a word
    if (entry.includes(' ')) {
        // It's a phrase
        if (!customPhrases.includes(entry)) {
            customPhrases.push(entry);
            saveCustomEntries();
            // Show notification
            showNotification(t('notifications.customWordAdded'), 2000);
        }
    } else {
        // It's a word
        if (!customWords[firstLetter]) {
            customWords[firstLetter] = [];
        }
        if (!customWords[firstLetter].includes(entry)) {
            customWords[firstLetter].push(entry);
            saveCustomEntries();
            // Show notification
            showNotification(t('notifications.customWordAdded'), 2000);
        }
    }
}
