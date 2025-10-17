// TabLib - Tab Manager Logic

let allWindows = [];
let selectedTabs = new Set();
let lastSelectedTabId = null;
let searchResults = new Set();
let isFuzzySearch = true; // Search mode: true = fuzzy, false = normal
let viewMode = 'compact'; // View mode: compact, normal, cozy
let showUrlInCompact = false; // Show URL in compact mode
let currentFilter = ''; // Current search filter text

// Connect to background script for realtime updates
let port;

function connectToBackground() {
  port = chrome.runtime.connect({ name: 'tabmanager' });
  port.onMessage.addListener((message) => {
    if (message.action === 'updateTabs') {
      loadTabs();
    }
  });
  port.onDisconnect.addListener(() => {
    // Reconnect when disconnected
    setTimeout(connectToBackground, 1000); // Reconnect after 1 second
  });
}

connectToBackground();

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadTabs();
  setupEventListeners();
  setupScrollHandler();

  // Show URL toggle button for compact mode (default)
  document.getElementById('showUrlToggle').style.display = 'inline-flex';
});

// Load all windows and tabs
async function loadTabs() {
  allWindows = await chrome.windows.getAll({ populate: true });
  renderWindows(currentFilter);
}

// Fuzzy match algorithm - returns match data or null
function fuzzyMatch(text, query) {
  if (!query) return { score: 0, indices: [] };

  text = text.toLowerCase();
  query = query.toLowerCase();

  const indices = [];
  let textIndex = 0;
  let queryIndex = 0;

  // Find sequential matches
  while (queryIndex < query.length && textIndex < text.length) {
    if (text[textIndex] === query[queryIndex]) {
      indices.push(textIndex);
      queryIndex++;
    }
    textIndex++;
  }

  // If we didn't match all query characters, no match
  if (queryIndex !== query.length) {
    return null;
  }

  // Calculate score
  const score = calculateScore(text, query, indices);
  return { score, indices };
}

// Calculate match score (higher is better)
function calculateScore(text, query, indices) {
  let score = 0;

  // Base score: length of match (shorter text with match = better)
  score += 100 - text.length;

  // Consecutive character bonus
  let consecutiveCount = 0;
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] === indices[i - 1] + 1) {
      consecutiveCount++;
      score += 15; // Bonus for each consecutive match
    } else {
      consecutiveCount = 0;
    }
  }

  // Start of text bonus
  if (indices[0] === 0) {
    score += 30;
  }

  // Word boundary bonus (match after space, -, _, /)
  const wordBoundaries = [' ', '-', '_', '/', '.'];
  indices.forEach((idx, i) => {
    if (idx > 0 && wordBoundaries.includes(text[idx - 1])) {
      score += 20; // Match at start of word
    }

    // CamelCase bonus (uppercase letter in original text)
    // Check against original case by looking at the actual character
    const actualChar = text[idx];
    const prevChar = idx > 0 ? text[idx - 1] : '';
    if (
      prevChar &&
      prevChar === prevChar.toLowerCase() &&
      actualChar !== actualChar.toLowerCase()
    ) {
      score += 20; // CamelCase match
    }
  });

  // Early position bonus (first 10 characters)
  indices.forEach((idx) => {
    if (idx < 10) {
      score += 10 - idx;
    }
  });

  // Query coverage bonus (percentage of text matched)
  const coverage = query.length / text.length;
  score += coverage * 50;

  return score;
}

