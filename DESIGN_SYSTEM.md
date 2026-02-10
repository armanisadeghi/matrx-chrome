# Matrx Design System

The design system lives in `styles/theme.css` (tokens + components) and `styles/icons.css` (icon system). Both files are imported by every HTML page and are the single source of truth for visual styling across the extension.

---

## Quick Start

Every class in the design system is prefixed with `m-` to avoid collisions with existing per-page styles.

```html
<!-- Already added to all pages: -->
<link rel="stylesheet" href="../styles/theme.css">
<link rel="stylesheet" href="../styles/icons.css">
```

---

## 1. Design Tokens (CSS Custom Properties)

Use `var(--m-*)` instead of hardcoded values.

### Colors

| Token | Light Value | Usage |
|---|---|---|
| `--m-brand` | `#2563eb` | Primary accent, links, active states |
| `--m-brand-hover` | `#1d4ed8` | Hover on primary elements |
| `--m-brand-active` | `#1e40af` | Active/pressed primary |
| `--m-brand-subtle` | `rgba(37,99,235,0.08)` | Tinted backgrounds |
| `--m-brand-ring` | `rgba(37,99,235,0.35)` | Focus ring |
| `--m-success` | `#16a34a` | Success states |
| `--m-error` | `#dc2626` | Error states |
| `--m-warning` | `#d97706` | Warning states |
| `--m-info` | `#2563eb` | Info states |

Each semantic color also has `-subtle` (background tint) and `-text` (foreground) variants.

### Surfaces & Borders

| Token | Light | Dark (`.m-dark`) |
|---|---|---|
| `--m-bg-page` | `#f8f9fb` | `#0a0a0a` |
| `--m-bg-card` | `#ffffff` | `#171717` |
| `--m-bg-elevated` | `#ffffff` | `#1e1e1e` |
| `--m-bg-inset` | `#f1f5f9` | `#141414` |
| `--m-bg-hover` | `#f1f5f9` | `#262626` |
| `--m-bg-active` | `#e2e8f0` | `#333333` |
| `--m-border` | `#e2e8f0` | `#262626` |
| `--m-border-strong` | `#cbd5e1` | `#404040` |

### Text

| Token | Light | Dark |
|---|---|---|
| `--m-text-primary` | `#0f172a` | `#f5f5f5` |
| `--m-text-secondary` | `#475569` | `#a3a3a3` |
| `--m-text-tertiary` | `#94a3b8` | `#737373` |
| `--m-text-inverse` | `#ffffff` | `#0a0a0a` |

### Typography Scale

| Token | Size | Usage |
|---|---|---|
| `--m-text-xs` | 11px | Help text, hints |
| `--m-text-sm` | 12px | Labels, badges, small buttons |
| `--m-text-base` | 13px | Default body text |
| `--m-text-md` | 14px | Input text, emphasized body |
| `--m-text-lg` | 16px | Section titles |
| `--m-text-xl` | 20px | Page titles |

### Spacing (4px Grid)

| Token | Value |
|---|---|
| `--m-space-1` | 4px |
| `--m-space-2` | 8px |
| `--m-space-3` | 12px |
| `--m-space-4` | 16px |
| `--m-space-5` | 20px |
| `--m-space-6` | 24px |
| `--m-space-8` | 32px |
| `--m-space-10` | 40px |

### Border Radius

| Token | Value |
|---|---|
| `--m-radius-sm` | 6px |
| `--m-radius-md` | 8px |
| `--m-radius-lg` | 12px |
| `--m-radius-xl` | 16px |
| `--m-radius-full` | 9999px |

### Shadows

| Token | Usage |
|---|---|
| `--m-shadow-sm` | Subtle depth (badges, inputs) |
| `--m-shadow-md` | Cards, dropdowns |
| `--m-shadow-lg` | Modals, toasts |

---

## 2. Dark Mode

Add class `m-dark` to `<html>` or `<body>`. All `--m-*` tokens flip automatically.

