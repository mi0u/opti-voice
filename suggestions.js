// =============================================================================
// WORD SUGGESTIONS AND TEXT HELPERS
// =============================================================================

function removeAccents(str) {
    // Only remove accents for Greek characters
    const accentMap = {
        'ά': 'α', 'έ': 'ε', 'ή': 'η', 'ί': 'ι', 'ό': 'ο', 'ύ': 'υ', 'ώ': 'ω',
        'Ά': 'Α', 'Έ': 'Ε', 'Ή': 'Η', 'Ί': 'Ι', 'Ό': 'Ο', 'Ύ': 'Υ', 'Ώ': 'Ω',
        'ϊ': 'ι', 'ϋ': 'υ', 'ΐ': 'ι', 'ΰ': 'υ',
        'Ϊ': 'Ι', 'Ϋ': 'Υ'
    };
    return str.split('').map(char => accentMap[char] || char).join('');
}

function getCurrentWord() {
    const text = textArea.value;
    const words = text.split(/\s+/);
    return words[words.length - 1] || '';
}

// Find the longest ending portion of text that matches the beginning of suggestion
function findOverlap(text, suggestion) {
    const textNoAccent = removeAccents(text).toLowerCase();
    const suggestionNoAccent = removeAccents(suggestion).toLowerCase();

    // Check all ending portions of text (at least 2 chars)
    for (let i = Math.max(0, textNoAccent.length - 20); i < textNoAccent.length - 1; i++) {
        const textEnding = textNoAccent.substring(i).trim();
        if (textEnding.length >= 2 && suggestionNoAccent.startsWith(textEnding)) {
            // Return the actual text portion (with original case/accents)
            return text.substring(i).trim();
        }
    }
    return '';
}

function getSuggestions() {
    // Get the entire text to check all ending portions
    // Don't trim the text - we need to preserve trailing spaces to match phrases correctly
    const entireText = textArea.value;
    if (entireText.trim().length < 2) return [];

    const entireTextNoAccent = removeAccents(entireText).toLowerCase();

    // Check if text ends with a space (word just completed)
    const endsWithSpace = entireText.length > 0 && entireText[entireText.length - 1] === ' ';

    let wordSuggestions = [];
    let phraseSuggestions = [];

    // Check all ending portions of the text (with at least 2 characters)
    // Only check from positions that are either start of text or after a space (word boundary)
    for (let i = entireTextNoAccent.length - 1; i >= Math.max(0, entireTextNoAccent.length - 50); i--) {
        // Only consider positions at word boundaries (start of text or after space)
        if (i > 0 && entireTextNoAccent[i - 1] !== ' ') {
            continue;
        }

        const textEnding = entireTextNoAccent.substring(i);
        const textEndingTrimmed = textEnding.trim();

        if (textEndingTrimmed.length < 2) continue;

        const firstLetter = textEndingTrimmed[0];

        // Only suggest words if text doesn't end with space (still typing)
        if (!endsWithSpace) {
            // Get custom words matching this ending (including exact matches when typing)
            // For words, use trimmed version (ignore trailing spaces)
            if (customWords[firstLetter]) {
                const customSuggestions = customWords[firstLetter].filter(word => {
                    const wordNoAccent = removeAccents(word).toLowerCase();
                    return wordNoAccent.startsWith(textEndingTrimmed) && wordNoAccent.length >= textEndingTrimmed.length;
                });
                wordSuggestions = [...wordSuggestions, ...customSuggestions];
            }

            // Get words from default database matching this ending (including exact matches when typing)
            // For words, use trimmed version (ignore trailing spaces)
            if (wordDatabase[firstLetter]) {
                const defaultSuggestions = wordDatabase[firstLetter].filter(word => {
                    const wordNoAccent = removeAccents(word).toLowerCase();
                    return wordNoAccent.startsWith(textEndingTrimmed) && wordNoAccent.length >= textEndingTrimmed.length;
                });
                wordSuggestions = [...wordSuggestions, ...defaultSuggestions];
            }
        }

        // Get custom phrases matching this ending
        // For phrases, use the non-trimmed version (preserve trailing spaces)
        const customPhraseSuggestions = customPhrases.filter(phrase => {
            const phraseNoAccent = removeAccents(phrase).toLowerCase();
            return phraseNoAccent.startsWith(textEnding) && phraseNoAccent.length > textEnding.length;
        });
        phraseSuggestions = [...phraseSuggestions, ...customPhraseSuggestions];

        // Get default phrases matching this ending
        // For phrases, use the non-trimmed version (preserve trailing spaces)
        const defaultPhraseSuggestions = commonPhrases.filter(phrase => {
            const phraseNoAccent = removeAccents(phrase).toLowerCase();
            return phraseNoAccent.startsWith(textEnding) && phraseNoAccent.length > textEnding.length;
        });
        phraseSuggestions = [...phraseSuggestions, ...defaultPhraseSuggestions];
    }

    // Remove duplicates while preserving order (custom entries stay first)
    const seenWords = new Set();
    wordSuggestions = wordSuggestions.filter(word => {
        const normalized = removeAccents(word).toLowerCase();
        if (seenWords.has(normalized)) {
            return false;
        }
        seenWords.add(normalized);
        return true;
    });

    const seenPhrases = new Set();
    phraseSuggestions = phraseSuggestions.filter(phrase => {
        const normalized = removeAccents(phrase).toLowerCase();
        if (seenPhrases.has(normalized)) {
            return false;
        }
        seenPhrases.add(normalized);
        return true;
    });

    // Prioritize words over phrases: fill up to 6 with words first, then add phrases
    let suggestions = wordSuggestions.slice(0, 6);
    if (suggestions.length < 6 && phraseSuggestions.length > 0) {
        const remainingSlots = 6 - suggestions.length;
        suggestions = [...suggestions, ...phraseSuggestions.slice(0, remainingSlots)];
    }

    return suggestions;
}

