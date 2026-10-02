import { base } from '$app/paths';

/** @param {string} path */
export function menuPath(path) {
	if (!path.startsWith('/') || path.startsWith('//')) throw new Error('Invalid menu path');
	return `${base}${path}`;
}
