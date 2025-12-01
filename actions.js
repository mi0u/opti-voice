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
            // Save state for undo
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

        // Reset to appropriate menu
        if (isSpecialMode) {
            currentMenu = [...specialMenu];
        } else if (isCustomManageMode) {
            currentMenu = createManageCustomMenu();
        } else {
            currentMenu = [...mainMenu];
        }
        menuStack = [];
        renderMenu();
    } else {
        // Continue splitting
        menuStack.push([...currentMenu]);
        currentMenu = selectedItems;
        renderMenu();
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
            isSuggestionMode = false;
            break;
        case 'backspace':
            undoStack.push(textArea.value);
            if (undoStack.length > 10) undoStack.shift();
            textArea.value = textArea.value.slice(0, -1);
            isSuggestionMode = false;
            break;
        case 'newline':
            undoStack.push(textArea.value);
            if (undoStack.length > 10) undoStack.shift();
            textArea.value += '\n';
            isSuggestionMode = false;
            break;
        case 'delete_word':
            undoStack.push(textArea.value);
            if (undoStack.length > 10) undoStack.shift();
            textArea.value = textArea.value.replace(/\S+\s*$/, '');
            isSuggestionMode = false;
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
            isSuggestionMode = false;
            break;
        case 'complete':
            undoStack.push(textArea.value);
            if (undoStack.length > 10) undoStack.shift();
            // Replace current word with suggestion
            const text = textArea.value;
            const words = text.split(/(\s+)/);
            words[words.length - 1] = data;
            textArea.value = words.join('');
            // Convert final σ to ς before adding space
            if (textArea.value.endsWith('σ')) {
                textArea.value = textArea.value.slice(0, -1) + 'ς';
            }
            textArea.value += ' ';
            isSuggestionMode = false;
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
                    }
                })
                .catch(err => {
                    console.error('Failed to read clipboard:', err);
                });
            break;
        case 'speak':
            if (textArea.value && 'speechSynthesis' in window) {
                // Cancel any ongoing speech
                window.speechSynthesis.cancel();

                const utterance = new SpeechSynthesisUtterance(textArea.value);
                utterance.lang = 'el-GR'; // Greek language
                utterance.rate = 0.9; // Slightly slower for clarity
                utterance.pitch = 1;
                utterance.volume = 1;

                window.speechSynthesis.speak(utterance);
            } else {
                console.error('Text-to-speech not supported');
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
            currentMenu = [...mainMenu];
            menuStack = [];
            renderMenu();
            break;
        case 'google_search':
            openGoogleSearch();
            break;
        case 'open_result':
            openSearchResult(itemData.url);
            break;
        case 'close_search':
            closeSearchWindow();
            currentMenu = [...mainMenu];
            menuStack = [];
            renderMenu();
            break;
        case 'reload_search':
            if (lastSearchUrl && searchWindow && !searchWindow.closed) {
                searchWindow.location.href = lastSearchUrl;
            }
            break;
        case 'reopen_search':
            if (lastSearchUrl) {
                const width = 1000;
                const height = 800;
                const left = (screen.width - width) / 2;
                const top = (screen.height - height) / 2;

                searchWindow = window.open(
                    lastSearchUrl,
                    'GoogleSearchWindow',
                    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
                );

                isSearchMode = true;
                currentMenu = createFallbackSearchMenu();
                menuStack = [];
                renderMenu();
            }
            break;
    }
}
