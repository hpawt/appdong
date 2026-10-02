// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: Pick<
				typeof import('$lib/server/db/schema').user.$inferSelect,
				'id' | 'username' | 'name' | 'role'
			> | null;
			session: typeof import('$lib/server/db/schema').session.$inferSelect | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
