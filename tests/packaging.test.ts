import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

type PackageJson = {
    name: string;
    main: string;
    module: string;
    files: string[];
    bin: Record<string, string>;
    exports: {
        '.': {
            require: string;
            import: string;
        };
    };
};

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const PKG = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf-8')) as PackageJson;

const normalizePath = (value: string) => value.replace(/^[.][/\\]/, '').replace(/\\/g, '/');
const resolveFromRoot = (value: string) => join(ROOT, value);

describe('packaging coherence (Bug F regression)', () => {
    it('declares the expected package name and CommonJS main entry', () => {
        expect(PKG.name).toBe('keen-builder');
        expect(normalizePath(PKG.main)).toBe('dist/index.cjs');
    });

    it('declares matching ESM entry metadata even though the file is missing', () => {
        expect(normalizePath(PKG.module)).toBe('dist/index.mjs');
        expect(normalizePath(PKG.exports['.'].import)).toBe('dist/index.mjs');
    });

    it('ships only CommonJS artifacts and a license file in dist today', () => {
        const files = readdirSync(DIST).sort();

        expect(files).toEqual(expect.arrayContaining(['cli.cjs', 'index.cjs', 'index.cjs.LICENSE.txt']));
        expect(files).not.toContain('index.mjs');
    });

    it('main entry resolves to an existing non-empty file', () => {
        const mainPath = resolveFromRoot(PKG.main);

        expect(existsSync(mainPath)).toBe(true);
        expect(statSync(mainPath).size).toBeGreaterThan(0);
    });

    it.fails('module entry resolves to an existing file (Bug F regression)', () => {
        const modulePath = resolveFromRoot(PKG.module);

        expect(existsSync(modulePath)).toBe(true);
    });

    it('every bin entry resolves to an existing file', () => {
        for (const [name, path] of Object.entries(PKG.bin)) {
            expect(existsSync(resolveFromRoot(path)), `bin.${name} -> ${path}`).toBe(true);
        }
    });

    it('exports.require resolves to the shipped CommonJS bundle', () => {
        expect(existsSync(resolveFromRoot(PKG.exports['.'].require))).toBe(true);
    });

    it.fails('exports.import resolves to an existing file (Bug F regression)', () => {
        expect(existsSync(resolveFromRoot(PKG.exports['.'].import))).toBe(true);
    });

    it('publishes only dist artifacts according to the files whitelist', () => {
        expect(PKG.files).toEqual(['dist/**']);
    });

    it('cli.cjs is more than a stub and forwards into the runtime bundle', () => {
        const cli = readFileSync(resolveFromRoot(PKG.bin['keen-builder']), 'utf-8');

        expect(cli.length).toBeGreaterThan(50);
        expect(cli).toMatch(/^#!\/usr\/bin\/env node/);
        expect(cli).toContain('require("./index.cjs")');
        expect(cli).toContain('run();');
    });

    it('ships a non-empty webpack license companion file', () => {
        const licensePath = join(DIST, 'index.cjs.LICENSE.txt');

        expect(existsSync(licensePath)).toBe(true);
        expect(statSync(licensePath).size).toBeGreaterThan(0);
    });
});