```html
<!-- Options page (dark) -->
<body class="m-base m-dark">

<!-- Sidepanel (light, default) -->
<body class="m-base">
```

---

## 3. Component Classes

### Buttons

```html
<!-- Default -->
<button class="m-btn">Default</button>

<!-- Primary (blue) -->
<button class="m-btn m-btn-primary">Save</button>

<!-- Secondary (outlined) -->
<button class="m-btn m-btn-secondary">Cancel</button>

<!-- Ghost (no border) -->
<button class="m-btn m-btn-ghost">Settings</button>

<!-- Danger (red on hover) -->
<button class="m-btn m-btn-danger">Delete</button>

<!-- Small -->
<button class="m-btn m-btn-sm">Small</button>

<!-- Large -->
<button class="m-btn m-btn-lg">Large</button>

<!-- Full width -->
<button class="m-btn m-btn-primary m-btn-block">Full Width</button>

<!-- Icon only -->
<button class="m-btn m-btn-icon m-btn-ghost">
    <span class="m-icon m-icon-settings"></span>
</button>

<!-- With icon + text -->
<button class="m-btn m-btn-primary">
    <span class="m-icon m-icon-copy"></span> Copy
</button>

<!-- Loading state -->
<button class="m-btn m-btn-primary m-btn-loading">Saving...</button>
```

### Inputs

```html
<div class="m-input-group">
    <label class="m-label" for="email">Email address</label>
    <input class="m-input" id="email" type="email" placeholder="you@example.com">
    <span class="m-input-hint">We'll never share your email.</span>
</div>

<!-- Label with right-aligned link -->
<div class="m-input-group">
    <div class="m-label-row">
        <label class="m-label" for="pw">Password</label>
        <a href="#" class="m-link m-text-sm">Forgot password?</a>
    </div>
    <input class="m-input" id="pw" type="password">
</div>
```

### Cards

```html
<div class="m-card">
    <div class="m-card-header">
        <h3 class="m-section-title">Settings</h3>
    </div>
    <div class="m-card-body">
        Content here
    </div>
    <div class="m-card-footer">
        <button class="m-btn m-btn-primary">Save</button>
    </div>
</div>

<!-- Elevated (shadow) -->
<div class="m-card m-card-elevated">...</div>
```

### Badges

```html
<span class="m-badge">Default</span>
<span class="m-badge m-badge-success">Active</span>
<span class="m-badge m-badge-error">Failed</span>
<span class="m-badge m-badge-warning">Pending</span>
<span class="m-badge m-badge-info">New</span>
```

### Status Messages

```html
<div class="m-status m-status-success">
    <span class="m-icon m-icon-check"></span> Successfully saved!
</div>
<div class="m-status m-status-error">
    <span class="m-icon m-icon-alert-triangle"></span> Connection failed.
</div>
<div class="m-status m-status-loading">Loading data...</div>
```

### Tabs

```html
<div class="m-tabs">
    <button class="m-tab m-tab-active">Tab One</button>
    <button class="m-tab">Tab Two</button>
    <button class="m-tab">Tab Three</button>
</div>

<!-- Tab with icon -->
<button class="m-tab">
    <span class="m-icon m-icon-settings"></span> Settings
</button>
```

### Dividers

```html
<hr class="m-divider">

<!-- With text -->
<div class="m-divider-text">
    <span>Or continue with</span>
</div>
```

### OAuth Grid

```html
<div class="m-oauth-grid">
    <button class="m-oauth-btn">
        <!-- Google SVG icon inline (brand colors) -->
        <span>Google</span>
    </button>
    <button class="m-oauth-btn">
        <span class="m-icon m-icon-md" style="background-color: currentColor;"></span>
        <span>Apple</span>
    </button>
    <button class="m-oauth-btn">
        <span>GitHub</span>
    </button>
</div>
```

### Toast (Status Notification)

