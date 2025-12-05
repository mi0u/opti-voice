// =============================================================================
// USER ACTIONS AND TEXT MANIPULATION
// =============================================================================

function selectColumn(direction) {
    const mid = Math.ceil(currentMenu.length / 2);
    const selectedItems = direction === 'left'
        ? currentMenu.slice(0, mid)
        : currentMenu.slice(mid);

    if (selectedItems.length === 1) {
        // Single item - execute action
        const item = selectedItems[0];
        if (typeof item === 'object') {
            executeAction(item.action, item.completion, item);
        } else {
            // Letter selection
            undoStack.push(textArea.value);
            if (undoStack.length > 10) undoStack.shift();
            textArea.value += item;

            // Check for suggestions after adding letter
            if (!checkForSuggestions()) {
                // Reset to main menu if no suggestions
                isSuggestionMode = false;
                currentMenu = [...mainMenu];
                menuStack = [];
                renderMenu();
            }
            return;
        }

        // Don't reset menu for search-related actions - they handle their own menu updates
        if (item.action === 'next_page' ||
            item.action === 'previous_page' ||
            item.action === 'open_result') {
            return;
        }

        // Don't reset if in suggestion mode
        if (isSuggestionMode) {
            return;
        }

        // Reset to appropriate menu based on current mode
        if (isSpecialMode) {
            currentMenu = [...specialMenu];
        } else if (isCustomManageMode) {
            currentMenu = createManageCustomMenu();
        } else if (isSearchMode) {
            // Stay in search mode after actions like close
            return;
        } else {
            currentMenu = [...mainMenu];
        }
        menuStack = [];
        renderMenu();
    } else {
        // Continue splitting
        menuStack.push([...currentMenu]);
        currentMenu = selectedItems;
        renderMenu(direction);
    }
}

