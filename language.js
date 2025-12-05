// =============================================================================
// LANGUAGE MANAGER
// =============================================================================

// Current language (default: Greek)
let currentLanguage = 'el';
let translations = translations_el;

const LANGUAGE_STORAGE_KEY = 'appLanguage';

// Load language preference from localStorage
function loadLanguagePreference() {
    try {
        const storedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (storedLang && (storedLang === 'el' || storedLang === 'en')) {
            currentLanguage = storedLang;
            translations = storedLang === 'el' ? translations_el : translations_en;
            console.log('[LANGUAGE] Loaded language preference:', storedLang);
            return storedLang;
        }
    } catch (error) {
        console.error('[LANGUAGE] Error loading language preference:', error);
    }
    console.log('[LANGUAGE] Using default language: el (Greek)');
    return 'el';
}

// Save language preference to localStorage
function saveLanguagePreference(lang) {
    try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
        console.log('[LANGUAGE] Saved language preference:', lang);
    } catch (error) {
        console.error('[LANGUAGE] Error saving language preference:', error);
    }
}

// Get translation by key path (e.g., 'settings.title' or 'menu.speak')
function t(keyPath) {
    const keys = keyPath.split('.');
    let value = translations;

    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            console.warn(`[LANGUAGE] Translation key not found: ${keyPath}`);
            return keyPath; // Return the key itself if translation not found
        }
    }

    return value;
}

// Update all translatable elements in the DOM
function updateUILanguage() {
    // Update elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = t(key);

        // Check if element has data-i18n-attr to update specific attribute
        const attrToUpdate = element.getAttribute('data-i18n-attr');
        if (attrToUpdate) {
            element.setAttribute(attrToUpdate, translation);
        } else {
            // Special handling for instructions div (has HTML formatting)
            if (key === 'instructions') {
                // Preserve the HTML structure for instructions
                const parts = translation.split('|').map(part => part.trim());
                element.innerHTML = parts.map(part => {
                    // Bold the direction words
                    return part.replace(/^(Κοιτάξτε \w+|Look \w+)/, '<strong>$1</strong>');
                }).join(' | ');
            } else {
                // Update text content by default
                element.textContent = translation;
            }
        }
    });

    // Update page title
    document.title = t('pageTitle');

    // Update mode indicator based on current mode
    updateModeIndicator();

    console.log('[LANGUAGE] UI updated to language:', currentLanguage);
}// Switch language
function switchLanguage(lang) {
    if (lang !== 'el' && lang !== 'en') {
        console.error('[LANGUAGE] Invalid language code:', lang);
        return;
    }

    if (lang === currentLanguage) {
        console.log('[LANGUAGE] Language already set to:', lang);
        return;
    }

    currentLanguage = lang;
    translations = lang === 'el' ? translations_el : translations_en;
    saveLanguagePreference(lang);

    // Update all UI elements
    updateUILanguage();

    // Update menu items (special menu needs translation)
    updateMenuTranslations();

    // Show notification
    const langName = lang === 'el' ? 'Ελληνικά' : 'English';
    showNotification(`${t('notifications.languageChanged')} ${langName}`, 3000);

    console.log('[LANGUAGE] Language switched to:', lang);
}

// Update menu item labels with translations
function updateMenuTranslations() {
    // Update special menu
    specialMenu[0].label = t('menu.speak');
    specialMenu[1].label = t('menu.deleteWord');
    specialMenu[2].label = t('menu.deleteAll');
    specialMenu[3].label = t('menu.undo');
    specialMenu[4].label = t('menu.newLine');
    specialMenu[5].label = t('menu.copy');
    specialMenu[6].label = t('menu.paste');
    specialMenu[7].label = t('menu.webSearch');
    specialMenu[8].label = t('menu.addCustom');
    specialMenu[9].label = t('menu.deleteCustom');
    specialMenu[10].label = t('menu.keyboardType');
    specialMenu[11].label = t('menu.return');

    // Update main menu
    const lastIndex = mainMenu.length - 1;
    const secondLastIndex = mainMenu.length - 2;
    if (mainMenu[secondLastIndex] && typeof mainMenu[secondLastIndex] === 'object') {
        mainMenu[secondLastIndex].label = t('menu.backspace');
    }
    if (mainMenu[lastIndex] && typeof mainMenu[lastIndex] === 'object') {
        mainMenu[lastIndex].label = t('menu.space');
    }

    // Re-render menu if we're in special mode
    if (isSpecialMode) {
        renderMenu();
    }
}

// Update mode indicator text
function updateModeIndicator() {
    const modeIndicator = document.getElementById('modeIndicator');
    if (!modeIndicator) return;

    if (isSearchMode) {
        modeIndicator.textContent = t('modes.searchResults');
    } else if (isSuggestionMode) {
        modeIndicator.textContent = t('modes.suggestions');
    } else if (isCustomManageMode) {
        modeIndicator.textContent = t('modes.customManage');
    } else if (isSpecialMode) {
        modeIndicator.textContent = t('modes.specialMenu');
    } else {
        modeIndicator.textContent = t('modes.letterSelection');
    }
}

// Initialize language system
function initializeLanguage() {
    // Load language preference
    const lang = loadLanguagePreference();

    // Set initial keyboard type based on language if not already set
    if (typeof loadKeyboardTypePreference === 'function') {
        const storedKeyboardType = localStorage.getItem('keyboardType');
        // Only auto-set keyboard type if user hasn't explicitly chosen one
        if (!storedKeyboardType && typeof setKeyboardType === 'function') {
            if (lang === 'el') {
                setKeyboardType('greek');
            } else if (lang === 'en') {
                setKeyboardType('english');
            }
        }
    }

    // Update UI with current language
    updateUILanguage();

    console.log('[LANGUAGE] Language system initialized with:', currentLanguage);
}

// Call this when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLanguage);
} else {
    initializeLanguage();
}
