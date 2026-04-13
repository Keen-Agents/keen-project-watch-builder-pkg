const { spawnSync } = require('node:child_process');
const { readFileSync } = require('node:fs');
const { join, resolve } = require('node:path');

const ROOT = resolve(__dirname, '..');
const PKG = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf-8'));
const api = require(join(ROOT, PKG.main));

describe('commonjs smoke', () => {
    it('requires the shipped CommonJS entry as an object', () => {
        expect(api).toBeTypeOf('object');
    });

    it('exposes only the run API from the CommonJS bundle', () => {
        expect(Object.keys(api)).toEqual(['run']);
    });

    it('exports run as a single-argument function', () => {
        expect(api.run).toBeTypeOf('function');
        expect(api.run.length).toBe(1);
    });

    it('executes the packaged cli with a zero exit status when keen.json is missing', () => {
        const result = spawnSync(process.execPath, ['dist/cli.cjs'], {
            cwd: ROOT,
            encoding: 'utf-8'
        });
        const output = `${result.stdout}${result.stderr}`;

        expect(result.status).toBe(0);
        expect(output).toContain('Config path does not exist!');
        expect(output).toContain('Init is empty!');
    });

    it('ignores --help and still falls through to runtime initialization', () => {
        const result = spawnSync(process.execPath, ['dist/cli.cjs', '--help'], {
            cwd: ROOT,
            encoding: 'utf-8'
        });
        const output = `${result.stdout}${result.stderr}`;

        expect(result.status).toBe(0);
        expect(output).toContain('keen.json');
        expect(output).toContain('Init is empty!');
    });
});
