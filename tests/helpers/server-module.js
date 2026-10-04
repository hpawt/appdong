import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createContext, SourceTextModule, SyntheticModule } from 'node:vm';

const root = fileURLToPath(new URL('../../', import.meta.url));

/**
 * Execute actual server sources with explicitly mocked DB/session dependencies.
 * @param {string} path
 * @param {Record<string, Record<string, unknown>>} [dependencies]
 * @returns {Promise<Record<string, any>>}
 */
export async function loadServerModule(path, dependencies = {}) {
	const context = createContext({
		console,
		crypto,
		URL,
		FormData,
		Request,
		Response,
		File,
		TextEncoder,
		TextDecoder,
		Uint8Array,
		Date,
		Error
	});
	/** @type {Map<string, Promise<import('node:vm').Module>>} */
	const cache = new Map();
	/** @param {Record<string, unknown>} values */
	function synthetic(values) {
		return new SyntheticModule(
			Object.keys(values),
			function () {
				for (const [key, value] of Object.entries(values)) this.setExport(key, value);
			},
			{ context }
		);
	}
	/** @param {string} filename @returns {Promise<import('node:vm').Module>} */
	async function sourceModule(filename) {
		const cached = cache.get(filename);
		if (cached) return cached;
		const loading = readFile(filename, 'utf8').then(
			(code) => new SourceTextModule(code, { context, identifier: filename })
		);
		cache.set(filename, loading);
		return loading;
	}
	const module = await sourceModule(resolve(root, path));
	// Link the complete graph once. Repeated shared imports must not link concurrently.
	await module.link(async (specifier, referencing) => {
		if (dependencies[specifier]) return synthetic(dependencies[specifier]);
		if (specifier.startsWith('$lib/')) {
			assert.ok(!specifier.startsWith('$lib/server/db'), 'Tests must explicitly replace the DB');
			return sourceModule(resolve(root, 'src/lib', specifier.slice(5) + '.js'));
		}
		if (specifier.startsWith('.'))
			return sourceModule(resolve(dirname(referencing.identifier), specifier));
		assert.ok(!specifier.startsWith('$'), `Missing mock for ${specifier}`);
		return synthetic(await import(specifier));
	});
	await module.evaluate();
	return /** @type {Record<string, any>} */ (module.namespace);
}