// Render all windows and tabs
function renderWindows(filterText = '') {
  const container = document.getElementById('windowsContainer');
  container.innerHTML = '';
  searchResults.clear();

  // Collect all windows with their matching tabs and best scores
  const windowsWithMatches = [];

  allWindows.forEach((window, windowIndex) => {
    const matchingTabs = [];

    window.tabs.forEach((tab, tabIndex) => {
      if (!filterText) {
        // No filter - show all tabs
        matchingTabs.push({
          tab,
          tabIndex,
          score: 0,
          titleIndices: [],
          urlIndices: []
        });
        return;
      }

      if (isFuzzySearch) {
        // Fuzzy search mode
        const titleMatch = fuzzyMatch(tab.title, filterText);
        const urlMatch = fuzzyMatch(tab.url, filterText);

        if (titleMatch || urlMatch) {
          const bestScore = Math.max(
            titleMatch ? titleMatch.score : -Infinity,
            urlMatch ? urlMatch.score : -Infinity
          );

          searchResults.add(tab.id);
          matchingTabs.push({
            tab,
            tabIndex,
            score: bestScore,
            titleIndices: titleMatch ? titleMatch.indices : [],
            urlIndices: urlMatch ? urlMatch.indices : []
          });
        }
      } else {
        // Normal substring search mode
        const titleMatches = tab.title
          .toLowerCase()
          .includes(filterText.toLowerCase());
        const urlMatches = tab.url
          .toLowerCase()
          .includes(filterText.toLowerCase());

        if (titleMatches || urlMatches) {
          searchResults.add(tab.id);
          matchingTabs.push({
            tab,
            tabIndex,
            score: 0,
            titleIndices: [],
            urlIndices: []
          });
        }
      }
    });

    // Skip window if no matching tabs when filtering
    if (filterText && matchingTabs.length === 0) {
      return;
    }

    // Sort matching tabs by score (highest first) in fuzzy mode
    if (filterText && isFuzzySearch) {
      matchingTabs.sort((a, b) => b.score - a.score);
    }

    // Calculate best score for this window
    const bestWindowScore =
      matchingTabs.length > 0
        ? Math.max(...matchingTabs.map((t) => t.score))
        : 0;

    windowsWithMatches.push({
      window,
      windowIndex,
      matchingTabs,
      bestScore: bestWindowScore
    });
  });

  // Sort windows by best score (highest first) in fuzzy mode
  if (filterText && isFuzzySearch) {
    windowsWithMatches.sort((a, b) => b.bestScore - a.bestScore);
  }

  // Render windows
  windowsWithMatches.forEach(({ window, windowIndex, matchingTabs }) => {
    const windowDiv = document.createElement('div');
    windowDiv.className = 'window-group';
    windowDiv.dataset.windowId = window.id;

    const windowHeader = document.createElement('div');
    windowHeader.className = 'window-header';
    windowHeader.innerHTML = `
      <span class="window-title clickable" data-window-id="${
        window.id
      }" title="Click to focus this window">
        ${window.focused ? '🟢' : '⚪'} Window ${windowIndex + 1}
        <span class="tab-count">(${matchingTabs.length} ${
      filterText ? 'matching ' : ''
    }tab${matchingTabs.length !== 1 ? 's' : ''})</span>
      </span>
      <button class="btn-small select-window-btn" data-window-id="${window.id}">
        Select All in Window
      </button>
    `;
    windowDiv.appendChild(windowHeader);

    // Add click handler to window title
    const windowTitle = windowHeader.querySelector('.window-title.clickable');
    windowTitle.addEventListener('click', async () => {
      try {
        await chrome.windows.update(window.id, { focused: true });
      } catch (error) {
        console.error('Failed to focus window:', error);
      }
    });

    const tabsList = document.createElement('div');
    tabsList.className = `tabs-list view-${viewMode}`;

    matchingTabs.forEach(({ tab, tabIndex, titleIndices, urlIndices }) => {
      const tabItem = createTabElement(
        tab,
        windowIndex,
        tabIndex,
        titleIndices,
        urlIndices
      );
      tabsList.appendChild(tabItem);
    });

    windowDiv.appendChild(tabsList);
    container.appendChild(windowDiv);
  });

  updateSelectionCount();
  updateSearchCount(filterText);
}

