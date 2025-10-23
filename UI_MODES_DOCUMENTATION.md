# UI Modes Documentation

## Overview
This application now supports **5 different UI layout modes** that users can switch between based on their preferences and device type. The **Adaptive mode** is the new default and automatically adjusts between desktop and mobile layouts.

## UI Mode Selector
- **Location**: Top-right corner of the screen (⚙️ gear icon)
- **Persistence**: Selected mode is saved to `localStorage` and restored on page reload
- **Shortcut**: Click the gear icon to see all available modes

## Available Modes

### 0. Adaptive Mode (NEW DEFAULT) ⭐
**Best for**: Everyone! Automatically adapts to your device

**Features**:
- **Desktop (≥769px)**: Hamburger menu with organized sections
- **Mobile (≤768px)**: Bottom bar with most-used actions + "More" menu
- Automatically switches layout based on screen size
- No manual configuration needed
- Best user experience across all devices

**Desktop Layout (≥769px)**:
```
[Filter input                    ] [×] [🔄] [☰]

When hamburger expanded:
────────────────────────────────
Data & Updates
☐ Auto-refresh (10s) ⏱️

Map Display
☑ Show route lines 🛣️
☑ Snap trails to routes 🧲

Animation & View
☐ Smooth animation 🎞️
☐ Track my location 📍
☐ Slideshow mode 🎬
```

**Mobile Layout (≤768px)**:
```
[Filter input              ]

[Bottom Bar]
┌─────────┬─────────┬─────────┬─────────┐
│   🔄    │   ⏱️    │   📍    │   ⋯    │
│ Refresh │  Auto   │ Locate  │  More   │
└─────────┴─────────┴─────────┴─────────┘

"More" opens slide-up menu with:
- Route lines toggle
- Snap trails toggle
- Smooth animation toggle
- Slideshow mode toggle
```

### 1. Classic Mode
**Best for**: Desktop users who want all controls immediately visible

**Features**:
- All 7 buttons displayed in a single row
- Original layout that existing users are familiar with
- Quick access to all features without any menus
- Filter input at the top

**Layout**:
```
[Filter input                    ] [×]
[🔄] [⏱️] [📍] [🛣️] [🧲] [🎞️] [🎬]
```

### 2. Compact Menu Mode (Hamburger)
**Best for**: Users who want a cleaner interface with optional settings hidden

**Features**:
- Only filter input and refresh button always visible
- Hamburger menu (☰) button to expand/collapse settings
- Settings organized into 3 logical sections:
  - **Data & Updates**: Auto-refresh
  - **Map Display**: Route lines, Snap trails
  - **Animation & View**: Smooth animation, Location tracking, Slideshow
- Checkbox-based controls for easy toggling

**Layout (Collapsed)**:
```
[Filter input                    ] [×] [🔄] [☰]
```

**Layout (Expanded)**:
```
[Filter input                    ] [×] [🔄] [☰✓]

Data & Updates
☐ Auto-refresh (10s) ⏱️

Map Display
☑ Show route lines 🛣️
☑ Snap trails to routes 🧲

Animation & View
☐ Smooth animation 🎞️
☐ Track my location 📍
☐ Slideshow mode 🎬
```

### 3. Grouped Toolbar Mode
**Best for**: Users who want visual organization of related controls

**Features**:
- Buttons grouped into 3 categories with labels
- Clear visual separation between different control types
- All buttons visible but organized
- Better visual hierarchy

**Layout**:
```
[Filter input                              ] [×]

┌─────────┐  ┌──────────┐  ┌────────┐
│  Data   │  │ Display  │  │  View  │
│ [🔄][⏱️]│  │[🛣️][🧲] │  │[📍][🎞️]│
│         │  │          │  │  [🎬]  │
└─────────┘  └──────────┘  └────────┘
```

### 4. Bottom Bar Mode (Mobile-Optimized)
**Best for**: Mobile devices and touch interfaces

