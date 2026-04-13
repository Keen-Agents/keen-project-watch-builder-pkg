import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';

type PackageJson = {
    module: string;
    exports: {
        '.': {
            import: string;
        };
    };
};

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const PKG = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf-8')) as PackageJson;

const normalizePath = (value: string) => value.replace(/^[.][/\\]/, '').replace(/\\/g, '/');

describe('esm smoke (Bug F regression)', () => {
    it('declares the same import target in module and exports.import', () => {
        expect(normalizePath(PKG.module)).toBe('dist/index.mjs');
        expect(normalizePath(PKG.exports['.'].import)).toBe('dist/index.mjs');
    });

    it.fails('imports the declared ESM entry cleanly (Bug F regression)', async () => {
        const moduleUrl = pathToFileURL(join(ROOT, PKG.module)).href;

        await import(moduleUrl);
    });

    it('direct import of dist/index.mjs rejects with ERR_MODULE_NOT_FOUND', async () => {
        const moduleUrl = pathToFileURL(join(ROOT, 'dist', 'index.mjs')).href;

        await expect(import(moduleUrl)).rejects.toHaveProperty('code', 'ERR_MODULE_NOT_FOUND');
    });

    it('node --input-type=module surfaces the missing ESM artifact at process level', () => {
        const result = spawnSync(process.execPath, ['--input-type=module', '-e', "import('./dist/index.mjs')"], {
            cwd: ROOT,
            encoding: 'utf-8'
        });
        const output = `${result.stdout}${result.stderr}`;

        expect(result.status).not.toBe(0);
        expect(output).toContain('ERR_MODULE_NOT_FOUND');
        expect(output).toContain('index.mjs');
    });
});