// Highlight matched characters in text
function highlightMatches(text, indices) {
  if (!indices || indices.length === 0) {
    return escapeHtml(text);
  }

  let result = '';
  let lastIndex = 0;

  indices.forEach((idx) => {
    // Add text before match
    if (idx > lastIndex) {
      result += escapeHtml(text.substring(lastIndex, idx));
    }
    // Add highlighted match
    result += `<mark>${escapeHtml(text[idx])}</mark>`;
    lastIndex = idx + 1;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    result += escapeHtml(text.substring(lastIndex));
  }

  return result;
}

// Clean and normalize text (remove excess whitespace, newlines)
function cleanText(text) {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
}

// Create tab element
function createTabElement(
  tab,
  windowIndex,
  tabIndex,
  titleIndices = [],
  urlIndices = []
) {
  const tabItem = document.createElement('div');
  tabItem.className = 'tab-item';
  tabItem.dataset.tabId = tab.id;
  tabItem.dataset.windowIndex = windowIndex;
  tabItem.dataset.tabIndex = tabIndex;

  if (selectedTabs.has(tab.id)) {
    tabItem.classList.add('selected');
  }

  // Clean tab title and URL
  const cleanTitle = cleanText(tab.title);
  const cleanUrl = cleanText(tab.url);

  // Highlight matches in title and URL
  const highlightedTitle = highlightMatches(cleanTitle, titleIndices);
  const highlightedUrl = highlightMatches(cleanUrl, urlIndices);

  // Determine if URL should be shown
  const showUrl = viewMode !== 'compact' || showUrlInCompact;
  const urlClass =
    viewMode === 'compact' && !showUrlInCompact ? 'tab-url-tooltip' : 'tab-url';

  // Create checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'tab-checkbox';
  checkbox.checked = selectedTabs.has(tab.id);

  // Create favicon with better error handling
  const faviconImg = document.createElement('img');
  faviconImg.className = 'favicon';
  faviconImg.alt = '';

  // Default fallback icon
  const defaultIcon =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"%3E%3Ctext y="14" font-size="14"%3E📄%3C/text%3E%3C/svg%3E';

  if (tab.favIconUrl && tab.favIconUrl.startsWith('http')) {
    faviconImg.src = tab.favIconUrl;
    faviconImg.onerror = () => {
      faviconImg.src = defaultIcon;
    };
  } else {
    faviconImg.src = defaultIcon;
  }

  // Create tab info
  const tabInfo = document.createElement('div');
  tabInfo.className = 'tab-info';

  const titleDiv = document.createElement('div');
  titleDiv.className = 'tab-title';
  titleDiv.innerHTML = highlightedTitle;
  tabInfo.appendChild(titleDiv);

  if (showUrl) {
    const urlDiv = document.createElement('div');
    urlDiv.className = urlClass;
    urlDiv.innerHTML = highlightedUrl;
    tabInfo.appendChild(urlDiv);
  }

  // Create hover URL for compact mode
  let hoverUrlDiv = null;
  if (viewMode === 'compact' && !showUrlInCompact) {
    hoverUrlDiv = document.createElement('div');
    hoverUrlDiv.className = 'tab-url-hover';
    hoverUrlDiv.innerHTML = highlightedUrl;
  }

  // Create close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'btn-icon close-tab-btn';
  closeBtn.title = 'Close tab';
  closeBtn.textContent = '✕';

  // Append all elements
  tabItem.appendChild(checkbox);
  tabItem.appendChild(faviconImg);
  tabItem.appendChild(tabInfo);
  if (hoverUrlDiv) {
    tabItem.appendChild(hoverUrlDiv);
  }
  tabItem.appendChild(closeBtn);

  // Event listeners
  checkbox.addEventListener('change', (e) => {
    e.stopPropagation();
    toggleTabSelection(tab.id);
  });

  tabItem.addEventListener('click', (e) => {
    if (e.target.classList.contains('close-tab-btn')) {
      closeTab(tab.id);
      return;
    }
    if (e.target.classList.contains('tab-checkbox')) {
      return; // Already handled
    }

    handleTabClick(tab.id, e);
  });

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeTab(tab.id);
  });

  return tabItem;
}

// Handle tab click with multi-selection
function handleTabClick(tabId, event) {
  // Get all visible tab elements in order
  const allTabElements = Array.from(document.querySelectorAll('.tab-item'));
  const currentIndex = allTabElements.findIndex(el => parseInt(el.dataset.tabId) === tabId);

  // Find anchor index
  let anchorIndex = null;
  if (lastSelectedTabId !== null) {
    anchorIndex = allTabElements.findIndex(el => parseInt(el.dataset.tabId) === lastSelectedTabId);
    if (anchorIndex === -1) {
      lastSelectedTabId = null; // Anchor tab not visible
    }
  }

  if (event.ctrlKey || event.metaKey) {
    // Ctrl+Click: Switch to tab
    chrome.tabs.update(tabId, { active: true });
    chrome.windows.update(getWindowIdForTab(tabId), { focused: true });
  } else if (event.shiftKey) {
    // Shift+Click: Range selection
    if (anchorIndex === null) {
      // First shift+click: set anchor and select this tab
      lastSelectedTabId = tabId;
      toggleTabSelection(tabId);
    } else {
      // Subsequent shift+click: clear previous and select range
      selectedTabs.clear();
      // Update UI for deselection
      document.querySelectorAll('.tab-item.selected').forEach(el => el.classList.remove('selected'));
      document.querySelectorAll('.tab-checkbox').forEach(cb => cb.checked = false);

      const start = Math.min(anchorIndex, currentIndex);
      const end = Math.max(anchorIndex, currentIndex);

      for (let i = start; i <= end; i++) {
        const tid = parseInt(allTabElements[i].dataset.tabId);
        toggleTabSelection(tid);
      }
    }
  } else {
    // Regular click: Select tab and set anchor
    toggleTabSelection(tabId);
    lastSelectedTabId = tabId;
  }
}