**Features**:
- Minimal top UI with just filter input and time info
- Persistent bottom action bar with most-used actions
- "More" button opens slide-up modal with additional options
- Large touch targets optimized for mobile
- Labels under icons for clarity

**Layout**:
```
[Top UI with filter]

[Bottom Bar]
┌─────────┬─────────┬─────────┬─────────┐
│   🔄    │   ⏱️    │   📍    │   ⋯    │
│ Refresh │  Auto   │ Locate  │  More   │
└─────────┴─────────┴─────────┴─────────┘
```

**More Menu (Slide-up)**:
```
Display Options                       [×]
─────────────────────────────────────────
☑ 🛣️ Route lines
☑ 🧲 Snap trails
☐ 🎞️ Smooth animation
☐ 🎬 Slideshow
```

## State Synchronization

All UI modes share the same application state. This means:
- Changing a setting in one mode updates all other modes
- Filter text is synchronized across all modes
- Toggle states (auto-refresh, routes, etc.) are consistent
- Switching modes doesn't reset your settings
- **Adaptive mode**: Desktop and mobile views share the same state seamlessly

## Responsive Breakpoints

### Adaptive Mode
- **Desktop**: `@media (min-width: 769px)` - Shows hamburger menu
- **Mobile**: `@media (max-width: 768px)` - Shows bottom bar
- Automatically adapts when window is resized

### Other Modes
- Classic, Compact Menu, Grouped Toolbar, and Bottom Bar modes do not auto-adapt
- They maintain the same layout regardless of screen size
- Responsive styling still applies for smaller screens within each mode

## Implementation Details

### CSS Classes
- `.ui-mode`: Base class for all UI mode containers
- `.ui-mode.active`: Currently active UI mode (only one at a time)
- `.toggle-btn.active`: Active toggle button state
- `.hamburger-menu.open`: Expanded hamburger menu
- `.adaptive-menu.open`: Expanded adaptive mode menu (desktop)
- `.adaptive-bottom-bar`: Mobile bottom bar (adaptive mode)
- `.adaptive-more-menu`: Mobile more menu (adaptive mode)
- `.slideshow-controls-hidden`: Hidden slideshow controls
- `body.adaptive-mode`: Body class when adaptive mode is active
- `body.bottombar-mode`: Body class when bottom bar mode is active

### JavaScript Functions
- `switchUIMode(mode)`: Switch to a different UI mode
- `syncUIState()`: Synchronize state across all UI modes
- `bindEventHandlers()`: Bind event handlers for active mode
- `getActiveElements()`: Get element references for current mode

### Storage
- **Key**: `uiMode`
- **Values**: `'adaptive'` (default), `'classic'`, `'hamburger'`, `'grouped'`, `'bottombar'`
- **Location**: `localStorage`

## Browser Compatibility
- Modern browsers with ES6+ support
- localStorage support required for mode persistence
- CSS Grid and Flexbox required for layouts
- Tested on Chrome, Firefox, Safari, Edge

## Mobile Considerations
- **Adaptive mode** is recommended and is the default
- Automatically uses bottom bar on mobile devices (≤768px)
- Automatically uses hamburger menu on desktop (≥769px)
- Touch targets are at least 44x44px in bottom bar modes
- Slide-up menus use native scrolling
- Responsive breakpoints adjust all modes for smaller screens

## Future Enhancements

Potential features that could be added:
1. **Keyboard Shortcuts**: Press `?` to see available shortcuts
2. **Quick Filters**: Preset filters for route types
3. **Favorites System**: Save frequently used routes
4. **Custom Themes**: Day/night mode, custom colors
5. **Compact Stats**: Floating stats overlay
6. **Route Search**: Autocomplete search
7. **History**: Recent routes/searches
8. **URL Sharing**: Share current view via URL parameters
9. **Gesture Controls**: Swipe gestures in bottom bar modes
10. **Widget Mode**: Minimal view for embedding
11. **Custom Breakpoints**: User-configurable desktop/mobile threshold
12. **Tablet Mode**: Optimized layout for tablet-sized devices
