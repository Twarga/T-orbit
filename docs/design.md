# Cosmic Watch - Design System & UI/UX Specification

## Project Overview

**Cosmic Watch** is a real-time satellite tracking web application that visualizes Earth's satellites in 3D using CesiumJS. Built as a hobby project with a simple stack (SQLite + Node.js + React + CesiumJS) deployable on a single VPS.

**Target Users:** Space enthusiasts, students, hobbyists interested in satellite tracking

**Platform:** Web browser (desktop first, mobile responsive)

**Design Style:** Dark space-themed, minimal, data-focused, futuristic but clean

---

## Design System

### Color Palette

```
Background Colors:
├─ Primary:      #0a0a0f (deep space black)
├─ Secondary:    #12121a (dark charcoal)
├─ Tertiary:     #1a1a25 (light charcoal)
└─ Card BG:      rgba(20, 20, 30, 0.95) (semi-transparent)

Accent Colors:
├─ Cyan:         #00d4ff (primary accent - satellites, buttons)
├─ Purple:       #8b5cf6 (secondary accent - solar system)
├─ Orange:       #f59e0b (warnings, highlights)
├─ Red:          #ff4444 (ISS, alerts)
└─ Blue:         #3b82f6 (active states, tracking)

Text Colors:
├─ Primary:      #ffffff (main text)
├─ Secondary:    #a1a1aa (secondary text, labels)
└─ Muted:        #71717a (tertiary, disabled)

Status Colors:
├─ Success:      #10b981
├─ Warning:      #f59e0b
└─ Error:        #ef4444
```

### Typography

```
Primary Font: 'Inter', system-ui, sans-serif
Display Font: 'Orbitron', sans-serif (logos, headers)
Code Font: 'JetBrains Mono', monospace (coordinates, data)

Scale:
├─ xs:   0.75rem  (12px) - labels, metadata
├─ sm:   0.875rem (14px) - secondary text
├─ base: 1rem     (16px) - body text
├─ lg:   1.125rem (18px) - cards
├─ xl:   1.25rem  (20px) - subtitles
└─ 2xl:  1.5rem   (24px) - headers
```

### Spacing System

```
├─ 1:  0.25rem (4px)
├─ 2:  0.5rem  (8px)
├─ 3:  0.75rem (12px)
├─ 4:  1rem    (16px)
├─ 5:  1.25rem (20px)
├─ 6:  1.5rem  (24px)
└─ 8:  2rem    (32px)
```

### Border Radius

```
├─ sm: 4px  (buttons, small elements)
├─ md: 6px  (cards, inputs)
├─ lg: 8px  (panels)
└─ xl: 12px (modals, large cards)
```

### Shadows & Elevation

```
├─ Card:     0 4px 6px rgba(0, 0, 0, 0.3)
├─ Floating: 0 8px 16px rgba(0, 0, 0, 0.4)
└─ Glow:     0 0 20px rgba(0, 212, 255, 0.3)
```

---

## Layout Structure

### Main Application Layout

```
┌─────────────────────────────────────────────────────────┐
│  HEADER (fixed, 64px height)                           │
│  ┌─────────────────┬───────────────────────────────┐   │
│  │ Logo + Title    │ View Toggle + Controls        │   │
│  └─────────────────┴───────────────────────────────┘   │
├──────────────┬──────────────────────────────────────────┤
│              │                                          │
│  LEFT PANEL  │           MAIN VIEWPORT                  │
│  (optional)  │         (Full screen Cesium              │
│              │           or Solar Navigator)            │
│              │                                          │
│              │                                          │
│              │                                          │
│              │                                          │
│              ├──────────────────────────────────────────┤
│              │   RIGHT SIDEBAR (280px, collapsible)    │
│              │   ┌────────────────────────────────┐    │
│              │   │ Satellite List / Planet List   │    │
│              │   │                                │    │
│              │   │ [Item 1]                       │    │
│              │   │ [Item 2]                       │    │
│              │   │ [Item 3]                       │    │
│              │   │ ...                            │    │
│              │   └────────────────────────────────┘    │
│              └──────────────────────────────────────────┘
└─────────────────────────────────────────────────────────┘
```