// Toggle tab selection
function toggleTabSelection(tabId) {
  if (selectedTabs.has(tabId)) {
    selectedTabs.delete(tabId);
  } else {
    selectedTabs.add(tabId);
  }

  const tabElement = document.querySelector(`[data-tab-id="${tabId}"]`);
  if (tabElement) {
    tabElement.classList.toggle('selected');
    const checkbox = tabElement.querySelector('.tab-checkbox');
    checkbox.checked = selectedTabs.has(tabId);
  }

  updateSelectionCount();
  updateWindowSelectButtons();
}

// Get window ID for a tab
function getWindowIdForTab(tabId) {
  for (const window of allWindows) {
    const tab = window.tabs.find((t) => t.id === tabId);
    if (tab) return window.id;
  }
  return null;
}

// Update selection count
function updateSelectionCount() {
  const count = selectedTabs.size;
  document.getElementById('selectionCount').textContent = `${count} selected`;

  const moveBtn = document.getElementById('moveToNewWindowBtn');
  const closeBtn = document.getElementById('closeSelectedBtn');
  const copyBtn = document.getElementById('copyLinksBtn');

  moveBtn.disabled = count === 0;
  closeBtn.disabled = count === 0;
  copyBtn.disabled = count === 0;
}

// Update search count
function updateSearchCount(filterText) {
  const countEl = document.getElementById('searchCount');

  if (filterText) {
    // Count windows with matches
    const windowsWithMatches = allWindows.filter((window) => {
      return window.tabs.some((tab) => searchResults.has(tab.id));
    }).length;

    countEl.textContent = `${searchResults.size} tab${
      searchResults.size !== 1 ? 's' : ''
    } in ${windowsWithMatches} window${windowsWithMatches !== 1 ? 's' : ''}`;
    countEl.style.display = 'inline';
  } else {
    // Show total counts
    const totalTabs = allWindows.reduce((sum, w) => sum + w.tabs.length, 0);
    countEl.textContent = `${totalTabs} tab${totalTabs !== 1 ? 's' : ''} in ${
      allWindows.length
    } window${allWindows.length !== 1 ? 's' : ''}`;
    countEl.style.display = 'inline';
  }
}

// Close tab
async function closeTab(tabId) {
  await chrome.tabs.remove(tabId);
  selectedTabs.delete(tabId);
  await loadTabs();
}

