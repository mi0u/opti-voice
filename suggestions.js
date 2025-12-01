// =============================================================================
// WORD SUGGESTIONS AND TEXT HELPERS
// =============================================================================

function removeAccents(str) {
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

function getSuggestions() {
    const currentWord = getCurrentWord();
    if (currentWord.length === 0) return [];

    const currentWordNoAccent = removeAccents(currentWord);
    const firstLetter = currentWordNoAccent[0];
    let suggestions = [];

    // Get word suggestions from default database
    if (wordDatabase[firstLetter]) {
        suggestions = wordDatabase[firstLetter].filter(word =>
            removeAccents(word).startsWith(currentWordNoAccent)
        );
    }

    // Add custom words
    if (customWords[firstLetter]) {
        const customSuggestions = customWords[firstLetter].filter(word =>
            removeAccents(word).startsWith(currentWordNoAccent)
        );
        suggestions = [...suggestions, ...customSuggestions];
    }

    // Add phrase suggestions if we have 2+ letters
    if (currentWord.length >= 2) {
        const phraseSuggestions = commonPhrases.filter(phrase =>
            removeAccents(phrase).startsWith(currentWordNoAccent)
        );
        const customPhraseSuggestions = customPhrases.filter(phrase =>
            removeAccents(phrase).startsWith(currentWordNoAccent)
        );
        suggestions = [...suggestions, ...phraseSuggestions, ...customPhraseSuggestions];
    }

    // Remove duplicates and sort
    suggestions = [...new Set(suggestions)].sort();

    return suggestions.slice(0, 6); // Limit to 6 suggestions
}

function checkForSuggestions() {
    const currentWord = getCurrentWord();
    if (currentWord.length >= 2) {
        const suggestionsMenu = createSuggestionsMenu();
        if (suggestionsMenu && suggestionsMenu.length > 1) {
            // Auto-switch to suggestions mode
            isSuggestionMode = true;
            currentMenu = suggestionsMenu;
            menuStack = [];
            renderMenu();
            return true;
        }
    }
    return false;
}
