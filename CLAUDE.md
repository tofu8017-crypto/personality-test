# Animal Aura Personality Test 32

## Project Overview

Static HTML/CSS/JS personality test app ("Animal Aura Diagnosis 32").
6 scientific theories (Big Five, RIASEC, VIA-IS, Attachment, SPS, TA) integrated into 29-dimension analysis.
70 questions, 8 guardian animals x 4 aura colors = 32 types.

Deployed at: https://personality-app-sigma.vercel.app/

## Architecture

```
index.html          # Single-page app entry point (ja locale)
js/
  questions.js      # 70 question definitions with dimension mappings
  analysis.js       # Scoring engine, type determination, result generation
  app.js            # UI logic, navigation, theme, sharing, animations
css/
  style.css         # All styles (dark/light/system themes, responsive)
assets/
  icon.svg          # Favicon
  apple-touch-icon.png
```

## Tech Stack

- Pure vanilla JS (no framework, no build tool, no bundler)
- No package.json, no node_modules
- CSS custom properties for theming
- No server-side code (fully static)

## Development

- Open `index.html` directly in browser or use `python3 -m http.server`
- No build step required
- No test framework currently configured

## Coding Conventions

- Language: Japanese for UI text/comments, English for variable names
- Use vanilla JS (do NOT introduce frameworks without explicit request)
- CSS uses BEM-like naming with kebab-case
- Theme support: always test both dark and light modes
- Mobile-first responsive design (test at 375px width)

## File Size Awareness

- app.js is ~1500 lines - read specific sections, not the whole file
- style.css is ~1600 lines - read specific sections, not the whole file
- When modifying these large files, use targeted reads with offset/limit

## Gotchas

- No linter or formatter configured: be consistent with existing style
- No tests: manually verify changes by checking UI behavior
- All JS is loaded synchronously via script tags in index.html
- CSS has no preprocessor: plain CSS with custom properties only
- OGP images reference the Vercel deployment URL