function executeAction(action, data, itemData) {
    switch(action) {
        case 'space':
            undoStack.push(textArea.value);
            if (undoStack.length > 10) undoStack.shift();
            // Convert final σ to ς
            if (textArea.value.endsWith('σ')) {
                textArea.value = textArea.value.slice(0, -1) + 'ς';
            }
            textArea.value += ' ';
            if (!checkForSuggestions()) {
                isSuggestionMode = false;
            }
            break;
        case 'backspace':
            undoStack.push(textArea.value);
            if (undoStack.length > 10) undoStack.shift();
            textArea.value = textArea.value.slice(0, -1);
            if (!checkForSuggestions()) {
                isSuggestionMode = false;
            }
            break;
        case 'newline':
            undoStack.push(textArea.value);
            if (undoStack.length > 10) undoStack.shift();
            textArea.value += '\n';
            if (!checkForSuggestions()) {
                isSuggestionMode = false;
            }
            break;
        case 'delete_word':
            undoStack.push(textArea.value);
            if (undoStack.length > 10) undoStack.shift();
            textArea.value = textArea.value.replace(/\S+\s*$/, '');
            if (!checkForSuggestions()) {
                isSuggestionMode = false;
            }
            break;
        case 'delete_all':
            undoStack.push(textArea.value);
            if (undoStack.length > 10) undoStack.shift();
            textArea.value = '';
            isSuggestionMode = false;
            break;
        case 'undo':
            if (undoStack.length > 0) {
                textArea.value = undoStack.pop();
            }
            if (!checkForSuggestions()) {
                isSuggestionMode = false;
            }
            break;
        case 'complete':
            undoStack.push(textArea.value);
            if (undoStack.length > 10) undoStack.shift();

            // Check if the completed item is a single word (no spaces) or a phrase
            const isWord = !data.includes(' ');

            // Find if there's an overlapping portion
            const overlap = findOverlap(textArea.value, data);

            if (overlap) {
                // Remove the overlapping portion from the end of text
                const overlapStart = textArea.value.lastIndexOf(overlap);
                if (overlapStart !== -1) {
                    textArea.value = textArea.value.substring(0, overlapStart);
                }
            } else {
                // No overlap - replace current word as before
                const text = textArea.value;
                const words = text.split(/(\s+)/);
                words[words.length - 1] = '';
                textArea.value = words.join('');
            }

            // Add the suggestion
            textArea.value += data;

            // Convert final σ to ς before adding space
            if (textArea.value.endsWith('σ')) {
                textArea.value = textArea.value.slice(0, -1) + 'ς';
            }
            textArea.value += ' ';

            // Check for suggestions (words or phrases based on current text)
            if (!checkForSuggestions()) {
                isSuggestionMode = false;
            }
            break;
        case 'copy':
            if (textArea.value) {
                navigator.clipboard.writeText(textArea.value)
                    .then(() => {
                        console.log('Text copied to clipboard');
                    })
                    .catch(err => {
                        console.error('Failed to copy text:', err);
                    });
            }
            break;
        case 'paste':
            navigator.clipboard.readText()
                .then(clipboardText => {
                    if (clipboardText) {
                        undoStack.push(textArea.value);
                        if (undoStack.length > 10) undoStack.shift();
                        textArea.value += clipboardText;
                        if (!checkForSuggestions()) {
                            isSuggestionMode = false;
                        }
                    }
                })
                .catch(err => {
                    console.error('Failed to read clipboard:', err);
                });
            break;
        case 'speak':
            if (textArea.value && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();

                const utterance = new SpeechSynthesisUtterance(textArea.value);

                // Wait for voices to load and select best Greek voice
                const loadVoices = () => {
                    const voices = window.speechSynthesis.getVoices();
                    const greekVoices = voices.filter(v => v.lang.startsWith('el'));

                    // Prefer neural/premium voices (Google, Microsoft Neural)
                    const preferredVoice = greekVoices.find(v =>
                        v.name.includes('Neural') ||
                        v.name.includes('Premium') ||
                        v.name.includes('Google')
                    ) || greekVoices[0];

                    if (preferredVoice) utterance.voice = preferredVoice;
                    utterance.lang = 'el-GR';
                    utterance.rate = 0.8;
                    utterance.pitch = 1;
                    utterance.volume = 1;

                    window.speechSynthesis.speak(utterance);
                };

                if (window.speechSynthesis.getVoices().length) {
                    loadVoices();
                } else {
                    window.speechSynthesis.onvoiceschanged = loadVoices;
                }
            }
            break;
        case 'add_custom':
            addCurrentToCustom();
            break;
        case 'manage_custom':
            isCustomManageMode = true;
            isSpecialMode = false;
            isSuggestionMode = false;
            currentMenu = createManageCustomMenu();
            menuStack = [];
            renderMenu();
            break;
        case 'delete_custom_entry':
            if (itemData.type === 'word') {
                customWords[itemData.letter] = customWords[itemData.letter].filter(w => w !== itemData.entry);
                if (customWords[itemData.letter].length === 0) {
                    delete customWords[itemData.letter];
                }
            } else {
                customPhrases = customPhrases.filter(p => p !== itemData.entry);
            }
            saveCustomEntries();
            // Refresh the menu
            currentMenu = createManageCustomMenu();
            menuStack = [];
            renderMenu();
            break;
        case 'return':
            isSpecialMode = false;
            isSuggestionMode = false;
            isCustomManageMode = false;
            isSearchMode = false;
            currentMenu = [...mainMenu];
            menuStack = [];
            renderMenu();
            break;
        case 'google_search':
            performDuckDuckGoSearch();
            break;
        case 'open_result':
            openSearchResult(itemData.url);
            break;
        case 'close_search':
            closeSearch();
            currentMenu = [...mainMenu];
            menuStack = [];
            renderMenu();
            break;
        case 'next_page':
            nextSearchPage();
            break;
        case 'previous_page':
            previousSearchPage();
            break;
    }
}
