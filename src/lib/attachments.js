/** @typedef {{ name: string, url: string }} Attachment */

/** @param {unknown} value */
export function isSafeUrl(value) {
	if (typeof value !== 'string') return false;
	try {
		const url = new URL(value);
		return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password;
	} catch {
		return false;
	}
}

/** @param {unknown} input @returns {Attachment[]} */
export function parseAttachments(input) {
	try {
		const values = typeof input === 'string' ? JSON.parse(input) : input;
		if (!Array.isArray(values)) return [];
		const urls = new Set();
		return values
			.filter(
				(value) =>
					value &&
					typeof value.name === 'string' &&
					value.name.trim().length > 0 &&
					value.name.length <= 255 &&
					isSafeUrl(value.url)
			)
			.filter(({ url }) => {
				if (urls.has(url)) return false;
				urls.add(url);
				return true;
			})
			.map(({ name, url }) => ({ name: name.trim(), url }));
	} catch {
		return [];
	}
}

/** @param {string | null | undefined} input @returns {string[]} */
export function parseStringList(input) {
	try {
		const values = JSON.parse(input || '[]');
		return Array.isArray(values)
			? [...new Set(values.filter((value) => typeof value === 'string'))]
			: [];
	} catch {
		return [];
	}
}
