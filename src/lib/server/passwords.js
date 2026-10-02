import { hash, verify } from '@node-rs/argon2';

export const passwordOptions = { memoryCost: 19456, timeCost: 2, outputLen: 32, parallelism: 1 };

/** @param {string} password */
export function hashPassword(password) {
	return hash(password, passwordOptions);
}

/** @param {string} hashedPassword @param {string} password */
export async function verifyPassword(hashedPassword, password) {
	try {
		return await verify(hashedPassword, password);
	} catch {
		return false;
	}
}