// Setup event listeners
function setupEventListeners() {
  // Search
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', (e) => {
    currentFilter = e.target.value;
    renderWindows(currentFilter);
  });

  // Search mode toggle
  const searchModeToggle = document.getElementById('searchModeToggle');
  searchModeToggle.addEventListener('click', () => {
    isFuzzySearch = !isFuzzySearch;

    // Update button appearance
    const modeIcon = searchModeToggle.querySelector('.mode-icon');
    const modeText = searchModeToggle.querySelector('.mode-text');

    if (isFuzzySearch) {
      searchModeToggle.classList.remove('normal-mode');
      modeIcon.textContent = '✨';
      modeText.textContent = 'Fuzzy';
      searchModeToggle.title = 'Switch to normal search';
    } else {
      searchModeToggle.classList.add('normal-mode');
      modeIcon.textContent = '🔍';
      modeText.textContent = 'Normal';
      searchModeToggle.title = 'Switch to fuzzy search';
    }

    // Re-render with current search
    renderWindows(searchInput.value);
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', async (e) => {
    // Ctrl+F: Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      searchInput.focus();
    }

    // Ctrl+A: Select all visible tabs
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      selectAllVisible();
    }

    // Delete: Close selected
    if (e.key === 'Delete' && selectedTabs.size > 0) {
      e.preventDefault();
      await closeSelectedTabs();
    }

    // Escape: Clear search or deselect
    if (e.key === 'Escape') {
      if (searchInput.value) {
        searchInput.value = '';
        renderWindows();
      } else {
        deselectAll();
      }
    }
  });

  // Select All button
  document
    .getElementById('selectAllBtn')
    .addEventListener('click', selectAllVisible);

  // Deselect All button
  document
    .getElementById('deselectAllBtn')
    .addEventListener('click', deselectAll);

  // Move to New Window button
  document
    .getElementById('moveToNewWindowBtn')
    .addEventListener('click', moveToNewWindow);

  // Close Selected button
  document
    .getElementById('closeSelectedBtn')
    .addEventListener('click', closeSelectedTabs);

  // Select all in window buttons (delegated)
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('select-window-btn')) {
      const windowId = parseInt(e.target.dataset.windowId);
      selectAllInWindow(windowId);
    }
  });

  // View mode selector
  const viewModeSelect = document.getElementById('viewModeSelect');
  const showUrlToggle = document.getElementById('showUrlToggle');

  viewModeSelect.addEventListener('change', (e) => {
    viewMode = e.target.value;

    // Show/hide URL toggle button for compact mode
    if (viewMode === 'compact') {
      showUrlToggle.style.display = 'inline-flex';
    } else {
      showUrlToggle.style.display = 'none';
    }

    // Re-render
    renderWindows(searchInput.value);
  });

  // URL visibility toggle (compact mode only)
  showUrlToggle.addEventListener('click', () => {
    showUrlInCompact = !showUrlInCompact;

    // Update button appearance
    const urlIcon = showUrlToggle.querySelector('.url-icon');
    if (showUrlInCompact) {
      showUrlToggle.classList.add('active');
      showUrlToggle.title = 'Hide URLs';
    } else {
      showUrlToggle.classList.remove('active');
      showUrlToggle.title = 'Show URLs';
    }

    // Re-render
    renderWindows(searchInput.value);
  });

  // Copy Links button
  document
    .getElementById('copyLinksBtn')
    .addEventListener('click', copyLinksToClipboard);

  // Paste Links button
  document
    .getElementById('pasteLinksBtn')
    .addEventListener('click', openPasteModal);

  // Paste modal buttons
  document
    .getElementById('openLinksBtn')
    .addEventListener('click', openPastedLinks);
  document
    .getElementById('cancelPasteBtn')
    .addEventListener('click', closeModal);
  document.getElementById('closeModal').addEventListener('click', closeModal);

  // Close modal on outside click
  document.getElementById('pasteModal').addEventListener('click', (e) => {
    if (e.target.id === 'pasteModal') {
      closeModal();
    }
  });

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'Escape' &&
      document.getElementById('pasteModal').classList.contains('show')
    ) {
      closeModal();
    }
  });

  // Optimize Windows button
  document
    .getElementById('optimizeWindowsBtn')
    .addEventListener('click', openOptimizeModal);

  // Optimize modal buttons
  document
    .getElementById('closeOptimizeModal')
    .addEventListener('click', closeOptimizeModal);
  document
    .getElementById('cancelOptimizeBtn')
    .addEventListener('click', closeOptimizeModal);
  document
    .getElementById('applyOptimizeBtn')
    .addEventListener('click', applyOptimization);

  // Auto-update preview when settings change
  document
    .getElementById('minTabsPerWindow')
    .addEventListener('input', previewOptimization);
  document
    .getElementById('maxTabsPerWindow')
    .addEventListener('input', previewOptimization);

  // Feedback button
  document.getElementById('feedbackBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://forms.gle/GLzELXohcmaKVDFd6' });
  });

  // Close optimize modal on outside click
  document.getElementById('optimizeModal').addEventListener('click', (e) => {
    if (e.target.id === 'optimizeModal') {
      closeOptimizeModal();
    }
  });

  // Close optimize modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'Escape' &&
      document.getElementById('optimizeModal').classList.contains('show')
    ) {
      closeOptimizeModal();
    }
  });
}

// Select all visible tabs
function selectAllVisible() {
  const visibleTabs = document.querySelectorAll('.tab-item');
  visibleTabs.forEach((tabEl) => {
    const tabId = parseInt(tabEl.dataset.tabId);
    if (!selectedTabs.has(tabId)) {
      selectedTabs.add(tabId);
      tabEl.classList.add('selected');
      tabEl.querySelector('.tab-checkbox').checked = true;
    }
  });
  updateSelectionCount();
  updateWindowSelectButtons();
}

