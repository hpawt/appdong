import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

import { env } from '$env/dynamic/private';

/** @type {import('drizzle-orm/postgres-js').PostgresJsDatabase<typeof schema> | undefined} */
let database;

// 빌드와 공개 정적 페이지는 DB 설정 없이도 사용할 수 있습니다.
export const db = new Proxy(
	/** @type {import('drizzle-orm/postgres-js').PostgresJsDatabase<typeof schema>} */ ({}),
	{
		get(_target, property) {
			if (!database) {
				if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
				const client = postgres(env.DATABASE_URL, {
					ssl: env.DATABASE_SSL === 'disable' ? false : 'require',
					max: 5,
					connect_timeout: 5,
					idle_timeout: 20
				});
				database = drizzle(client, { schema });
			}
			const value = Reflect.get(database, property);
			return typeof value === 'function' ? value.bind(database) : value;
		}
	}
);
