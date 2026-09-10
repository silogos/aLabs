# Brand spec — aLabs / Northwind org suite

Source: `designs/app/alabs-org-dashboard.html` (reference match, extracted not guessed).

## Six core tokens (OKLch)

```css
--bg:      oklch(98.4% 0.002 250);   /* app canvas, near-white cool grey   */
--surface: oklch(100% 0 0);         /* cards, tables, topbar              */
--fg:      oklch(22%0.013 250);    /* body text                          */
--muted:   oklch(52% 0.012 250);    /* secondary text, labels             */
--border:  oklch(91% 0.004 250);    /* 1px hairlines                      */
--accent:  oklch(54% 0.18258);     /* indigo — one accent, rare on dark  */
```

Supporting: surface-2 `oklch(96.6% 0.003 250)`, surface-3 `oklch(94%0.004 250)`, rail `oklch(19% 0.013 255)` (dark sidebar), rail-fg `oklch(74% 0.012 255)`, accent-soft `oklch(96% 0.03258)`. Status: ok 150, warn 70, danger 25, info 240, violet 300 — always soft-bg pill + dot + darker text.

## Type stacks

- Body/display (single utilitarian family — data-dense tool): `-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, 'Helvetica Neue', Arial, sans-serif` at13.5px/1.45; headings12.5–14px at650 weight, `-0.01em`.
- Mono (numerics, keys, timestamps, counts): `ui-monospace, 'SF Mono', 'JetBrains Mono', 'IBM Plex Mono', Menlo, Consolas, monospace`, tabular-nums.

## Posture rules (observed)

1. Dark left rail (236px, collapsable to 62px) against light content; white-on-rail nav items, indigo 2px active marker bar.
2. Everything is a card: `--surface`, 1px border, 12px radius, near-invisible shadow; panel-head with12.5px/650 title + muted meta + right-aligned controls.
3. Density over drama:44px table rows, 12.5px cell text, mono micro-labels at 10–11px uppercase0.09em tracking.
4. One indigo accent per region (active nav / primary CTA / link); status color only as soft pill or bar fill, never decoration.
5. Rounded-soft geometry: 8px controls, 6px small, 12px cards, 999px pills/bars; 6px progress bars with status fills.
6. Feedback is quiet: pill toasts on dark scrim, `.18s ease` view fade, no big motion.
