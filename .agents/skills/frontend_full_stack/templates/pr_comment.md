Title: [Frontend Review] Temuan pada PR #{{PR_NUMBER}}

Summary:
- Visual: {{visual_score}}
- UX: {{ux_score}}
- Code: {{code_score}}
- Security: {{security_score}}
- Performance: {{performance_score}}

Findings:
{{#each findings}}
- {{this.title}} - Severity: {{this.severity}} - Files: {{this.files}} - Suggestion: {{this.suggestion}}
{{/each}}

Automated checks run:
- lint: {{lint_result}}
- unit tests: {{unit_test_result}}
- accessibility: {{axe_result}}
- bundle analyze: {{bundle_result}}

Next steps:
1. Address high-severity issues.
2. Add tests for uncovered flows.
3. Re-run checks and update PR.
