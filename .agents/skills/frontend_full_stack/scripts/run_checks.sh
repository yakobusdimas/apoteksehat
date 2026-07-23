#!/usr/bin/env bash
set -euo pipefail

# run lint
npm run lint || true

# run unit tests
npm run test:unit -- --coverage || true

# run accessibility checks (requires axe-cli or similar)
if command -v axe > /dev/null; then
  axe ./build/index.html --save results/axe-results.json || true
else
  echo "axe not installed; skipping accessibility scan"
fi

# run audit
npm audit --json > results/npm-audit.json || true

echo "Checks complete. Results written to results/"
