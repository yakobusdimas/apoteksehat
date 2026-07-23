---
name: frontend_full_stacglm-5k
description: >-
  Skill untuk menstandardisasi dan mengotomatiskan tinjauan fitur front-end lengkap:
  desain visual, UI/UX, code review, pengujian, dan pemeriksaan keamanan. Cocok untuk
  reviewer manusia maupun agen otomatis yang menilai PR, membuat checklist perbaikan,
  dan menghasilkan tugas actionable bagi pengembang.
---

# Ringkasan
Skill ini menyediakan panduan langkah-demi-langkah dan checklist untuk melakukan:
- Frontend design review (visual, warna, tipografi, aksesibilitas)
- UI/UX heuristic review (flow, affordance, error states)
- Code review untuk frontend (struktur komponen, state management, testing)
- Security check khusus front-end (XSS, CSP, sensitive data leak)
- Performance & bundle-size check
- Automated & manual test recommendations

Tujuan: membuat penilaian yang konsisten, bisa direproduksi, dan menjadikan hasil review
sebagai daftar tindakan (issue/PR comments) yang jelas.

## Kapan Menggunakan
- Saat ada Pull Request (PR) fitur UI/UX baru
- Sebelum merge ke branch release / main
- Saat audit produk berkala (monthly UI/UX & security sweep)
- Untuk onboarding reviewer baru agar mengikuti standar sama

## Input yang Diharapkan
- Link PR atau commit range
- Build preview URL (Vercel, Netlify, localhost + port, Storybook)
- Desain referensi (Figma/Sketch link) bila ada
- Checklist khusus produk (brand color tokens, font, accessibility standard)

## Output yang Dihasilkan
- Ringkasan skor: Visual / UX / Code / Security / Performance (0-100 atau Low/Med/High)
- Daftar temuan (title, severity, lokasi/file, bukti screenshot/DOM path)
- Reproduksi langkah (how to reproduce)
- Saran perbaikan (code snippets, CSS/token fixes, accessibility attributes)
- Tests to add (unit/integ/e2e) with example test names
- Optional: patch/PR draft atau comment-ready templates untuk maintainers

## Alur Langkah Kerja (Step-by-step)
1. Persiapan
   - Pastikan tersedia preview URL. Jika tidak ada, jalankan build lokal atau Storybook.
   - Ambil design reference dan acceptance criteria.
2. Visual & Design Review
   - Periksa tipografi: ukuran, line-height, scale konsisten.
   - Warna & aksesibilitas: contrast ratio >= 4.5:1 untuk teks normal, 3:1 untuk large text.
   - Spacing & grid: gunakan design tokens, konsistensi spacing (8px grid).
   - Iconography & imagery: resolusi, alt text pada img.
   - Micro-interactions: hover/focus/pressed states terlihat.
3. UI/UX Heuristic Review
   - Flow: apakah user dapat menyelesaikan primary task dalam < 3 taps/clicks?
   - Error states: jelas, actionable, tidak bocor stack traces.
   - Affordance: tombol terlihat clickable, disabled states clear.
   - Form validation: inline validation, client-side + server-side.
   - Internationalization: tanggal/angka/RTL checks jika relevan.
4. Code Review (Frontend)
   - Struktur file: components kecil dan reusable, separation presentational vs container.
   - State management: minimal global state; prefer local state atau context untuk UI-only state.
   - Props & types: semua komponen ter-typed (TS) dan prop drilling diminimalkan.
   - CSS: gunakan design tokens, avoid !important, scoped styles.
   - Performance: memoization (React.memo/useMemo), avoid expensive re-renders.
   - Tests: unit tests untuk logic, integration/e2e untuk user flows.
   - Linting & formatting: ESLint, Prettier, no console.log leftover.
5. Security Review (Frontend-focused)
   - XSS: escape user content, avoid dangerouslySetInnerHTML, sanitize input ketika perlu.
   - CSP: review index.html / meta CSP header; sarankan strict CSP policies.
   - Secrets & tokens: no API keys in frontend; ensure env variables not baked into public bundles.
   - Storage: do not store sensitive PII in localStorage/sessionStorage without encryption policy.
   - Dependencies: quick check for high-severity vulnerabilities in package.json (npm audit).
6. Performance & Bundle
   - Analyze bundle with source-map-explorer atau vite-plugin-visualizer.
   - Lazy-load routes/components, compress images, use modern image formats (AVIF/WebP).
   - Prefer CSS containment and reduce large repaints.