### Responsive Breakpoints

```
├─ Mobile:   < 768px  (single column, hide sidebar)
├─ Tablet:   768-1024px (collapsible sidebar)
└─ Desktop:  > 1024px (full layout)
```

---

## Screens & Views

### 1. Landing Page

**Purpose:** Introduction and entry point

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    🛰️ COSMIC WATCH                     │
│                                                         │
│              Real-time Satellite Tracking               │
│                                                         │
│         Track thousands of satellites orbiting          │
│              Earth with live TLE data                   │
│                                                         │
│              ┌─────────────────────┐                    │
│              │   ENTER APP →       │                    │
│              └─────────────────────┘                    │
│                                                         │
│  Features:                                              │
│  ├── 🌍 3D Globe Visualization                         │
│  ├── 🛰️ Live Satellite Positions                      │
│  ├── 🎯 ISS Tracking                                   │
│  └── 🪐 Solar System Navigator                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Components:**
- Hero section with animated globe background (optional)
- Feature cards (4 cards in grid)
- CTA button (primary cyan)

**Interactions:**
- Hover on CTA button: scale 1.05, glow effect
- Scroll animation for feature cards

---

### 2. Mission Control (Main App)

**Purpose:** Primary satellite tracking interface

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ 🛰️ Cosmic Watch    [🪐 Solar]  [◉ Orbits]  Active: 6  │
├──────────────┬──────────────────────────────────────────┤
│              │                                          │
│ ┌──────────┐ │                                          │
│ │ ISS CARD │ │         3D GLOBE                         │
│ │          │ │         (CesiumJS)                       │
│ │ 🔴 ISS   │ │                                          │
│ │ LAT LON  │ │         • Satellites as points          │
│ │ [Focus]  │ │         • Orbital trails (toggleable)   │
│ └──────────┘ │         • ISS highlighted in red        │
│              │                                          │
│              │                                          │
│              ├──────────────────────────────┐           │
│              │ SATELLITES             ▲ 6  │           │
│              ├──────────────────────────────┤           │
│              │ NOAA 19           #25338     │           │
│              │ ISS (ZARYA)       #25544     │           │
│              │ BEIDOU-2 G7       #37841     │           │
│              │ GPS BIIR-2        #39533     │           │
│              │ STARLINK 1007     #44713     │           │
│              │ STARLINK 1013     #44719     │           │
│              └──────────────────────────────┘           │
└─────────────────────────────────────────────────────────┘
```

**Components:**

#### Header (64px height, fixed)
- Logo + Title (left)
- View toggle button (switch to Solar Navigator)
- Orbit trails toggle
- Active satellite count

#### ISS Tracking Card (floating, top-left)
- Red indicator icon (🔴 static, 🔵 when tracking)
- Satellite name + NORAD ID
- Real-time telemetry (LAT, LON, ALT)
- Focus/Tracking toggle button

**Button States:**
- Default: `rgba(255, 68, 68, 0.2)` bg, red border
- Active Tracking: `rgba(59, 130, 246, 0.3)` bg, blue border, "✕ Stop Tracking"

#### 3D Globe (CesiumJS)
- Full viewport minus header
- Earth with day/night lighting
- Satellites rendered as:
  - ISS: Red point (12px) with label
  - Others: Cyan points (6px) with labels
  - Orbital trails: Glowing lines (toggleable)

**Camera Interactions:**
- Zoom: Mouse wheel
- Pan: Right-click drag
- Rotate: Left-click drag
- Double-click satellite: Focus on it

#### Right Sidebar (280px, fixed)
- Header: "Satellites" + count badge
- Scrollable list of satellites
- Each item: Name (left), NORAD ID (right)
- Click item: Select (highlight background)
- Selected item: Blue left border, highlighted bg

**List Item States:**
- Default: transparent bg
- Hover: `rgba(255,255,255,0.05)` bg
- Selected: `rgba(0, 212, 255, 0.15)` bg, left border

---

### 3. Solar Navigator View

**Purpose:** Explore solar system and planet positions

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ 🪐 Solar Navigator    [🛰️ Satellites]                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌────────────────────────────────────────────────┐    │
│  │          ORBIT VISUALIZATION                   │    │
│  │                                                 │    │
│  │    ☿     ♀       🌍♂       ♃       ♄          │    │
│  │    Mercury  Venus  Earth Mars  Jupiter Saturn  │    │
│  │                                                 │    │
│  └────────────────────────────────────────────────┘    │
│                                                         │
│  PLANET LIST                           Selected Info   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ☉ Sun        0 AU                               │   │
│  │ ☿ Mercury    0.39 AU                            │   │
│  │ ♀ Venus      0.72 AU              ┌──────────┐  │   │
│  │ 🌍 Earth     1.00 AU              │  EARTH   │  │   │
│  │ ♂ Mars       1.52 AU              │          │  │   │
│  │ ♃ Jupiter    5.20 AU              │ Distance:│  │   │
│  │ ♄ Saturn     9.58 AU              │ 1 AU     │  │   │
│  │ ♅ Uranus     19.2 AU              │          │  │   │
│  │ ♆ Neptune    30.1 AU              │ From Sun │  │   │
│  │ ☾ Moon       384,400 km           └──────────┘  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Components:**

#### Orbit Visualization
- Horizontal scrollable area
- Sun centered (larger, 40px)
- Planets positioned by relative distance
- Click planet to select

#### Planet List
- Icon + Name + Distance from Sun
- Click to select
- Selected: Highlighted background

#### Info Panel (when planet selected)
- Planet name (large)
- Distance from Sun
- Distance from Earth (calculated)
- Additional facts (future)

**Color Coding:**
- Sun: #FDB813 (yellow-orange)
- Mercury: #B5B5B5 (gray)
- Venus: #E6C87A (pale yellow)
- Earth: #6B93D6 (blue)
- Mars: #C1440E (red)
- Jupiter: #D8CA9D (tan)
- Saturn: #F4D59E (pale gold)
- Uranus: #D1F3F6 (pale cyan)
- Neptune: #5B5DDF (blue-purple)
- Moon: #C0C0C0 (silver)

---

### 4. SME Sidebar Panel (Future - CW-019)

**Purpose:** Curated satellite metadata for Subject Matter Experts

**Layout:**
```
┌────────────────────────────┐
│ SME EDIT MODE        [💾] │
├────────────────────────────┤
│ Satellite: ISS (ZARYA)     │
│ NORAD ID: 25544            │
├────────────────────────────┤
│ Summary:                   │
│ ┌────────────────────────┐ │
│ │ [Text area for summary]│ │
│ │                        │ │
│ └────────────────────────┘ │
├────────────────────────────┤
│ Owner:                     │
│ [Roscosmos/NASA]           │
├────────────────────────────┤
│ Mission Type:              │
│ [Space Station ▼]          │
├────────────────────────────┤
│ Status:                    │
│ [● Active ○ Deorbited]    │
├────────────────────────────┤
│ Fun Facts:                 │
│ ┌────────────────────────┐ │
│ │ - Largest human-made   │ │
│ │   object in orbit      │ │
│ │ - Visible from Earth   │ │
│ └────────────────────────┘ │
├────────────────────────────┤
│ [Save Changes]             │
└────────────────────────────┘
```

**Components:**
- Edit mode toggle
- Form fields for metadata
- Save button with loading state
- Validation indicators

---

## Components Library

### Buttons

#### Primary Button
```
Background: #00d4ff
Text: #000000
Padding: 0.5rem 1rem
Border-radius: 6px
Hover: scale(1.05), brightness(1.1)
Active: scale(0.98)
Disabled: opacity(0.5)
```

#### Secondary Button
```
Background: rgba(255,255,255,0.1)
Border: 1px solid rgba(255,255,255,0.2)
Text: #ffffff
Padding: 0.4rem 0.8rem
Border-radius: 6px
Hover: background rgba(255,255,255,0.15)
```

#### Toggle Button
```
Background (off): rgba(255,255,255,0.1)
Background (on): rgba(0, 212, 255, 0.3)
Border: 1px solid rgba(255,255,255,0.2)
Text: #ffffff
Icon: ◉ / ○
```

### Cards

#### Info Card (ISS Card)
```
Background: rgba(20, 20, 30, 0.95)
Border: 1px solid rgba(255, 68, 68, 0.5)
Border-radius: 12px
Padding: 1rem
Min-width: 200px
Box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4)
```

#### List Item Card
```
Background: rgba(255,255,255,0.05)
Border-radius: 6px
Padding: 0.5rem
Hover: rgba(255,255,255,0.08)
Selected: rgba(0, 212, 255, 0.15) + left border
```

### Inputs

#### Text Input
```
Background: rgba(255,255,255,0.05)
Border: 1px solid rgba(255,255,255,0.1)
Border-radius: 6px
Padding: 0.5rem 0.75rem
Text: #ffffff
Placeholder: #71717a
Focus: border-color #00d4ff
```

#### Textarea
```
Same as input
Min-height: 100px
Resize: vertical
```

### Loading States

#### Spinner
```
Size: 40px
Border: 3px solid rgba(0, 212, 255, 0.3)
Border-top: 3px solid #00d4ff
Border-radius: 50%
Animation: spin 1s linear infinite
```

#### Skeleton Loader
```
Background: linear-gradient(90deg, #1a1a25 25%, #252535 50%, #1a1a25 75%)
Background-size: 200% 100%
Animation: shimmer 1.5s infinite
Border-radius: 4px
```

---

## Interactions & Animations

### Page Transitions
```
Landing → App: Fade in (300ms ease-out)
View Switch: Cross-fade (200ms)
```

### Camera Animations
```
Focus Satellite: Fly-to (2s ease-in-out)
  - Starting altitude: Current
  - End altitude: 3,000 km
  - Orientation: Top-down (-90° pitch)
```

### UI Animations
```
Hover: 200ms ease-out
  - Scale: 1.0 → 1.02 (buttons)
  - Background: fade (100ms)

Click: 100ms ease-out
  - Scale: 1.0 → 0.98 → 1.0

Sidebar Slide: 300ms ease-out
  - Transform: translateX(100%) → 0

Toast Notification: 300ms ease-out
  - Opacity: 0 → 1
  - Transform: translateY(20px) → 0
```

### Loading States
```
Initial Load: Spinner + "Loading satellite data..."
Data Refresh: Skeleton loaders on list items
Error: Toast notification (red, auto-dismiss 5s)
```

---

## Data Display Formats

### Coordinates
```
Latitude: 31.1239° (4 decimal places)
Longitude: 47.1265° (4 decimal places)
Altitude: 408 km (rounded integer)
```

### Time Display
```
Local Time: HH:MM:SS (24h format)
UTC Time: YYYY-MM-DD HH:MM:SS UTC
Relative: "2 minutes ago"
```

### Distance Display
```
Earth satellites: km (integer)
Solar system: AU (2 decimal places)
Moon: km with comma separator
```

### NORAD ID
```
Format: #25544 (hash prefix)
Alignment: Right in lists
Color: #71717a (muted)
```

---

## Error States

### Network Error
```
UI: Full screen overlay
Icon: ⚠️
Message: "Failed to connect to server"
Action: [Retry] button
```

### No Data
```
UI: Empty state in sidebar
Icon: 🛰️
Message: "No satellites loaded"
Action: [Refresh] button
```

### Invalid TLE
```
UI: Point not rendered (silently skip)
Console: Warning logged
User: No error shown (graceful degradation)
```

---

## Accessibility

### Keyboard Navigation
```
Tab: Navigate through interactive elements
Enter/Space: Activate buttons
Escape: Close modals/deselect
Arrow Keys: Navigate list items (future)
```

### Screen Readers
```
- All buttons have aria-label
- Satellite list items have role="listitem"
- Globe has aria-label="3D satellite visualization"
- Loading states announce to screen readers
```

### Color Contrast
```
- Text on background: 7:1 minimum (WCAG AAA)
- Interactive elements: 4.5:1 minimum (WCAG AA)
- Never rely on color alone for information
```

---

## Performance Considerations

### Rendering
```
- Max 100 satellites rendered at once (virtual scrolling for more)
- Orbital trails: Optional toggle (expensive computation)
- Web Worker: SGP4 propagation (non-blocking)
- Update interval: 1 second for positions
```

### Asset Loading
```
- Cesium: Lazy load after initial paint
- Fonts: Preload critical fonts
- Icons: Inline SVG (no external requests)
```

### Mobile Optimization
```
- Hide sidebar by default on mobile
- Reduce orbital trail complexity
- Lower Cesium quality settings
- Touch gestures for camera control
```

---

## Current Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| Landing Page | ✅ Complete | Basic version |
| Mission Control Layout | ✅ Complete | Header, globe, sidebar |
| Cesium Globe | ✅ Complete | Points, labels, ISS highlight |
| Satellite List | ✅ Complete | Scrollable, selectable |
| ISS Tracking Card | ✅ Complete | Real-time telemetry, focus |
| Web Worker Propagation | ✅ Complete | Non-blocking SGP4 |
| Solar Navigator | ✅ Complete | Planet list, distances |
| View Toggle | ✅ Complete | Satellites ↔ Solar |
| SME Panel | ⏳ Pending | CW-019 |
| Settings Panel | ⏳ Future | Post-MVP |
| Mobile Responsive | ⏳ Partial | Needs testing |

---

## Future Enhancements (Post-MVP)

### Features
- Search/filter satellites
- Satellite conjunction alerts
- Pass predictions for user location
- Photo gallery (user submissions)
- Launch schedule integration
- 3D satellite models (detailed)

### UI Improvements
- Customizable themes (light/dark)
- Layout presets
- Keyboard shortcuts overlay
- Tutorial/onboarding mode
- Multi-language support

### Data Sources
- Real-time position updates (websocket)
- User-contributed metadata
- Launch notifications
- Space weather data

---

## File Structure

```
apps/web/src/
├── components/
│   ├── CesiumGlobe.jsx        # 3D globe component
│   ├── SolarNavigator.jsx     # Solar system view
│   ├── LandingPage.jsx        # Entry page
│   └── SMEPanel.jsx           # (Future) Metadata editor
├── pages/
│   └── MissionControl.jsx     # Main app container
├── workers/
│   └── propagation.worker.js  # SGP4 calculations
├── styles/
│   └── globals.css            # Design system tokens
├── hooks/
│   └── useSatelliteData.js    # (Future) Data fetching
└── utils/
    └── formatters.js          # Display formatting
```

---

## Design Tokens (CSS Variables)

```css
:root {
  /* Colors */
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --bg-tertiary: #1a1a25;
  --accent-cyan: #00d4ff;
  --accent-purple: #8b5cf6;
  --accent-orange: #f59e0b;
  --accent-red: #ff4444;
  --text-primary: #ffffff;
  --text-secondary: #a1a1aa;
  --text-muted: #71717a;
  
  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  
  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-display: 'Orbitron', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Borders */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  
  /* Shadows */
  --shadow-card: 0 4px 6px rgba(0, 0, 0, 0.3);
  --shadow-float: 0 8px 16px rgba(0, 0, 0, 0.4);
  --shadow-glow: 0 0 20px rgba(0, 212, 255, 0.3);
  
  /* Transitions */
  --transition-fast: 100ms ease-out;
  --transition-base: 200ms ease-out;
  --transition-slow: 300ms ease-out;
}
```

---

**Last Updated:** March 7, 2026
**Version:** 1.0 (MVP)
**Status:** In Development (Sprint 4)