function getPhraseSuggestions() {
    // Get the entire text to check all ending portions
    const entireText = textArea.value.trim();
    if (entireText.length < 2) return [];

    const entireTextNoAccent = removeAccents(entireText).toLowerCase();

    let phraseSuggestions = [];

    // Check all ending portions of the text (with at least 2 characters)
    // Only check from positions that are either start of text or after a space (word boundary)
    for (let i = entireTextNoAccent.length - 1; i >= Math.max(0, entireTextNoAccent.length - 50); i--) {
        // Only consider positions at word boundaries (start of text or after space)
        if (i > 0 && entireTextNoAccent[i - 1] !== ' ') {
            continue;
        }

        const textEnding = entireTextNoAccent.substring(i).trim();

        if (textEnding.length < 2) continue;

        // Get custom phrases matching this ending
        const customPhraseSuggestions = customPhrases.filter(phrase => {
            const phraseNoAccent = removeAccents(phrase).toLowerCase();
            return phraseNoAccent.startsWith(textEnding) && phraseNoAccent.length > textEnding.length;
        });
        phraseSuggestions = [...phraseSuggestions, ...customPhraseSuggestions];

        // Get default phrases matching this ending
        const defaultPhraseSuggestions = commonPhrases.filter(phrase => {
            const phraseNoAccent = removeAccents(phrase).toLowerCase();
            return phraseNoAccent.startsWith(textEnding) && phraseNoAccent.length > textEnding.length;
        });
        phraseSuggestions = [...phraseSuggestions, ...defaultPhraseSuggestions];
    }

    // Remove duplicates while preserving order (custom entries stay first)
    const seenPhrases = new Set();
    phraseSuggestions = phraseSuggestions.filter(phrase => {
        const normalized = removeAccents(phrase).toLowerCase();
        if (seenPhrases.has(normalized)) {
            return false;
        }
        seenPhrases.add(normalized);
        return true;
    });

    return phraseSuggestions.slice(0, 6);
}

function checkForPhraseSuggestions() {
    const entireText = textArea.value.trim();
    if (entireText.length >= 2) {
        const phrases = getPhraseSuggestions();
        if (phrases.length > 0) {
            const menu = phrases.map(phrase => ({
                label: `→ ${phrase}`,
                action: 'complete',
                completion: phrase
            }));
            menu.push({ label: '✗ Cancel', action: 'return' });

            // Auto-switch to suggestions mode
            isSuggestionMode = true;
            currentMenu = menu;
            menuStack = [];
            renderMenu();
            return true;
        }
    }
    return false;
}

function checkForSuggestions() {
    const entireText = textArea.value;
    console.log('checkForSuggestions - entireText:', JSON.stringify(entireText));
    console.log('checkForSuggestions - customPhrases:', customPhrases);
    if (entireText.trim().length >= 2) {
        const suggestions = getSuggestions();
        console.log('checkForSuggestions - suggestions:', suggestions);
        console.log('checkForSuggestions - suggestions.length:', suggestions.length);
        const suggestionsMenu = createSuggestionsMenu();
        console.log('checkForSuggestions - suggestionsMenu:', suggestionsMenu);
        console.log('checkForSuggestions - condition check:', suggestionsMenu && suggestionsMenu.length > 1);
        if (suggestionsMenu && suggestionsMenu.length > 1) {
            console.log('checkForSuggestions - SHOWING SUGGESTIONS!');
            // Auto-switch to suggestions mode
            isSuggestionMode = true;
            currentMenu = suggestionsMenu;
            menuStack = [];
            renderMenu();
            return true;
        }
    }
    console.log('checkForSuggestions - returning false');
    return false;
}