```html
<div class="m-toast m-toast-success">Settings saved!</div>
<div class="m-toast m-toast-error">Failed to save.</div>
<div class="m-toast m-toast-loading">Processing...</div>
```

### Empty State

```html
<div class="m-empty">
    <span class="m-icon m-icon-xl m-icon-search m-empty-icon"></span>
    <p class="m-empty-title">No results</p>
    <p class="m-empty-description">Try adjusting your search or filter criteria.</p>
</div>
```

---

## 4. Icon System

Icons use CSS `mask-image` with Lucide SVG paths. They inherit `color` from their parent via `currentColor`.

### Usage

```html
<!-- Basic icon -->
<span class="m-icon m-icon-copy"></span>

<!-- Size variants -->
<span class="m-icon m-icon-xs m-icon-check"></span>   <!-- 12px -->
<span class="m-icon m-icon-sm m-icon-check"></span>   <!-- 14px -->
<span class="m-icon m-icon-check"></span>              <!-- 16px (default) -->
<span class="m-icon m-icon-md m-icon-check"></span>   <!-- 18px -->
<span class="m-icon m-icon-lg m-icon-check"></span>   <!-- 20px -->
<span class="m-icon m-icon-xl m-icon-check"></span>   <!-- 24px -->

<!-- Colored -->
<span class="m-icon m-icon-check m-text-success"></span>
<span class="m-icon m-icon-alert-triangle m-text-warning"></span>

<!-- Inside a button -->
<button class="m-btn">
    <span class="m-icon m-icon-copy"></span> Copy
</button>
```

### Available Icons

| Class | Replaces | Description |
|---|---|---|
| `m-icon-settings` | -- | Gear/settings |
| `m-icon-search` | `🔍` | Search/magnifier |
| `m-icon-copy` | `📋` | Clipboard/copy |
| `m-icon-refresh` | `🔄` | Refresh/reload |
| `m-icon-save` | `💾` | Save/disk |
| `m-icon-trash` | `🗑️` | Delete/trash |
| `m-icon-play` | -- | Play/start |
| `m-icon-external-link` | -- | External link |
| `m-icon-file` | `📄` | Document |
| `m-icon-file-text` | `📝` | Document with text |
| `m-icon-folder` | `📁` | Folder |
| `m-icon-code` | -- | Code brackets |
| `m-icon-image` | `🖼️` | Image/photo |
| `m-icon-link` | `🔗` | Link chain |
| `m-icon-book-open` | `📖` | Open book/view |
| `m-icon-check` | -- | Checkmark |
| `m-icon-check-circle` | `✅` | Circled check |
| `m-icon-alert-triangle` | `⚠️` | Warning triangle |
| `m-icon-info` | -- | Info circle |
| `m-icon-star` | `⭐` | Star |
| `m-icon-bot` | `🤖` | AI/robot |
| `m-icon-sparkles` | `✨` | Sparkle/magic |
| `m-icon-target` | `🎯` | Target/custom |
| `m-icon-bar-chart` | `📊` | Chart/data |
| `m-icon-headers` | -- | Heading (H) |
| `m-icon-markdown` | -- | Markdown file |
| `m-icon-chevron-right` | -- | Right arrow |
| `m-icon-chevron-down` | -- | Down arrow |
| `m-icon-user` | -- | User avatar |
| `m-icon-mail` | -- | Email envelope |
| `m-icon-lock` | -- | Padlock |
| `m-icon-log-out` | -- | Sign out |
| `m-icon-list` | -- | Bulleted list |
| `m-icon-eye` | -- | View/preview |
| `m-icon-download` | -- | Download |
| `m-icon-x` | -- | Close/dismiss |
| `m-icon-wrench` | `🔧` | Wrench/tools |
| `m-icon-json` | -- | JSON file |
| `m-icon-text` | -- | Text lines |
| `m-icon-globe` | -- | Globe/web |
| `m-icon-scan` | -- | Scan/extract |

