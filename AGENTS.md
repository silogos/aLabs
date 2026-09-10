# Repo rules — pmin

## Documentation

1. **All documentation lives in `docs/`.**
   - Product/foundation/module specs: `docs/`, `docs/foundation/`, `docs/modules/`
   - Technical docs & ADRs: `docs/tech/`
   - Visual identity & design specs: `docs/design/`
   - Per-feature implementation/migration plans: `docs/plans/`
   - The only exception is the root `README.md`. Never create standalone `.md` docs in the repo root or inside source directories; plan/spec files discovered elsewhere must be moved into `docs/`.

2. **Docs are updated in the same change, not later.**
   - Any change that alters documented behavior — API contract, data model, conventions, architecture, module/foundation specs — must update the corresponding document under `docs/` in the same PR.
   - Pure code changes with no documented-behavior impact don't require doc edits, but if in doubt, update the doc.
   - New significant decisions get an ADR in `docs/tech/adr/` (next number in sequence).
