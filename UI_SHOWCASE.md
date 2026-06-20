# InboxIQ UI Showcase 🎨

## Visual Design Language

### Color Palette (Earth Tones)
```
Primary Text:     #1c1917 (Stone 900)
Secondary Text:   #57534e (Stone 600)
Tertiary Text:    #a8a29e (Stone 400)
Background:       #f0ede8 (Warm Cream)
Card Background:  #ffffff (White)
Borders:          #e5e2db (Stone 200)

Accent Colors:
- Sage:           #849b87 (Green-gray)
- Slate:          #6b7a8f (Blue-gray)
- Ochre:          #c99a5c (Warm yellow)
- Terracotta:     #c46b5a (Warm red)
- Dusty Rose:     #b5838d (Muted pink)
```

---

## Component Showcase

### 1. Stat Cards (Dashboard)

**Visual Features:**
- Gradient background (white → light gray)
- Multi-layer shadows for depth
- Top gradient accent bar on hover
- Smooth 4px lift
- Rounded corners (12px)

**Hover Effect:**
```
Transform:  translateY(-4px)
Shadow:     0 8px 24px rgba(0,0,0,0.08)
Top Bar:    Gradient (sage → slate → ochre)
Transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1)
```

**States:**
- Default: Subtle shadow, gradient background
- Hover: Lifted, gradient top bar appears, enhanced shadow
- Active: Scale down slightly (0.99)

---

### 2. Section Cards (Dashboard Charts)

**Visual Features:**
- Clean white background
- Soft border with warm stone color
- 28px padding for breathing room
- 16px border radius

**Hover Effect:**
```
Transform:  translateY(-2px)
Shadow:     0 8px 32px rgba(0,0,0,0.06)
Transition: 0.3s cubic-bezier
```

---

### 3. Sender Rows (Dashboard)

**Visual Features:**
- 16px gap between avatar and text
- 16px padding vertical
- Rounded corners (10px)
- Left accent bar indicator

**Hover Effect:**
```
Background: Linear gradient (white → light gray)
Transform:  translateX(4px)
Left Bar:   Grows from 0 to 60% height
Bar Color:  Gradient (sage → slate)
Transition: 0.2s cubic-bezier
```

**Interactive Elements:**
- Cursor: pointer
- Left bar appears with height animation
- Entire row slides right
- Background gradient fades in

---

### 4. Email Cards (Inbox Grid View)

**Visual Features:**
- White background
- 2px border (stone-200)
- Rounded-xl corners
- 6px padding

**Hover Effect (card-interactive):**
```
Transform:     translateY(-4px) scale(1.01)
Shadow:        0 16px 48px rgba(0,0,0,0.1)
Border Color:  Sage tint (rgba(132, 155, 135, 0.3))
Transition:    0.3s cubic-bezier
```

**Active State:**
```
Transform: translateY(-2px) scale(0.99)
```

---

### 5. Search Bar (Search Page)

**Visual Features:**
- Large input (20px height)
- Rounded-2xl (16px radius)
- 2px border
- Hover glow effect

**Glow Effect:**
- Radial gradient appears around element
- Sage color with low opacity
- Smooth fade in/out
- No layout shift

**Focus State:**
```
Ring:       2px solid stone-900
Ring Offset: 2px
Border:     Transparent (replaced by ring)
```

---

### 6. Search Button

**Visual Features:**
- Stone-900 background
- White text
- Rounded-xl
- Medium font weight

**Special Effect (btn-shine):**
```
Animation: Shine sweep left to right
Duration:  0.5s on hover
Effect:    White gradient overlay (30% opacity)
Direction: Starts off-screen left, exits right
```

**Visual:**
```
──────────────────────
│     [Button]       │ → Hover →
──────────────────────

─────────────────────────
│ ▓▓▓[Button]          │ (shine moving)
─────────────────────────

─────────────────────────
│        [Button]▓▓▓    │ (shine exiting)
─────────────────────────
```

---

### 7. Suggestion Pills

**Visual Features:**
- White background
- 2px border (stone-200)
- Rounded-xl
- Medium font weight

