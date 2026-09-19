# Seran circular controls v1 — Codex report

Created a reusable circular advisor-button candidate using Seran's muted blue-gray accent. The portrait remains separate from the frame so Unity can replace character images without regenerating the UI.

## Candidate assets

- Circular portrait frame: normal, hover, speaking, selected, disabled.
- Separate nameplate, role badge, new-opinion marker, speaking indicator and focus-seat control.
- Five preview composites using the existing Seran portrait; preview files are not runtime assets.
- SVG masters and transparent PNG exports under `Asset_Library/UI_System/.../AdvisorControls/Seran/`.

## Rules

- No baked text.
- Speaking and selected states differ by shape as well as color.
- Runtime name/role text remains TextMeshPro.
- The structure can be reused for other advisors by changing accent and portrait.

Unity scripts, Ink and runtime resources were not modified.
