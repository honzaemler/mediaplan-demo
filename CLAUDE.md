# Mediaplan Demo — Claude Code Instructions

## Stack
- **TypeScript** (strict: false), Vite 8, Vitest + jsdom
- **No framework** — vanilla TS, zero runtime dependencies
- **Deploy:** GitHub Pages via Actions

## Architecture

```
src/
  main.ts               # Entry point — view rendering, event delegation
  compute.ts            # Core financial calculations (ROAS model)
  state.ts              # Global state (CFG, settings, labels)
  types.ts              # Interfaces (Params, ComputeResult, A25Data, ChannelData)
  i18n.ts               # Czech/English translations
  style.css             # Main styles
  core/
    format.ts           # Number formatting (f, fK, p2, cx, cxK)
    slider.ts           # Slider component logic + HTML generation
    dom.ts              # DOM initialization & manipulation
    history.ts          # Undo/redo state management
    export.ts           # CSV & PDF export (html2pdf.js)
  data/
    defaults.ts         # A25Data — 2025 GA4 benchmarks
    params.ts           # Parameter definitions & scenario generation
  views/
    ceo.ts              # CEO funnel visualization
    models.ts           # A/B model panels
    monthly.ts          # Monthly revenue breakdown
    compare.ts          # A/B comparison view
    settings.ts         # Channel/cost/currency/language toggles
```

## Key conventions
- **Naming:** camelCase functions, UPPERCASE constants (CH_KEYS, MONTHS_F)
- **Formatting:** custom helpers — `f` (thousands), `fK` (full), `p2` (percent), `cx`/`cxK` (currency)
- **i18n:** CZ/EN via parallel label objects + `t()` helper
- **State:** localStorage persistence for params A/B and monthly reality
- **HTML rendering:** innerHTML from trusted computed state (no user input)

## Dev workflow
```bash
npm run dev      # Vite dev server
npm run test     # Vitest
npm run build    # Production build → dist/
```
