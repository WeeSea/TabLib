# 🗂️ TabLib - Advanced Tab Manager

A powerful Chrome extension for managing browser tabs with innovative multi-selection, search, and window organization features.

## ✨ Features

### 🎯 Multi-Selection Innovation
- **Checkbox Selection**: Click checkboxes for precise tab selection
- **Ctrl+Click**: Toggle individual tabs on/off
- **Shift+Click**: Range selection between two tabs
- **Select All in Window**: Quick selection of all tabs in a specific window
- **Visual Feedback**: Selected tabs are highlighted with clear visual indicators

### 🔍 Smart Search
- **Real-time Search**: Filter tabs by title or URL as you type
- **Search Results Counter**: See how many tabs match your query
- **Select All Results**: Quickly select all search results
- **Keyboard Shortcut**: Press `Ctrl+F` to focus search

### 🪟 Window Management
- **Visual Window Grouping**: All tabs organized by their windows
- **Active Window Indicator**: See which window is currently focused (🟢)
- **Tab Count**: Shows number of tabs in each window
- **Move to New Window**: Move selected tabs to a new window instantly

### ⌨️ Keyboard Shortcuts
- `Ctrl+Shift+Space` (or `Cmd+Shift+Space` on Mac): Open Tab Manager
- `Ctrl+F`: Focus search box
- `Ctrl+A`: Select all visible tabs
- `Delete`: Close selected tabs
- `Escape`: Clear search or deselect all

### 🎨 Modern UI
- Clean, intuitive interface
- Responsive design
- Smooth animations
- Tab favicons and previews
- Color-coded windows

## 📦 Installation

### Method 1: Load Unpacked Extension (Development)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `TabLib` folder
5. The extension is now installed!

### Method 2: Create ZIP and Install

1. Zip the entire TabLib folder
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode**
4. Drag and drop the ZIP file onto the extensions page

## 🚀 Usage

### Opening the Tab Manager
- Press `Ctrl+Shift+Space` (Windows/Linux) or `Cmd+Shift+Space` (Mac)
- Or click the TabLib icon in your Chrome toolbar

### Selecting Tabs
1. **Single Selection**: Click checkbox or Ctrl+Click on a tab
2. **Range Selection**: Click one tab, hold Shift, click another tab
3. **Select All**: Click "Select All" button or press Ctrl+A
4. **Select Window**: Click "Select All in Window" for a specific window

### Searching Tabs
1. Type in the search box (or press Ctrl+F)
2. Tabs are filtered in real-time
3. Select all search results if needed
4. Move or close them together

### Moving Tabs
1. Select the tabs you want to move
2. Click "Move to New Window"
3. All selected tabs move to a new window together

### Closing Tabs
1. Select the tabs you want to close
2. Click "Close Selected" or press Delete
3. Confirm if needed

## 🛠️ Technical Details

### File Structure
```
TabLib/
├── manifest.json          # Extension configuration
├── background.js          # Background service worker
├── tabmanager.html        # Main UI
├── tabmanager.js          # Tab management logic
├── styles.css             # Styling
├── icon16.svg             # 16x16 icon
├── icon48.svg             # 48x48 icon
└── icon128.svg            # 128x128 icon
```

### Permissions Used
- `tabs`: Read and manage browser tabs
- `tabGroups`: Support for tab groups (future feature)

### Browser Compatibility
- Chrome 88+ (Manifest V3)
- Edge 88+ (Chromium-based)

## 🔧 Customization

### Changing Keyboard Shortcut
1. Go to `chrome://extensions/shortcuts`
2. Find "TabLib - Advanced Tab Manager"
3. Click the edit icon and set your preferred shortcut

### Modifying the Code
Feel free to customize the extension:
- Edit `styles.css` for visual changes
- Modify `tabmanager.js` for functionality changes
- Update `manifest.json` for configuration changes

## 🐛 Troubleshooting

### Extension doesn't load
- Make sure all files are in the same directory
- Check Chrome DevTools console for errors
- Verify manifest.json is valid JSON

### Keyboard shortcut doesn't work
- Check `chrome://extensions/shortcuts` for conflicts
- Some shortcuts may be reserved by Chrome
- Try a different key combination

### Tabs don't appear
- Refresh the extension page
- Check Chrome permissions
- Restart Chrome

## 📝 Future Enhancements

- [ ] Drag and drop tab reordering
- [ ] Tab groups support
- [ ] Save/restore tab sessions
- [ ] Export tab lists
- [ ] Dark mode
- [ ] Duplicate tab detection
- [ ] Memory usage indicators
- [ ] Tab suspension for memory saving

## 📄 License

MIT License - feel free to use and modify!

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

---

Made with ❤️ for better tab management
