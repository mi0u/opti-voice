// =============================================================================
// DUCKDUCKGO SEARCH INTEGRATION
// =============================================================================

let currentSearchQuery = '';
let lastWorkingProxy = 0;

async function performDuckDuckGoSearch(page = 0) {
    const query = textArea.value.trim();
    if (!query) return;

    // Store the query for pagination
    if (page === 0) {
        currentSearchQuery = query;
        allSearchResults = []; // Reset results for new search
    }

    // List of CORS proxies to try
    const corsProxies = [
        'https://corsproxy.io/?',
        'https://api.codetabs.com/v1/proxy?quest=',
        'https://api.allorigins.win/raw?url=',
        'https://cors-anywhere.herokuapp.com/'
    ];

    let html = null;
    let proxyIndex = lastWorkingProxy; // Start with last working proxy

    // Build search URL with pagination
    // DuckDuckGo uses 's' parameter for start index and 'dc' for additional results
    const startIndex = page * 30; // Offset for pagination
    const searchUrl = startIndex > 0
        ? `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}&s=${startIndex}`
        : `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

    // Try each proxy until one works
    while (proxyIndex < corsProxies.length && !html) {
        try {
            const corsProxy = corsProxies[proxyIndex];

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const response = await fetch(corsProxy + encodeURIComponent(searchUrl), {
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                html = await response.text();
                lastWorkingProxy = proxyIndex; // Remember working proxy
            } else {
                proxyIndex++;
            }
        } catch (error) {
            console.log(`Proxy ${proxyIndex} failed, trying next...`);
            proxyIndex++;
        }
    }

    if (!html) {
        alert('Unable to fetch search results. All CORS proxies are unavailable. Please try again later or check your internet connection.');
        return;
    }

    try {
        // Parse the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Debug: Log a sample of what we received
        const bodyText = doc.body ? doc.body.textContent.substring(0, 200) : 'No body found';
        //console.log('HTML sample:', bodyText);

        // Extract search results from DuckDuckGo HTML
        const results = [];

        // Try multiple selector strategies
        let resultLinks = doc.querySelectorAll('.result__a');

        // Fallback selectors if first doesn't work
        if (resultLinks.length === 0) {
            resultLinks = doc.querySelectorAll('a.result-link');
        }
        if (resultLinks.length === 0) {
            resultLinks = doc.querySelectorAll('.links_main a');
        }
        if (resultLinks.length === 0) {
            // Try table-based layout (DuckDuckGo Lite uses tables)
            const tableLinks = doc.querySelectorAll('table a[href^="http"]');
            const filtered = [];
            tableLinks.forEach(link => {
                // Skip navigation and DuckDuckGo links
                if (!link.href.includes('duckduckgo.com') &&
                    !link.textContent.includes('Next') &&
                    !link.textContent.includes('Previous')) {
                    filtered.push(link);
                }
            });
            resultLinks = filtered;
        }
        if (resultLinks.length === 0) {
            // Try any link inside result containers
            resultLinks = doc.querySelectorAll('.result a[href^="http"], .web-result a[href^="http"]');
        }        const resultSnippets = doc.querySelectorAll('.result__snippet, .result-snippet');
        const resultImages = doc.querySelectorAll('.result__image img, img.result__icon__img, .result img');

        console.log(`Found ${resultLinks.length} result links in HTML`);

        resultLinks.forEach((link, index) => {
            if (index < 30 && link.href) { // Get up to 30 results for pagination
                // Skip DuckDuckGo internal links
                if (link.href.includes('duckduckgo.com') && !link.href.includes('/l/')) {
                    return;
                }

                // Try to find associated image
                let imageUrl = null;
                if (resultImages[index] && resultImages[index].src) {
                    imageUrl = resultImages[index].src;
                }

                // Extract the actual URL from DuckDuckGo's redirect
                let actualUrl = link.href;

                // DuckDuckGo uses uddg parameter or data-attributes for actual URLs
                const uddgMatch = link.getAttribute('data-uddg') || link.href.match(/uddg=([^&]+)/);
                if (uddgMatch) {
                    actualUrl = typeof uddgMatch === 'string' ? uddgMatch : decodeURIComponent(uddgMatch[1]);
                }

                // If it's a relative URL, try to extract from onclick or href
                if (actualUrl.startsWith('/') || actualUrl.includes('duckduckgo.com/l/')) {
                    // Skip DuckDuckGo internal links
                    const parent = link.closest('.result, .web-result, .links_main');
                    if (parent) {
                        const urlElement = parent.querySelector('.result__url, .result-url');
                        if (urlElement) {
                            const urlText = urlElement.textContent.trim();
                            actualUrl = urlText.startsWith('http') ? urlText : 'https://' + urlText;
                        }
                    }
                }

                const title = link.textContent.trim() || link.getAttribute('title') || 'Result ' + (index + 1);

                results.push({
                    title: title,
                    url: actualUrl,
                    snippet: resultSnippets[index] ? resultSnippets[index].textContent.trim() : '',
                    image: imageUrl
                });
            }
        });

        // Append results to existing ones if this is a pagination request
        if (page === 0) {
            allSearchResults = results;
            currentSearchPage = 0; // Reset page counter for new searches
        } else {
            allSearchResults = allSearchResults.concat(results);
            // When fetching more, show the newly fetched results (next page)
            currentSearchPage = Math.floor((allSearchResults.length - results.length) / 10);
        }

        console.log(`Found ${results.length} new results. Total: ${allSearchResults.length}`);

        // Update searchResults with current page (10 results)
        updateSearchResultsPage();

        // Show search results menu
        if (searchResults.length > 0) {
            isSearchMode = true;
            isSpecialMode = false;
            currentMenu = createSearchResultsMenu();
            menuStack = [];
            renderMenu();
        } else {
            alert('No search results found. Please try a different query.');
        }
    } catch (error) {
        console.error('Search error:', error);
        alert('Failed to parse search results. Please try again.');
    }
}

function updateSearchResultsPage() {
    const startIdx = currentSearchPage * 10;
    searchResults = allSearchResults.slice(startIdx, startIdx + 10);
}

function nextSearchPage() {
    const maxPage = Math.ceil(allSearchResults.length / 10) - 1;
    if (currentSearchPage < maxPage) {
        currentSearchPage++;
        updateSearchResultsPage();
        currentMenu = createSearchResultsMenu();
        menuStack = [];
        renderMenu();
    } else {
        // Need to fetch more results
        const nextFetchPage = Math.floor(allSearchResults.length / 30) + 1;
        performDuckDuckGoSearch(nextFetchPage);
    }
}

function previousSearchPage() {
    if (currentSearchPage > 0) {
        currentSearchPage--;
        updateSearchResultsPage();
        currentMenu = createSearchResultsMenu();
        menuStack = [];
        renderMenu();
    }
}

function openSearchResult(url) {
    const width = 1000;
    const height = 800;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;

    window.open(
        url,
        'SearchResultWindow',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
}

function closeSearch() {
    isSearchMode = false;
    searchResults = [];
    allSearchResults = [];
    currentSearchPage = 0;
}