// Deselect all tabs
function deselectAll() {
  selectedTabs.clear();
  document.querySelectorAll('.tab-item').forEach((tabEl) => {
    tabEl.classList.remove('selected');
    tabEl.querySelector('.tab-checkbox').checked = false;
  });
  updateSelectionCount();
  updateWindowSelectButtons();
}

// Select all tabs in a window (or deselect if all are already selected)
function selectAllInWindow(windowId) {
  const window = allWindows.find((w) => w.id === windowId);
  if (!window) return;

  // Check if all tabs in this window are already selected
  const allSelected = window.tabs.every((tab) => selectedTabs.has(tab.id));

  if (allSelected) {
    // Deselect all tabs in this window
    window.tabs.forEach((tab) => {
      selectedTabs.delete(tab.id);
      const tabEl = document.querySelector(`[data-tab-id="${tab.id}"]`);
      if (tabEl) {
        tabEl.classList.remove('selected');
        tabEl.querySelector('.tab-checkbox').checked = false;
      }
    });
  } else {
    // Select all tabs in this window
    window.tabs.forEach((tab) => {
      if (!selectedTabs.has(tab.id)) {
        selectedTabs.add(tab.id);
        const tabEl = document.querySelector(`[data-tab-id="${tab.id}"]`);
        if (tabEl) {
          tabEl.classList.add('selected');
          tabEl.querySelector('.tab-checkbox').checked = true;
        }
      }
    });
  }

  updateSelectionCount();

  // Update button text
  updateWindowSelectButtons();
}

// Update window select button text based on selection state
function updateWindowSelectButtons() {
  allWindows.forEach((window) => {
    const allSelected = window.tabs.every((tab) => selectedTabs.has(tab.id));
    const button = document.querySelector(
      `[data-window-id="${window.id}"].select-window-btn`
    );

    if (button) {
      if (allSelected && window.tabs.length > 0) {
        button.textContent = 'Deselect All in Window';
        button.classList.add('deselect-mode');
      } else {
        button.textContent = 'Select All in Window';
        button.classList.remove('deselect-mode');
      }
    }
  });
}

// Move selected tabs to new window
async function moveToNewWindow() {
  if (selectedTabs.size === 0) return;

  const tabIds = Array.from(selectedTabs);

  // Create new window with first tab
  const newWindow = await chrome.windows.create({ tabId: tabIds[0] });

  // Move remaining tabs to new window
  if (tabIds.length > 1) {
    await chrome.tabs.move(tabIds.slice(1), {
      windowId: newWindow.id,
      index: -1
    });
  }

  selectedTabs.clear();
  await loadTabs();
}

// Close selected tabs
async function closeSelectedTabs() {
  if (selectedTabs.size === 0) return;

  const tabIds = Array.from(selectedTabs);
  await chrome.tabs.remove(tabIds);
  selectedTabs.clear();
  await loadTabs();
}

// Copy selected tab links to clipboard
async function copyLinksToClipboard() {
  if (selectedTabs.size === 0) return;

  const format = document.getElementById('copyFormatSelect').value;
  const selectedTabsData = [];

  // Gather selected tab data
  allWindows.forEach((window) => {
    window.tabs.forEach((tab) => {
      if (selectedTabs.has(tab.id)) {
        selectedTabsData.push({ title: tab.title, url: tab.url });
      }
    });
  });

  // Format the links
  let clipboardText = '';

  switch (format) {
    case 'plain':
      clipboardText = selectedTabsData.map((tab) => tab.url).join('\n');
      break;

    case 'markdown':
      clipboardText = selectedTabsData
        .map((tab) => `[${tab.title}](${tab.url})`)
        .join('\n');
      break;

    case 'html':
      clipboardText = selectedTabsData
        .map(
          (tab) => `<a href="${tab.url}">${escapeHtmlForCopy(tab.title)}</a>`
        )
        .join('\n');
      break;
  }

  // Copy to clipboard
  try {
    await navigator.clipboard.writeText(clipboardText);
    showToast(
      `✓ Copied ${selectedTabsData.length} link${
        selectedTabsData.length !== 1 ? 's' : ''
      } (${format} format)`
    );
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    showToast('✗ Failed to copy to clipboard', true);
  }
}

