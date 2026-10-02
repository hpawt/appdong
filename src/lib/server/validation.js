import { error } from '@sveltejs/kit';

/** @param {FormData} form @param {string} key @param {{ trim?: boolean, max?: number }} [options] */
export function readText(form, key, { trim = true, max = 20000 } = {}) {
	const value = form.get(key);
	if (value === null) return '';
	if (typeof value !== 'string') error(400, `${key}: 텍스트 값을 입력해주세요.`);
	const text = trim ? value.trim() : value;
	if (text.length > max) error(400, `${key}: 입력값이 너무 깁니다.`);
	return text;
}

/** @param {FormData} form @param {string} key @param {readonly string[]} allowed */
export function readChoices(form, key, allowed) {
	const values = form.getAll(key);
	if (
		values.length > 30 ||
		values.some((value) => typeof value !== 'string' || !allowed.includes(value))
	) {
		error(400, `${key}: 선택값이 올바르지 않습니다.`);
	}
	return [...new Set(/** @type {string[]} */ (values))];
}

/** @param {string} password */
export function validPassword(password) {
	return password.length >= 6 && password.length <= 255;
}

/** @param {{ name: string, department: string, phone_number: string }} profile */
export function profileError(profile) {
	if (profile.name.length < 2 || profile.name.length > 255) return '성함을 올바르게 입력해주세요.';
	if (profile.department.length < 2 || profile.department.length > 255)
		return '학과를 올바르게 입력해주세요.';
	if (!/^\d{11}$/.test(profile.phone_number)) return '전화번호는 숫자 11자리로 입력해주세요.';
	return null;
}

/** @param {unknown} cause @returns {boolean} */
export function isUniqueViolation(cause) {
	if (typeof cause !== 'object' || cause === null) return false;
	if ('code' in cause && cause.code === '23505') return true;
	return 'cause' in cause && cause.cause !== cause && isUniqueViolation(cause.cause);
}
