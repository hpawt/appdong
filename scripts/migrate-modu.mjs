import 'dotenv/config';
import postgres from 'postgres';
import { readFile } from 'node:fs/promises';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
const client = postgres(process.env.DATABASE_URL, {
	ssl: process.env.DATABASE_SSL === 'disable' ? false : 'require',
	max: 1,
	connect_timeout: 10
});
try {
	const migration = await readFile(new URL('../migrations/0001_modu.sql', import.meta.url), 'utf8');
	await client.begin(async (transaction) => {
		await transaction.unsafe(migration);
	});
	console.log('일정·폼·응답 테이블을 생성했습니다. 기존 데이터는 유지됩니다.');
} catch {
	console.error('기능 테이블 생성에 실패했습니다. DB 연결과 권한을 확인해주세요.');
	process.exitCode = 1;
} finally {
	await client.end();
}