// Helper: Escape HTML for copy
function escapeHtmlForCopy(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Show toast notification
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');

  toastMessage.textContent = message;
  toast.className = `toast ${isError ? 'error' : ''} show`;

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Parse links from text (supports plain URLs, Markdown, HTML)
function parseLinks(text) {
  const urls = [];

  // Remove extra whitespace and split by lines
  const lines = text
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line);

  for (const line of lines) {
    // Plain URL (starts with http:// or https://)
    if (/^https?:\/\/.+/.test(line)) {
      urls.push(line);
    }
    // Markdown format: [Title](URL)
    else {
      const markdownMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/g);
      if (markdownMatch) {
        markdownMatch.forEach((match) => {
          const urlMatch = match.match(/\(([^)]+)\)/);
          if (urlMatch) {
            urls.push(urlMatch[1]);
          }
        });
      }
      // HTML format: <a href="URL">Title</a>
      else {
        const htmlMatch = line.match(/href=["']([^"']+)["']/g);
        if (htmlMatch) {
          htmlMatch.forEach((match) => {
            const urlMatch = match.match(/href=["']([^"']+)["']/);
            if (urlMatch) {
              urls.push(urlMatch[1]);
            }
          });
        }
      }
    }
  }

  return urls;
}

// Open pasted links
async function openPastedLinks() {
  const textarea = document.getElementById('pasteTextarea');
  const text = textarea.value.trim();

  if (!text) {
    showToast('⚠ Please paste some links first', true);
    return;
  }

  // Parse links
  const urls = parseLinks(text);

  if (urls.length === 0) {
    showToast('⚠ No valid URLs found', true);
    return;
  }

  // Get selected mode
  const openMode = document.querySelector(
    'input[name="openMode"]:checked'
  ).value;

  try {
    if (openMode === 'new-window') {
      // Create new window with first URL
      const newWindow = await chrome.windows.create({ url: urls[0] });

      // Open remaining URLs in the same window
      if (urls.length > 1) {
        for (let i = 1; i < urls.length; i++) {
          await chrome.tabs.create({ windowId: newWindow.id, url: urls[i] });
        }
      }

      showToast(
        `✓ Opened ${urls.length} link${
          urls.length !== 1 ? 's' : ''
        } in new window`
      );
    } else {
      // Open in current window (get first available window)
      const windows = await chrome.windows.getAll();
      const currentWindow = windows.find((w) => w.focused) || windows[0];

      if (currentWindow) {
        for (const url of urls) {
          await chrome.tabs.create({ windowId: currentWindow.id, url });
        }
        showToast(
          `✓ Opened ${urls.length} link${
            urls.length !== 1 ? 's' : ''
          } in current window`
        );
      }
    }

    // Close modal and clear textarea
    closeModal();
    textarea.value = '';

    // Reload tabs to show new ones
    setTimeout(() => loadTabs(), 500);
  } catch (error) {
    console.error('Failed to open links:', error);
    showToast('✗ Failed to open links', true);
  }
}

// Open paste modal
function openPasteModal() {
  const modal = document.getElementById('pasteModal');
  modal.classList.add('show');
  document.getElementById('pasteTextarea').focus();
}

// Close paste modal
function closeModal() {
  const modal = document.getElementById('pasteModal');
  modal.classList.remove('show');
}

// Window Optimization Feature
let optimizationPlan = null;

// Calculate optimization plan
function calculateOptimizationPlan() {
  const minTabs =
    parseInt(document.getElementById('minTabsPerWindow').value) || 5;
  const maxTabs =
    parseInt(document.getElementById('maxTabsPerWindow').value) || 15;

  const plan = {
    toMerge: [],
    toSplit: [],
    actions: []
  };

  // Find windows that need optimization
  allWindows.forEach((window) => {
    const tabCount = window.tabs.length;

    if (tabCount < minTabs) {
      plan.toMerge.push(window);
    } else if (tabCount > maxTabs) {
      plan.toSplit.push(window);
    }
  });

  // Plan merges
  if (plan.toMerge.length > 1) {
    const totalTabs = plan.toMerge.reduce((sum, w) => sum + w.tabs.length, 0);
    plan.actions.push({
      type: 'merge',
      windows: plan.toMerge.length,
      tabs: totalTabs,
      description: `Merge ${plan.toMerge.length} small windows (${totalTabs} tabs total) into one window`
    });
  }

  // Plan splits
  plan.toSplit.forEach((window) => {
    const numNewWindows = Math.ceil(window.tabs.length / maxTabs);
    plan.actions.push({
      type: 'split',
      windowId: window.id,
      tabs: window.tabs.length,
      into: numNewWindows,
      description: `Split window with ${window.tabs.length} tabs into ${numNewWindows} windows`
    });
  });

  return plan;
}

