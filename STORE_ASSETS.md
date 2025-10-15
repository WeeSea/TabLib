# Chrome Web Store Assets Guide

## Required Assets Checklist

### Icons (REQUIRED)
- [ ] 16x16px PNG (icon16.png) - Transparent background
- [ ] 48x48px PNG (icon48.png) - Transparent background
- [ ] 128x128px PNG (icon128.png) - Transparent background

### Store Listing Graphics (REQUIRED)
- [ ] Small Promotional Tile: 440x280px PNG (NO transparency)
- [ ] Screenshots: 1-5 images (1280x800px recommended)

### Optional but Recommended
- [ ] Marquee Promotional Tile: 1400x560px PNG
- [ ] Feature Graphic: 1280x800px PNG

---

## 1. Converting SVG Icons to PNG

### Current SVG Icons
You have three SVG files:
- icon16.svg
- icon48.svg
- icon128.svg

### Option A: Online Conversion Tools
1. **CloudConvert** (https://cloudconvert.com/svg-to-png)
   - Upload SVG
   - Set width to target size (16, 48, or 128)
   - Ensure transparent background
   - Download PNG

2. **SVG to PNG** (https://svgtopng.com/)
   - Drag and drop SVG
   - Adjust size
   - Download

3. **Convertio** (https://convertio.co/svg-png/)
   - Upload file
   - Convert to PNG
   - Download

### Option B: Command Line (ImageMagick)
```bash
# Install ImageMagick first
# Windows: choco install imagemagick
# Mac: brew install imagemagick
# Linux: sudo apt-get install imagemagick

# Convert with transparency
magick icon16.svg -resize 16x16 -background none icons/icon16.png
magick icon48.svg -resize 48x48 -background none icons/icon48.png
magick icon128.svg -resize 128x128 -background none icons/icon128.png
```

### Option C: Using Figma/Adobe Illustrator/Inkscape
1. Open SVG in your design tool
2. Export as PNG
3. Set appropriate dimensions
4. Enable transparent background
5. Use 2x resolution for clarity

### Creating Icons Folder
```bash
mkdir icons
# Move converted PNGs into icons/ folder
```

---

## 2. Small Promotional Tile (440x280px)

### Requirements
- **Size**: 440x280px
- **Format**: PNG or JPEG
- **Background**: NO transparency (use solid color or gradient)
- **Content**: Show extension name, icon, and key feature

### Design Tips
```
┌────────────────────────────────────┐
│  🗂️  TabLib                        │
│  Advanced Tab Manager               │
│                                     │
│  ✓ Smart Search                    │
│  ✓ Multi-Selection                 │
│  ✓ Window Optimization             │
└────────────────────────────────────┘
```

### Tools to Create
1. **Canva** (https://canva.com)
   - Create custom size: 440x280px
   - Use templates or start blank
   - Add text, icons, and branding
   - Download as PNG

2. **Figma** (https://figma.com) - Free
   - Professional design tool
   - Create frame 440x280px
   - Export as PNG

3. **Photoshop/GIMP**
   - New document 440x280px
   - Design promotional image
   - Save as PNG

### Design Elements
- **Background**: Use brand color (#1a73e8 from your icon)
- **Logo**: Your 128px icon
- **Headline**: "TabLib - Advanced Tab Manager"
- **Tagline**: "Manage hundreds of tabs effortlessly"
- **Features**: 3-4 bullet points with icons
- **Font**: Sans-serif, readable (16-24px)

### Quick Template (HTML/CSS)
```html
<!-- Create this, screenshot at 440x280, crop -->
<div style="width: 440px; height: 280px; background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%); padding: 30px; color: white; font-family: Arial;">
  <div style="font-size: 32px; font-weight: bold; margin-bottom: 10px;">
    🗂️ TabLib
  </div>
  <div style="font-size: 18px; margin-bottom: 20px; opacity: 0.9;">
    Advanced Tab Manager
  </div>
  <div style="font-size: 14px; line-height: 2;">
    ✓ Smart Fuzzy Search<br>
    ✓ Multi-Selection<br>
    ✓ Window Optimization<br>
    ✓ 100% Privacy First
  </div>
</div>
```

---

## 3. Screenshots (1280x800px)

### Requirements
- **Size**: Minimum 640x400px, recommended 1280x800px
- **Count**: 1-5 screenshots
- **Format**: PNG or JPEG
- **Content**: Show actual extension interface

### Recommended Screenshots

#### Screenshot 1: Main Interface
- Show full tab manager with multiple windows
- Display search bar
- Show selected tabs
- Capture: The main dashboard view

#### Screenshot 2: Search Feature
- Show fuzzy search in action
- Highlight matching results
- Display search counter
- Capture: Search input with results

#### Screenshot 3: Multi-Selection
- Show multiple tabs selected (checkboxes checked)
- Highlight selection count
- Display action buttons (Move, Close, Copy)
- Capture: Tab selection workflow

#### Screenshot 4: Window Optimization
- Show optimization modal
- Display planned changes preview
- Capture: Optimize windows feature

#### Screenshot 5: Compact vs Normal View
- Side-by-side or before/after
- Show different view modes
- Capture: View mode comparison

### How to Capture Screenshots

#### Method 1: Browser Built-in
1. Open extension (press Ctrl+Shift+Space)
2. Press F12 (Developer Tools)
3. Click device toggle (Ctrl+Shift+M)
4. Set dimensions to 1280x800
5. Click three dots > Capture screenshot

#### Method 2: Windows Snipping Tool
1. Open extension
2. Press Win+Shift+S
3. Select area
4. Paste in image editor
5. Resize to 1280x800

#### Method 3: Mac Screenshot
1. Press Cmd+Shift+4
2. Press Space to capture window
3. Click extension window
4. Resize to 1280x800 in Preview

#### Method 4: Chrome Extension
- Install "Full Page Screen Capture"
- Capture entire extension page
- Crop to 1280x800

### Annotate Screenshots
Add helpful annotations:
- Arrows pointing to key features
- Text labels explaining functionality
- Highlight important buttons
- Circle areas of interest

**Tools:**
- Snagit
- Skitch
- Photoshop
- Preview (Mac)
- Paint.NET (Windows)

### Screenshot Composition Tips
1. **Show real data**: Use realistic tab names, not "test1, test2"
2. **Variety**: Different numbers of tabs, windows
3. **Clean**: Close unnecessary windows, hide bookmarks bar
4. **Readable**: Ensure text is legible
5. **Consistent**: Use same zoom level across screenshots
6. **Professional**: No personal/sensitive info

---

## 4. Marquee Promotional Tile (1400x560px) - Optional

### Requirements
- **Size**: 1400x560px exactly
- **Format**: PNG or JPEG
- **Background**: Can have transparency
- **Purpose**: Featured placement in Chrome Web Store

### Design Layout
```
┌──────────────────────────────────────────────────┐
│                                                    │
│   🗂️ TabLib - Advanced Tab Manager              │
│   ───────────────────────────────────             │
│                                                    │
│   Manage hundreds of tabs effortlessly with       │
│   smart search, multi-selection & automation      │
│                                                    │
│   [Screenshot Preview]  [Key Features List]       │
│                                                    │
└──────────────────────────────────────────────────┘
```

### Design Tips
- Hero image style
- Include product screenshot or mockup
- Large, bold headline
- 3-5 key benefits
- Professional, polished look
- Brand colors consistent

---

## 5. Creating Professional Assets Without Design Skills

### Template Resources
1. **Canva Chrome Extension Templates**
   - Search "Chrome extension promo"
   - Customize with your colors/text
   - Download PNG

2. **Placeit** (https://placeit.net)
   - Pre-made extension mockups
   - Browser window templates
   - Professional screenshots

3. **Figma Community**
   - Search "chrome extension store assets"
   - Duplicate community templates
   - Customize for TabLib

### DIY Quick Method
1. **Take clean screenshots** of your extension working
2. **Add text overlays** with:
   - Extension name
   - Key feature callouts
   - Arrows/highlights
3. **Use consistent colors** from your brand
4. **Keep it simple** - don't over-design

### Hire a Designer (Budget Options)
- **Fiverr**: $5-50 for store graphics
- **99designs**: Design contests
- **Upwork**: Freelance designers
- **Dribbble**: Hire from portfolios

### AI Design Tools
- **Midjourney**: AI-generated backgrounds
- **DALL-E**: Create unique graphics
- **Looka**: Logo and brand assets

---

## 6. Asset Checklist Summary

### Before Submission
- [ ] All icons converted to PNG (16, 48, 128)
- [ ] Icons placed in `icons/` folder
- [ ] Manifest.json updated with correct icon paths
- [ ] Small promotional tile created (440x280)
- [ ] At least 3 screenshots captured (1280x800)
- [ ] Screenshots show key features clearly
- [ ] All images are high quality, not blurry
- [ ] No personal/sensitive information visible
- [ ] Colors consistent with brand
- [ ] Text is readable and professional

### Quality Check
- [ ] Icons look sharp at all sizes
- [ ] Promotional tile has no transparency
- [ ] Screenshots accurately represent features
- [ ] All text is properly spelled
- [ ] Images meet size requirements exactly
- [ ] File sizes reasonable (under 5MB each)
- [ ] PNG format used (preferred over JPEG)

---

## 7. File Organization

### Recommended Structure
```
TabLib/
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── store_assets/
│   ├── promotional_tile_440x280.png
│   ├── screenshot1_main_interface.png
│   ├── screenshot2_search_feature.png
│   ├── screenshot3_multi_select.png
│   ├── screenshot4_optimization.png
│   └── screenshot5_view_modes.png
├── manifest.json
├── background.js
└── ... (other extension files)
```

### Naming Convention
- Use descriptive names
- Include dimensions in filename
- Use lowercase with underscores
- Example: `screenshot_search_1280x800.png`

---

## 8. Common Mistakes to Avoid

❌ **Low resolution images** - Blurry, pixelated
❌ **Wrong dimensions** - Must be exact sizes
❌ **Transparency on promo tile** - Use solid background
❌ **Personal info visible** - Redact emails, names
❌ **Fake screenshots** - Must show actual extension
❌ **Inconsistent branding** - Colors, fonts should match
❌ **Poor contrast** - Text hard to read
❌ **Too much text** - Keep it concise
❌ **Outdated screenshots** - Update with each version
❌ **Generic stock photos** - Show your actual product

---

## 9. Quick Start Commands

### Create folders
```bash
mkdir icons
mkdir store_assets
```

### Convert SVGs (if you have ImageMagick)
```bash
magick icon16.svg -resize 16x16 -background none icons/icon16.png
magick icon48.svg -resize 48x48 -background none icons/icon48.png
magick icon128.svg -resize 128x128 -background none icons/icon128.png
```

### Update manifest paths
Update `manifest.json` to point to `icons/` folder for all icon references.

---

## 10. Resources & Tools

### Free Design Tools
- Figma: https://figma.com
- Canva: https://canva.com
- GIMP: https://gimp.org
- Inkscape: https://inkscape.org
- Photopea: https://photopea.com (online Photoshop)

### Screenshot Tools
- Awesome Screenshot (Chrome extension)
- Lightshot: https://app.prntscr.com
- ShareX (Windows): https://getsharex.com
- Kap (Mac): https://getkap.co

### Image Optimization
- TinyPNG: https://tinypng.com
- ImageOptim (Mac): https://imageoptim.com
- Squoosh: https://squoosh.app

### Color Tools
- Coolors: https://coolors.co (palette generator)
- Adobe Color: https://color.adobe.com
- ColorZilla (eyedropper): Chrome extension

### Inspiration
- Chrome Web Store: Browse successful extensions
- Dribbble: https://dribbble.com
- Behance: https://behance.net
- Product Hunt: https://producthunt.com

---

## Need Help?

If you're stuck on creating assets:
1. Start with basic screenshots - they're most important
2. Use Canva templates for promotional tile
3. Keep it simple and clean
4. Focus on showing the product clearly
5. Consider hiring on Fiverr for $10-20 if needed

**Remember**: Quality matters more than quantity. 3 excellent screenshots > 5 mediocre ones.

Good luck! 🎨
