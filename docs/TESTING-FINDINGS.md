# keen-project-watch-builder-pkg — Testing Findings

**Date:** 2026-04-13
**Tests added:** 20
**Tests passing:** 17 (failing: 0; known-regression assertions: 3)
**Source files read:** 5

## High findings

### [F1] `package.json` Advertises ESM Entry Points That Do Not Exist — HIGH
**Files:** `package.json:4-24`, `dist/`
**What it does:** The package advertises `dist/index.mjs` through both `module` and `exports.import`.
**What's wrong:** `dist/` only contains `cli.cjs`, `index.cjs`, and `index.cjs.LICENSE.txt`. There is no `index.mjs`, so any ESM consumer fails immediately with `ERR_MODULE_NOT_FOUND`.
**Repro:** `node --input-type=module -e "import('./dist/index.mjs')"`
**Tests that expose it:** `tests/packaging.test.ts:52`, `tests/packaging.test.ts:68`, `tests/esm-smoke.test.ts:27`, `tests/esm-smoke.test.ts:33`, `tests/esm-smoke.test.ts:39`
**Notes for the cleanup pass:** Either ship a real `dist/index.mjs` bundle or stop advertising ESM entry points in package metadata.

## Medium findings

### [F2] Drift Check Result: The Pkg Repo Is Functionally Separate From The Source Repo — MEDIUM
**Files:** `D:/All Repos/keen-extensions/keen-project-watch-builder/package.json`, `dist/index.cjs`
**What it does:** The source repo contains the implementation and build config; this repo stores only the publishable artifact snapshot.
**What's wrong:** The requested byte-for-byte diff against `D:/All Repos/keen-extensions/keen-project-watch-builder/dist/index.cjs` cannot be performed because the source repo currently does not check in that file. That means this package repo cannot be verified against a checked-in source artifact and is effectively a separate hand-carried build output.
**Repro:** `Test-Path 'D:/All Repos/keen-extensions/keen-project-watch-builder/dist/index.cjs'` returns `False`.
**Tests that expose it:** N/A (manual cross-repo verification)
**Notes for the cleanup pass:** Build and compare/publish artifacts from CI instead of relying on manual copy steps between repos.

### [F3] The Shipped `cli.cjs` Is A 60-Byte Wrapper That Does Not Implement Help Handling — MEDIUM
**File:** `dist/cli.cjs`
**What it does:** The CLI only requires `./index.cjs` and calls `run()`.
**What's wrong:** The entry point is only 60 bytes long and does not implement a dedicated `--help` flow. Running `node dist/cli.cjs --help` still falls straight into runtime initialization, logs missing-config errors, and exits `0`.
**Repro:** `node dist/cli.cjs --help`
**Tests that expose it:** `tests/packaging.test.ts:76`, `tests/cjs-smoke.test.cjs:23`, `tests/cjs-smoke.test.cjs:35`
**Notes for the cleanup pass:** If a CLI help surface is intended, parse args before delegating into the project runtime.

### [F4] The Manual Copy-Publish Workflow Has No Coherence Guard Between Metadata And Artifacts — MEDIUM
**Files:** `package.json`, `dist/`
**What it does:** The repo publishes prebuilt files from `dist/**`.
**What's wrong:** Package metadata and shipped artifacts can drift independently. Bug F is the direct example: metadata still claims an ESM build exists even though only CommonJS files were copied into `dist/`.
**Repro:** Compare `package.json` entry points with the actual contents of `dist/`.
**Tests that expose it:** `tests/packaging.test.ts:33`, `tests/packaging.test.ts:38`, `tests/packaging.test.ts:72`
**Notes for the cleanup pass:** Add a packaging validation step before publish that verifies every `main`, `module`, `exports`, and `bin` target exists.
