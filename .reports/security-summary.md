# Supply-Chain Guard Brief ? 2025-09-17

## Context
- 2025-09-08 phishing-led supply-chain attack compromised multiple npm packages (debug, chalk, ansi-styles, etc.) and briefly shipped malicious releases.
- Stylus package also experienced an erroneous security hold; ensuring deterministic install safeguards against both hostile and accidental removals.

## Step-by-step results
1. Ran `npm install --ignore-scripts` to avoid running compromised lifecycle hooks.
2. Captured dependency tree (`dependency-tree.txt`/`.json`) and CycloneDX SBOM (`sbom.json`).
3. `npm audit` clean; external checks blocked pending auth (`socket-ci.json`, `snyk-test.json`).
4. Enumerated 257 packages with lifecycle scripts (`lifecycle-scripts.json`).
5. Flagged 11 suspect packages tied to the Sept 8 incident (`suspects.json`).
6. No lockfile drift detected (`lock-diff.txt` empty).
7. Added npm `overrides` pins for affected packages and a `supplychain-guard` CI workflow to enforce them.

## High-priority suspects
- `debug@4.4.3` (critical) ? Multiple eslint toolchain paths.
- `debug@3.2.7` (critical) ? Legacy eslint-import chain.
- `chalk@4.1.2` (high) ? Used by eslint.
- `ansi-styles@4.3.0` / `6.2.3` (high) ? Chalk + CLI utilities.
- `strip-ansi@6.0.1` / `7.1.2` (medium) ? Tied to ansi-styles ecosystem.

## Follow-ups
- Provide Socket.dev and Snyk API tokens to complete external scans and update the stored logs.
- Monitor upstream advisories; update overrides once maintainers confirm safe re-releases.
- Consider pruning extraneous packages reported by npm (`@emnapi/runtime`) if not required.
