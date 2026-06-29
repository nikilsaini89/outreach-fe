# Styling

All styles live in `src/styles/index.css`. There is no Tailwind config file — Tailwind v4 is used only for its base reset via `@import "tailwindcss"`. Everything else is hand-written CSS using custom properties.

## Design tokens

### Colors

```css
/* Gray ramp (backgrounds, borders, text) */
--gray-25 … --gray-900   /* 10 stops from near-white to near-black */

/* Accent — indigo */
--accent-50 … --accent-700

/* Semantic */
--green-50/500/700   /* success, SENT, ACTIVE */
--amber-50/500/700   /* warning, PAUSED */
--red-50/500/700     /* error, FAILED */
--blue-50/500/700    /* in-progress, PROCESSING */

/* Aliases */
--bg              var(--gray-50)      /* page background */
--surface         #ffffff             /* card/input background */
--border          var(--gray-200)     /* default border */
--border-strong   var(--gray-300)
--text            var(--gray-900)
--text-secondary  var(--gray-600)
--text-muted      var(--gray-500)
--accent          var(--accent-500)   /* #5b5bd6 indigo */
--accent-hover    var(--accent-600)
```

### Typography

```css
--font-sans   Inter, system-ui fallbacks
--font-mono   SFMono-Regular, JetBrains Mono, Menlo

--text-xs   12px   --text-sm   13px   --text-md  14px
--text-lg   16px   --text-xl   20px   --text-2xl 26px   --text-3xl 32px
```

### Spacing (4px base)

```css
--s-1  4px   --s-2  8px   --s-3  12px  --s-4  16px
--s-5  20px  --s-6  24px  --s-8  32px  --s-10 40px  --s-12 48px
```

### Radii

```css
--r-sm 6px   --r-md 8px   --r-lg 12px   --r-xl 16px   --r-pill 999px
```

---

## Layout classes

| Class | What it does |
|---|---|
| `.app` | Grid: `var(--sidebar-w) 1fr` — sidebar + main content |
| `.sidebar` | Fixed-width left panel, sticky, full height |
| `.main` | Right column, flex column |
| `.topbar` | Sticky top bar, `var(--topbar-h)` = 60px |
| `.content` | Page content area, `max-width: 1080px`, centered |
| `.auth` | Two-column login layout (`1fr 1fr`) |
| `.detail-grid` | Two-column detail layout (`1fr 320px`), collapses at 980px |
| `.create-grid` | Two-column create layout (`1fr 340px`), collapses at 980px |
| `.stat-grid` | 4-column stats strip |
| `.field-row` | 3-column form row for follow-up settings |

---

## Component classes

### Buttons

```
.btn                  base styles (height 36px)
.btn-primary          indigo fill
.btn-secondary        white with border
.btn-ghost            transparent
.btn-danger           white with red text
.btn-sm               height 30px
.btn-lg               height 44px
.btn-block            width 100%
.btn-google           full-width Google sign-in button
```

### Cards

```
.card                 white surface, border, border-radius, shadow
.card-pad             adds padding: var(--s-6)
.card-head            header row with bottom border
```

### Badges

```
.badge                base pill
.badge-active         green
.badge-paused         amber
.badge-completed      gray
.badge-failed         red
.badge-pending        gray
.badge-processing     blue
.badge-sent           green
```

### Forms

```
.field                margin-bottom wrapper
.label                bold form label
.input                text input
.textarea             multiline input (min-height 150px, resizable)
.select               dropdown
.hint                 helper text below input
.input-group          input + suffix side-by-side
.input-suffix         right addon label (e.g. "days")
.stepper              +/− number control
```

### Timeline

```
.timeline             container with left padding
.tl-item              grid: 40px (rail) + 1fr (card), bottom padding
.tl-rail              centers the node, draws connecting line via ::before
.tl-node              circle — default gray
.tl-node.sent         green
.tl-node.processing   blue
.tl-node.failed       red
.tl-card              card for each message
```

### Misc

```
.badge / .ai-tag      inline tags
.spinner              CSS-animated loading circle
.alert / .alert-info / .alert-warn / .alert-error   notification banners
.tag-mono             monospace inline code chip (used for IDs)
.divider              1px horizontal rule
.kvs                  key-value grid (140px label | 1fr value)
.crumbs               breadcrumb nav in topbar
.empty                centered empty-state block
.row                  flex row, gap var(--s-3)
.cell-strong          bold table cell text
.cell-muted           muted table cell text
```