// Preview optimization
function previewOptimization() {
  optimizationPlan = calculateOptimizationPlan();
  const previewDiv = document.getElementById('optimizationPreview');
  const applyBtn = document.getElementById('applyOptimizeBtn');

  if (optimizationPlan.actions.length === 0) {
    previewDiv.innerHTML = `
      <div class="preview-result success">
        <div class="preview-icon">✓</div>
        <div class="preview-text">
          <strong>All windows are optimized!</strong>
          <p>No changes needed.</p>
        </div>
      </div>
    `;
    applyBtn.disabled = true;
    return;
  }

  let html = '<div class="preview-result">';
  html += '<ul class="preview-list">';

  optimizationPlan.actions.forEach((action) => {
    if (action.type === 'merge') {
      html += `<li class="preview-item merge">
        <span class="preview-icon">🔗</span>
        <span>${action.description}</span>
      </li>`;
    } else {
      html += `<li class="preview-item split">
        <span class="preview-icon">✂️</span>
        <span>${action.description}</span>
      </li>`;
    }
  });

  html += '</ul></div>';
  previewDiv.innerHTML = html;
  applyBtn.disabled = false;
}

// Apply optimization
async function applyOptimization() {
  if (!optimizationPlan || optimizationPlan.actions.length === 0) {
    return;
  }

  try {
    const minTabs =
      parseInt(document.getElementById('minTabsPerWindow').value) || 5;
    const maxTabs =
      parseInt(document.getElementById('maxTabsPerWindow').value) || 15;

    // Handle merges first
    if (optimizationPlan.toMerge.length > 1) {
      const allTabsToMerge = [];

      // Collect all tabs from small windows
      for (const window of optimizationPlan.toMerge) {
        allTabsToMerge.push(...window.tabs.map((tab) => tab.id));
      }

      // Create new window with first tab
      const newWindow = await chrome.windows.create({
        tabId: allTabsToMerge[0]
      });

      // Move remaining tabs to new window
      if (allTabsToMerge.length > 1) {
        await chrome.tabs.move(allTabsToMerge.slice(1), {
          windowId: newWindow.id,
          index: -1
        });
      }
    }

    // Handle splits
    for (const window of optimizationPlan.toSplit) {
      const tabs = window.tabs;
      const chunks = [];

      // Split tabs into chunks
      for (let i = 0; i < tabs.length; i += maxTabs) {
        chunks.push(tabs.slice(i, i + maxTabs));
      }

      // Keep first chunk in current window, create new windows for others
      for (let i = 1; i < chunks.length; i++) {
        const chunk = chunks[i];
        const tabIds = chunk.map((t) => t.id);

        if (tabIds.length > 0) {
          const newWin = await chrome.windows.create({ tabId: tabIds[0] });
          if (tabIds.length > 1) {
            await chrome.tabs.move(tabIds.slice(1), {
              windowId: newWin.id,
              index: -1
            });
          }
        }
      }
    }

    showToast(
      `✓ Optimization complete! ${optimizationPlan.actions.length} action${
        optimizationPlan.actions.length !== 1 ? 's' : ''
      } applied`
    );

    // Close modal and reload
    closeOptimizeModal();
    setTimeout(() => loadTabs(), 500);
  } catch (error) {
    console.error('Optimization failed:', error);
    showToast('✗ Optimization failed', true);
  }
}

// Open optimize modal
function openOptimizeModal() {
  const modal = document.getElementById('optimizeModal');
  modal.classList.add('show');
  // Auto-generate preview when modal opens
  previewOptimization();
}

// Close optimize modal
function closeOptimizeModal() {
  const modal = document.getElementById('optimizeModal');
  modal.classList.remove('show');
  optimizationPlan = null;
}

// Setup scroll handler for sticky header
function setupScrollHandler() {
  const stickyHeader = document.getElementById('stickyHeader');
  let lastScrollTop = 0;

  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Add scrolled class when scrolled down more than 50px
    if (scrollTop > 50) {
      stickyHeader.classList.add('scrolled');
    } else {
      stickyHeader.classList.remove('scrolled');
    }

    lastScrollTop = scrollTop;
  });
}

// Utility: Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