7. Accessibility (a11y)
   - Keyboard navigation, focus order, focus-visible states.
   - ARIA roles where appropriate; avoid redundant ARIA.
   - Use automated tools (axe-core) and manual checks.
8. Reporting
   - Buat template issue/PR comment berisi temuan dan prioritas.
   - Sertakan reproducer minimal (DOM selector / code snippet).

## Checklist Terperinci (Gunakan saat review)

Visual & Design
- [ ] Typographic scale sesuai token
- [ ] Color contrast OK (AA/AAA) untuk teks kritikal
- [ ] Consistent spacing (8px grid)
- [ ] Images memiliki alt text
- [ ] Icons pixel-aligned and consistent

UX
- [ ] Primary task flow minimal langkah
- [ ] Error & success states jelas
- [ ] Empty states handled
- [ ] Undo or confirmation untuk destructive actions

Code
- [ ] Komponen < 200 LOC jika memungkinkan
- [ ] Tidak ada console.log/debugger
- [ ] Semua fungsi/komponen teruji unit
- [ ] Typescript types lengkap
- [ ] Tidak ada hard-coded strings (i18n ready)

Security
- [ ] Tidak ada innerHTML yang tidak disanitasi
- [ ] CSP headers disarankan/diterapkan
- [ ] No secrets in code
- [ ] Dependency vulnerabilities scanned

Performance
- [ ] Bundle size under threshold (project-specific)
- [ ] Lazy loading applied
- [ ] Images optimized

Accessibility
- [ ] Keyboard navigation
- [ ] Landmark roles present
- [ ] aria-* used only when needed
- [ ] Labels for form controls

## Contoh Template Output (PR Comment)
Title: [Frontend Review] Temuan pada PR #<n>

Summary:
- Visual: Low issues
- UX: Medium (form validation missing)
- Code: Low
- Security: Low
- Performance: Medium

Findings:
1) Form validation not shown on blur
   - Severity: Medium
   - Files: src/components/CheckoutForm.tsx
   - Reproduction: open /checkout, submit empty form
   - Fix suggestion: add onBlur validation + aria-invalid attribute + unit test

Automated checks to run:
- npm run lint
- npm run test:unit -- --coverage
- npx axe ./build/index.html (or run axe in browser console)

## Tools & Skills yang Disarankan (Dependencies)
- Design: Figma, Zeplin (for design spec)
- Dev: Node.js, pnpm/npm, Vite/Create React App/Next.js
- Testing: Jest, React Testing Library, Playwright or Cypress
- Accessibility: axe-core, lighthouse
- Security: npm audit, Snyk (optional), CSP reporting setup
- Performance: source-map-explorer, vite-plugin-visualizer
- Linting: ESLint (with TypeScript), Stylelint (optional), Prettier

## Integrasi Otomasi (Opsional)
- GitHub Actions / GitLab CI pipeline steps:
  - lint
  - unit tests
  - build + bundle analysis
  - accessibility scan (axe)
  - npm audit
  - optionally post results as PR checks or comments

## Example Commands
- Lint: npm run lint
- Unit tests: npm run test:unit
- E2E: npx playwright test
- Bundle analyze: npx source-map-explorer dist/assets/*.js

## Contoh Checklist Programatik (JSON)
Berikan output JSON ketika diminta agar mudah diintegrasikan ke bot yang menilai PR.

{
  "visual": {"score": 90, "issues": []},
  "ux": {"score": 75, "issues": [{"title":"Form validation missing","severity":"medium","file":"src/components/CheckoutForm.tsx"}]},
  "code": {"score": 85, "issues": []},
  "security": {"score": 95, "issues": []},
  "performance": {"score": 70, "issues": []}
}

## Best Practices / Golden Rules
- Prefer small PRs focusing on single user story.
- Keep design tokens single source of truth.
- Automate checks in CI; manual review focuses on subjective / heuristic items.

## How to Extend Skill
Letakkan helper scripts di `skills/frontend_full_stack/scripts/` dan contoh issue templates di `skills/frontend_full_stack/templates/`.
Untuk menambahkan pemeriksaan baru, edit SKILL.md dan berikan contoh input/expected output.

## References
- WCAG 2.1
- OWASP Top 10 (frontend-relevant items)
- React Best Practices
- Axe-core docs


[!NOTE]
Skill ini ditulis agar bisa dipakai oleh reviewer manusia dan agen otomatis. Jika Anda ingin
mengubah bahasa output, tambahkan opsi `language` di frontmatter dan implementasikan
translator step di tooling agen Anda.