---

## 5. Utility Classes

### Text

```html
<span class="m-text-xs">11px</span>
<span class="m-text-sm">12px</span>
<span class="m-text-base">13px</span>
<span class="m-text-md">14px</span>
<span class="m-text-lg">16px</span>

<span class="m-text-primary">Primary</span>
<span class="m-text-secondary">Secondary</span>
<span class="m-text-tertiary">Muted</span>
<span class="m-text-brand">Blue accent</span>
<span class="m-text-success">Green</span>
<span class="m-text-error">Red</span>

<span class="m-font-medium">500</span>
<span class="m-font-semibold">600</span>
<span class="m-font-bold">700</span>

<span class="m-truncate">Long text gets ellipsis...</span>
```

### Spacing

```html
<div class="m-mt-2">margin-top: 8px</div>
<div class="m-mb-4">margin-bottom: 16px</div>
<div class="m-gap-2">gap: 8px (use with flex/grid)</div>
```

### Layout

```html
<div class="m-flex m-gap-2">horizontal flex</div>
<div class="m-flex-col m-gap-3">vertical flex</div>
<div class="m-flex-center">centered both axes</div>
<div class="m-flex-between">space-between</div>
```

### Links

```html
<a href="#" class="m-link">Blue link</a>
```

### Code

```html
<code class="m-code">inline code</code>
```

### Scrollbar

```html
<div class="m-scrollbar" style="overflow-y: auto;">
    Thin, subtle scrollbar
</div>
```

---

## 6. Migration Guide

### Replacing Hardcoded Colors

**Before:**
```css
.my-button {
    background: #3b82f6;
    color: #ffffff;
    border: 1px solid #e2e8f0;
}
```

**After:**
```css
.my-button {
    background: var(--m-brand);
    color: var(--m-text-inverse);
    border: 1px solid var(--m-border);
}
```

### Replacing Emoji with Icons

**Before:**
```html
<button>📋 Copy Content</button>
<h3>🤖 AI Processing</h3>
<div class="placeholder-icon">🔍</div>
```

**After:**
```html
<button class="m-btn"><span class="m-icon m-icon-copy"></span> Copy Content</button>
<h3><span class="m-icon m-icon-bot"></span> AI Processing</h3>
<div class="m-empty-icon"><span class="m-icon m-icon-xl m-icon-search"></span></div>
```

### Replacing Ad-Hoc Buttons

**Before:**
```html
<button class="extract-btn">Extract</button>
<button class="copy-btn">Copy</button>
<button class="gemini-action-btn">View Full</button>
```

**After:**
```html
<button class="m-btn m-btn-primary"><span class="m-icon m-icon-scan"></span> Extract</button>
<button class="m-btn"><span class="m-icon m-icon-copy"></span> Copy</button>
<button class="m-btn m-btn-ghost"><span class="m-icon m-icon-book-open"></span> View Full</button>
```

### Replacing Inline SVGs

If the same SVG icon appears in multiple places, replace it with the CSS icon class:

**Before:**
```html
<svg class="tab-icon" viewBox="0 0 24 24" style="fill: #FF9800;">
    <path d="M3,4H7V8H3V4M9,5V7H21V5H9M3..."/>
</svg>
```

**After:**
```html
<span class="m-icon m-icon-headers" style="color: #FF9800;"></span>
```

Note: For OAuth provider logos (Google, Apple, GitHub) that use brand colors, keep the inline SVGs since brand guidelines require specific multi-color rendering.

---

## 7. File Reference

| File | Purpose |
|---|---|
| `styles/theme.css` | Design tokens, base reset, component classes, utilities |
| `styles/icons.css` | Icon definitions (Lucide SVGs as CSS mask-image) |
| `templates/shared-styles.html` | Legacy tokens (mapped to `--m-*`), blob template styles |
| `popup/template-loader.js` | Inlines theme + icons + shared-styles into blob documents |