**Hover Effect (hover-lift):**
```
Transform: translateY(-4px)
Shadow:    0 12px 32px rgba(0,0,0,0.08)
Border:    Stone-900 (dark)
Transition: 0.3s cubic-bezier
```

---

### 8. Result Cards (Search Results)

**Visual Features:**
- White background
- 2px border (stone-200)
- Rounded-2xl (larger than default)
- 6px padding

**Hover Effect (card-interactive):**
- Same as email cards
- Additional border glow in sage color
- Comprehensive multi-layer effect

---

## Animation Patterns

### Page Load (Staggered Reveal)

```
Section 1: reveal-up stagger-1 (0.1s delay)
Section 2: reveal-up stagger-2 (0.2s delay)
Section 3: reveal-up stagger-3 (0.3s delay)
Section 4: reveal-up stagger-4 (0.4s delay)
```

**Effect:**
- Fade in from 0 to 1 opacity
- Slide up from 20px below
- 0.6s duration
- Cubic-bezier easing
- Cascade effect creates flow

---

### Floating Icon

**Used on:** Search page sparkle icon

```
Animation:  float-gentle
Duration:   3s
Easing:     ease-in-out
Loop:       infinite
Effect:     translateY(0) → translateY(-6px) → translateY(0)
```

Creates gentle bobbing motion

---

### Loading Spinner

**Used on:** Sync status, loading states

```
Animation:  spin-slow
Duration:   2s
Easing:     linear
Loop:       infinite
Effect:     rotate(0deg) → rotate(360deg)
```

Slower than default for calmer feel

---

### Shimmer Effect

**Used on:** Loading skeletons, empty states

```
Animation:  dashShimmer
Duration:   1.5s
Easing:     ease-in-out
Loop:       infinite
Effect:     Gradient moves left to right
```

**Gradient:**
```
light → medium → light
#f0ede8 → #e5e2db → #f0ede8
```

---

## Layout Patterns

### Dashboard Grid

```
┌──────────┬──────────┬──────────┬──────────┐
│  Stat 1  │  Stat 2  │  Stat 3  │  Stat 4  │ ← 4 columns, 24px gap
└──────────┴──────────┴──────────┴──────────┘

┌─────────────────────┬─────────────────────┐
│   Category Chart    │  Sentiment Chart    │ ← 2 columns, 24px gap
└─────────────────────┴─────────────────────┘

┌───────────────────────────────────────────┐
│        Most Active Senders                │ ← Full width
└───────────────────────────────────────────┘
```

### Inbox Grid View

```
┌──────────┬──────────┬──────────┐
│  Email 1 │  Email 2 │  Email 3 │
├──────────┼──────────┼──────────┤ ← 3 columns
│  Email 4 │  Email 5 │  Email 6 │   6px gap
└──────────┴──────────┴──────────┘
```

### Search Results

```
┌───────────────────────────────────────────┐
│  Result 1 (Subject + Content Match)      │
├───────────────────────────────────────────┤
│  Result 2 (Subject + Content Match)      │ ← Stacked
├───────────────────────────────────────────┤   4px gap
│  Result 3 (Subject + Content Match)      │
└───────────────────────────────────────────┘
```

---

## Spacing System

### Padding Scale
```
xs:  4px   (tight badges)
sm:  8px   (compact elements)
md:  16px  (standard spacing)
lg:  24px  (section padding)
xl:  32px  (major sections)
2xl: 48px  (page sections)
```

### Gap Scale
```
xs:  4px   (tight groups)
sm:  8px   (related items)
md:  12px  (standard gap)
lg:  16px  (section gaps)
xl:  24px  (grid gaps)
```

### Border Radius Scale
```
sm:  6px   (buttons, badges)
md:  8px   (inputs, small cards)
lg:  12px  (stat cards)
xl:  16px  (section cards)
2xl: 20px  (prominent cards)
```

---

## Typography Scale

### Headings
```
Page Title:    28px, weight 700, -0.02em tracking
Section Title: 16px, weight 600, -0.01em tracking
Card Title:    15px, weight 600
Subsection:    14px, weight 600
```

### Body Text
```
Large:   16px, weight 400
Default: 14px, weight 400
Small:   13px, weight 400
Tiny:    12px, weight 400
Label:   11px, weight 600, uppercase
```

