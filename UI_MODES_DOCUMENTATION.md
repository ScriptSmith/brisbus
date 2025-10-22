# UI Modes Documentation

## Overview
This application now supports 4 different UI layout modes that users can switch between based on their preferences and device type.

## UI Mode Selector
- **Location**: Top-right corner of the screen (⚙️ gear icon)
- **Persistence**: Selected mode is saved to `localStorage` and restored on page reload
- **Shortcut**: Click the gear icon to see all available modes

## Available Modes

### 1. Classic Mode (Default)
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

## Implementation Details

### CSS Classes
- `.ui-mode`: Base class for all UI mode containers
- `.ui-mode.active`: Currently active UI mode (only one at a time)
- `.toggle-btn.active`: Active toggle button state
- `.hamburger-menu.open`: Expanded hamburger menu
- `.slideshow-controls-hidden`: Hidden slideshow controls
- `body.bottombar-mode`: Body class when bottom bar mode is active

### JavaScript Functions
- `switchUIMode(mode)`: Switch to a different UI mode
- `syncUIState()`: Synchronize state across all UI modes
- `bindEventHandlers()`: Bind event handlers for active mode
- `getActiveElements()`: Get element references for current mode

### Storage
- **Key**: `uiMode`
- **Values**: `'classic'`, `'hamburger'`, `'grouped'`, `'bottombar'`
- **Location**: `localStorage`

## Browser Compatibility
- Modern browsers with ES6+ support
- localStorage support required for mode persistence
- CSS Grid and Flexbox required for layouts
- Tested on Chrome, Firefox, Safari, Edge

## Mobile Considerations
- Bottom Bar mode is recommended for mobile devices
- Touch targets are at least 44x44px in bottom bar mode
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
9. **Gesture Controls**: Swipe gestures in bottom bar mode
10. **Widget Mode**: Minimal view for embedding
