import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: 'e2e',
	fullyParallel: true,
	workers: 2,
	use: {
		baseURL: 'http://127.0.0.1:4173',
		trace: 'retain-on-failure',
		...(process.platform === 'win32' ? { channel: 'chrome' } : {})
	},
	webServer: [
		{
			command: `${process.platform === 'win32' ? 'npm.cmd' : 'npm'} run build && node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4173 --strictPort`,
			port: 4173,
			env: {
				DATABASE_URL: '',
				SUPABASE_URL: '',
				SUPABASE_SERVICE_ROLE_KEY: '',
				VITE_SUPABASE_URL: '',
				VITE_SUPABASE_ANON_KEY: ''
			}
		},
		{ command: 'node tests/browser-fixture/server.mjs', port: 4180 }
	]
});