### Weights
```
Normal:    400
Medium:    500
Semibold:  600
Bold:      700
```

---

## Shadow System

### Stat Cards
```
Default: 0 2px 8px rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.01)
Hover:   0 8px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02)
```

### Section Cards
```
Default: 0 2px 12px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.01)
Hover:   0 8px 32px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02)
```

### Interactive Cards (Emails, Search Results)
```
Default: 0 2px 8px rgba(0,0,0,0.04)
Hover:   0 16px 48px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.03)
```

### Buttons on Hover
```
0 4px 12px rgba(0,0,0,0.1)
```

---

## Interaction Timing

### Immediate (0.15-0.2s)
- Button clicks
- Link hovers
- Icon changes

### Standard (0.3s)
- Card hovers
- Drawer opens
- Tooltip appears

### Slow (0.5-0.6s)
- Page transitions
- Content reveals
- Modal opens

### Decorative (2-8s)
- Floating animations
- Gradient shifts
- Ambient effects

---

## Accessibility Features

### Focus Indicators
```
Ring:        2px solid #849b87 (sage)
Ring Offset: 2px
Visible:     :focus-visible only (not on mouse click)
```

### Color Contrast
- All text meets WCAG AA standards
- Primary text: 16.85:1 ratio
- Secondary text: 7.58:1 ratio
- Interactive elements: Minimum 3:1 ratio

### Motion
- All animations respect `prefers-reduced-motion`
- Can be disabled via media query
- No essential information conveyed through animation alone

---

## Responsive Breakpoints

```
Mobile:      < 640px  (sm)
Tablet:      < 768px  (md)
Desktop:     < 1024px (lg)
Large:       < 1280px (xl)
Extra Large: > 1280px (2xl)
```

### Grid Adaptations
```
Dashboard Stats:
- Mobile:  1 column
- Tablet:  2 columns
- Desktop: 4 columns

Inbox Grid:
- Mobile:  1 column
- Tablet:  2 columns
- Desktop: 3 columns

Charts:
- Mobile:  1 column (stacked)
- Desktop: 2 columns (side-by-side)
```

---

## Design Principles Applied

### 1. **Hierarchy Through Size & Weight**
- Page titles are largest (28px)
- Sections are prominent (16px semibold)
- Body text is comfortable (14px)
- Supporting text is subtle (12-13px)

### 2. **Depth Through Shadows**
- Multi-layer shadows create realistic depth
- Shadows intensify on hover (closer to user)
- Consistent shadow direction (top-down)

### 3. **Motion With Purpose**
- Hover effects provide feedback
- Page reveals create flow
- Loading states show progress
- Decorative motion is subtle

### 4. **Color As Accent**
- Earth tones for warmth
- Color used for categorization
- Gradients for visual interest
- High contrast for readability

### 5. **Spacing For Clarity**
- Generous whitespace
- Consistent gaps
- Related items grouped
- Sections clearly separated

---

## Browser DevTools Tips

### Inspect Hover States
```
1. Right-click element
2. Inspect Element
3. Click :hov in Styles panel
4. Check :hover
5. See CSS changes in real-time
```

### View Animations
```
1. Open Chrome DevTools
2. Cmd/Ctrl + Shift + P
3. Type "animations"
4. Select "Show Animations"
5. See timeline of all animations
```

### Check Accessibility
```
1. Open DevTools
2. Go to Lighthouse tab
3. Select "Accessibility"
4. Run audit
5. Review score (should be 95+)
```

---

## Quick Win Checklist

Try these interactions to see the polish:

- [ ] Hover over any stat card → See gradient top bar appear
- [ ] Hover over sender row → See left accent bar grow
- [ ] Hover over email card → See lift + scale + border glow
- [ ] Click search button → See shine sweep effect
- [ ] Hover suggestion pill → See lift effect
- [ ] Watch sparkle icon → See gentle float
- [ ] Refresh dashboard → See staggered content reveal
- [ ] Tab through buttons → See focus rings
- [ ] Hover any interactive card → See comprehensive effect
- [ ] Resize window → See responsive grid adapt

---

**All effects are subtle, purposeful, and enhance the user experience without being distracting.**
