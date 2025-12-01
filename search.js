// =============================================================================
// GOOGLE SEARCH INTEGRATION
// =============================================================================

function extractSearchResults(doc) {
    const results = [];
    const searchItems = doc.querySelectorAll('div.g, div[data-hveid]');

    searchItems.forEach((item, index) => {
        const link = item.querySelector('a[href^="http"]');
        const title = item.querySelector('h3');

        if (link && title && !link.href.includes('google.com') && index < 10) {
            results.push({
                url: link.href,
                title: title.textContent.trim()
            });
        }
    });

    return results.slice(0, 10);
}

function openGoogleSearch() {
    const query = textArea.value.trim();
    if (!query) return;

    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    lastSearchUrl = searchUrl;

    const width = 1000;
    const height = 800;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;

    searchWindow = window.open(
        searchUrl,
        'GoogleSearchWindow',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (searchWindow) {
        // Wait for the search results to load
        setTimeout(() => {
            try {
                if (searchWindow && !searchWindow.closed) {
                    const doc = searchWindow.document;
                    searchResults = extractSearchResults(doc);

                    if (searchResults.length > 0) {
                        isSearchMode = true;
                        isSpecialMode = false;
                        currentMenu = createSearchResultsMenu();
                        menuStack = [];
                        renderMenu();
                    }
                }
            } catch (e) {
                // Cross-origin restriction - fallback approach
                console.log('Using fallback search navigation mode');
                isSearchMode = true;
                isSpecialMode = false;
                currentMenu = createFallbackSearchMenu();
                menuStack = [];
                renderMenu();
            }
        }, 2000);
    }
}

function openSearchResult(url) {
    if (searchWindow && !searchWindow.closed) {
        searchWindow.location.href = url;
    } else {
        const width = 1000;
        const height = 800;
        const left = (screen.width - width) / 2;
        const top = (screen.height - height) / 2;

        searchWindow = window.open(
            url,
            'GoogleSearchWindow',
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );
    }
}

function closeSearchWindow() {
    if (searchWindow && !searchWindow.closed) {
        searchWindow.close();
    }
    isSearchMode = false;
    searchResults = [];
}
