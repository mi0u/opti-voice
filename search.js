// =============================================================================
// DUCKDUCKGO SEARCH INTEGRATION
// =============================================================================

let currentSearchQuery = '';
let lastWorkingProxy = 0;

async function performDuckDuckGoSearch(page = 0, retryCount = 0) {
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
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout (increased from 10)

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
        showNotification('Unable to fetch search results. All CORS proxies are unavailable. Please try again later.', 6000);
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
        }

        const resultSnippets = doc.querySelectorAll('.result__snippet, .result-snippet');
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
            // Retry logic: if we got 0 results and haven't retried 3 times yet
            if (retryCount < 3) {
                console.log(`No results found, retrying... (attempt ${retryCount + 1}/3)`);
                // Wait a bit before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
                // Try again with the next proxy by resetting lastWorkingProxy
                lastWorkingProxy = (lastWorkingProxy + 1) % corsProxies.length;
                return performDuckDuckGoSearch(page, retryCount + 1);
            } else {
                showNotification('No search results found after 3 attempts. Please try a different query.', 5000);
            }
        }
    } catch (error) {
        console.error('Search error:', error);

        // Retry on error if we haven't exceeded retry limit
        if (retryCount < 3) {
            console.log(`Search error, retrying... (attempt ${retryCount + 1}/3)`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            lastWorkingProxy = (lastWorkingProxy + 1) % corsProxies.length;
            return performDuckDuckGoSearch(page, retryCount + 1);
        } else {
            showNotification('Failed to parse search results after 3 attempts. Please try again.', 5000);
        }
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

async function openSearchResult(url) {
    const resultViewer = document.getElementById('resultViewer');
    const resultContent = document.getElementById('resultContent');
    const resultViewerTitle = document.getElementById('resultViewerTitle');
    const menuContainer = document.getElementById('menuContainer');

    // Hide menu container to prevent left/right from selecting items
    if (menuContainer) menuContainer.style.display = 'none';

    // Show the result viewer
    resultViewer.style.display = 'flex';

    // Set the title to the URL (will be truncated by CSS)
    resultViewerTitle.textContent = 'Loading...';

    // Show loading message
    resultContent.innerHTML = '<div style="padding: 40px; text-align: center; font-size: 18px;">Loading page...<br><br>⏳</div>';

    // Fetch the page through CORS proxy and display it directly
    const corsProxies = [
        'https://corsproxy.io/?',
        'https://api.allorigins.win/raw?url=',
        'https://api.codetabs.com/v1/proxy?quest='
    ];

    let html = null;
    let proxyIndex = 0;

    while (proxyIndex < corsProxies.length && !html) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            const response = await fetch(corsProxies[proxyIndex] + encodeURIComponent(url), {
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                html = await response.text();
            } else {
                proxyIndex++;
            }
        } catch (error) {
            console.log(`[RESULT] Proxy ${proxyIndex} failed:`, error.message);
            proxyIndex++;
        }
    }

    if (!html) {
        resultContent.innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <h2>⚠️ Unable to load page</h2>
                <p>All proxies failed. The page may block external access.</p>
                <p style="margin-top: 20px; font-size: 14px; color: #666;">URL: ${url}</p>
            </div>`;
        resultViewerTitle.textContent = 'Error loading page';
        window.isViewingResult = true;
        return;
    }

    // Fix relative URLs in the HTML
    const baseUrl = new URL(url);
    const fixedHtml = html
        .replace(/href="\//g, `href="${baseUrl.origin}/`)
        .replace(/src="\//g, `src="${baseUrl.origin}/`)
        .replace(/href='\//g, `href='${baseUrl.origin}/`)
        .replace(/src='\//g, `src='${baseUrl.origin}/`);

    // Display the HTML content
    resultContent.innerHTML = fixedHtml;
    resultViewerTitle.textContent = url;

    // Set a global flag that we're viewing a result
    window.isViewingResult = true;

    // Store reference to content div for scrolling
    window.currentResultContent = resultContent;
    window.currentScrollPosition = 0;
}

function scrollResultPage(direction) {
    console.log('[SEARCH] scrollResultPage called:', direction);
    if (!window.isViewingResult || !window.currentResultContent) return false;

    if (direction === 'up') {
        closeResultViewer();
        return true;
    }

    const resultContent = window.currentResultContent;
    const viewportHeight = resultContent.offsetHeight;

    if (direction === 'left') {
        // Scroll up
        resultContent.scrollTop -= viewportHeight;
        showScrollIndicator('⬆️ Scrolling Up');
        console.log('[SEARCH] Scrolled up to:', resultContent.scrollTop);
        return true;
    } else if (direction === 'right') {
        // Scroll down
        resultContent.scrollTop += viewportHeight;
        showScrollIndicator('⬇️ Scrolling Down');
        console.log('[SEARCH] Scrolled down to:', resultContent.scrollTop);
        return true;
    }

    return true;
}

function showScrollIndicator(text) {
    const resultViewerTitle = document.getElementById('resultViewerTitle');
    if (resultViewerTitle) {
        const originalText = resultViewerTitle.textContent;
        resultViewerTitle.textContent = text;
        setTimeout(() => {
            resultViewerTitle.textContent = originalText;
        }, 1000);
    }
}

function closeResultViewer() {
    const resultViewer = document.getElementById('resultViewer');
    const resultContent = document.getElementById('resultContent');
    const menuContainer = document.getElementById('menuContainer');

    // Hide the viewer
    resultViewer.style.display = 'none';

    // Show menu container again
    if (menuContainer) menuContainer.style.display = 'flex';

    // Clear the content
    if (resultContent) resultContent.innerHTML = '';

    // Clear the flags and references
    window.isViewingResult = false;
    window.currentResultContent = null;
    window.currentScrollPosition = 0;
}

function closeSearch() {
    isSearchMode = false;
    searchResults = [];
    allSearchResults = [];
    currentSearchPage = 0;
    closeResultViewer(); // Also close result viewer if open
}

