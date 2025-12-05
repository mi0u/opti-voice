# Web Search Guide

## Overview

The eye-tracking application now features integrated web search using DuckDuckGo, allowing users to search the web and navigate results using eye movements without needing API keys or external services.

## How to Use Web Search

### 1. Initiating a Search

1. Type your search query in the text area using the eye-tracking interface
2. Look down to access the **Special Functions Menu**
3. Select **🔍 Web Search** using left/right eye movements

### 2. Viewing Search Results

Once the search completes, you'll see a menu with up to **10 search results**:

Each result displays:
- Result number (1-10, or continuation from previous page)
- Truncated title (up to 40 characters)

### 3. Navigating Results

**Eye Movement Controls:**
- **Look LEFT** - Select from left column results
- **Look RIGHT** - Select from right column results
- Continue narrowing down by looking left/right until you reach your desired result

**Pagination:**
- **Next →** - View the next 10 results (appears when more results are available)
- **← Previous** - Go back to previous 10 results (appears when not on first page)

### 4. Opening a Result

When you select a search result, it will open page, allowing you to:
- Read the full content
- Browse the website looking LEFT/RIGHT
- Keep the search interface available for more searches
- Go back to the results with UP

### 5. Closing Search

After viewing results, you can:
- **⌂ Return** - Go back to the main menu

## Technical Details

### Search Provider

The application uses **DuckDuckGo Lite** (`https://lite.duckduckgo.com/lite/`) through **CORS proxies**, which:
- Requires no API key
- Returns HTML results that can be parsed
- Provides privacy-focused search
- Uses third-party CORS proxies to bypass browser restrictions

**Note:** CORS proxies can sometimes cause:
- Delays in fetching results
- Intermittent connection issues
- Content parsing problems
- Service availability issues

### Result Layout

Results are designed to fit within the menu area without scrolling:
- Titles are truncated to 40 characters for readability
- Each page shows exactly 10 results for optimal left/right selection
- Navigation controls appear at the bottom of the result list

### Menu Logic

The search results follow the same menu navigation pattern as other app features:
1. Results are split into left and right columns
2. User looks left or right to narrow down selection
3. Continues until single result is selected
4. Selected result opens in new window

## Benefits

- **No API Required** - Works without registration or API keys
- **Eye-Controlled** - Fully integrated with eye-tracking navigation
- **Privacy-Focused** - Uses DuckDuckGo for privacy-respecting search
- **Compact Display** - Results fit in menu area without scrolling
- **Pagination** - Access many results across multiple pages

## Troubleshooting

**Search returns no results:**
- Check your internet connection
- Try a different search query
- Ensure the text area contains a valid search term
- Sometimes there is a delay until results are fetched

**Search is slow:**
- Network speed affects search performance
- DuckDuckGo Lite is generally fast, but depends on connection
- CORS proxy delays can add extra latency to requests

**Results window doesn't open:**
- Check if popup blocker is enabled in your browser
- Allow popups for this application
- Try selecting the result again

**Known Limitations:**
- No handling for popup windows, alerts, or browser dialogs on result pages
- Some websites may not load properly due to CORS proxy limitations
- Complex pages with heavy JavaScript may have display issues

## Future Enhancements

Potential improvements could include:
- Image thumbnails for results (if they fit without scrolling)
- Result snippets on hover/selection
- Search history
- Ability to refine searches
- Alternative search providers
