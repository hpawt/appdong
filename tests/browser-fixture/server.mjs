// This isolated test server is never included in the production application.
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { build } from 'esbuild';
import { compile } from 'svelte/compiler';

const directory = join(process.cwd(), '.svelte-kit', 'browser-fixture');
await mkdir(directory, { recursive: true });
const styles = new Map();
await build({
	entryPoints: ['tests/browser-fixture/main.mjs'],
	bundle: true,
	format: 'esm',
	outfile: join(directory, 'app.js'),
	platform: 'browser',
	conditions: ['browser'],
	plugins: [
		{
			name: 'svelte-fixture',
			setup(builder) {
				builder.onResolve({ filter: /^\$app\/(forms|paths|navigation)$/ }, ({ path }) => ({
					path,
					namespace: 'fixture'
				}));
				builder.onLoad({ filter: /.*/, namespace: 'fixture' }, ({ path }) => ({
					contents: path.endsWith('paths')
						? 'export const resolve = path => path;'
						: path.endsWith('navigation')
							? 'export async function goto(path) { window.fixtureNavigation = path; } export function beforeNavigate(callback) { window.fixtureBeforeNavigate=callback; }'
							: `export async function applyAction(result) {window.fixtureResult=result;} export function enhance(node, submit) {
 async function handler(event) { event.preventDefault(); let cancelled = false; const callback=submit?.({formElement:node,cancel(){cancelled=true;}}); if(!cancelled) { window.fixtureSubmitted = Object.fromEntries(new FormData(node)); if(callback) await callback({result:{type:'success', data:{success:true}},update:async()=>{}}); } }
 node.addEventListener('submit',handler); return {destroy(){node.removeEventListener('submit',handler);}};
}`
				}));
				builder.onResolve({ filter: /^\$lib\// }, ({ path }) => ({
					path:
						join(process.cwd(), 'src/lib', path.slice(5)) + (path.endsWith('.svelte') ? '' : '.js')
				}));
				builder.onResolve({ filter: /^component-style:/ }, ({ path }) => ({
					path,
					namespace: 'component-css'
				}));
				builder.onLoad({ filter: /.*/, namespace: 'component-css' }, ({ path }) => ({
					contents: styles.get(path),
					loader: 'css'
				}));
				builder.onLoad({ filter: /\.svelte$/ }, async ({ path }) => {
					const compiled = compile(await readFile(path, 'utf8'), {
						filename: path,
						generate: 'client',
						dev: true,
						css: 'external'
					});
					const key = 'component-style:' + path;
					styles.set(key, compiled.css?.code || '');
					return {
						contents: compiled.js.code + `\nimport ${JSON.stringify(key)};`,
						resolveDir: dirname(path)
					};
				});
			}
		}
	]
});
await writeFile(
	join(directory, 'index.html'),
	'<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/app.css"></head><body style="background:#252830;color:#fff"><div id="app"></div><button id="unmount">편집기 종료</button><script type="module" src="/app.js"></script></body></html>'
);
createServer(async (request, response) => {
	const path = new URL(request.url, 'http://127.0.0.1:4180').pathname;
	const name = path === '/app.js' ? 'app.js' : path === '/app.css' ? 'app.css' : 'index.html';
	response.setHeader(
		'content-type',
		name.endsWith('.js') ? 'text/javascript' : name.endsWith('.css') ? 'text/css' : 'text/html'
	);
	response.end(await readFile(join(directory, name)));
}).listen(4180, '127.0.0.1');
