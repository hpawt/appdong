import { error, fail, isHttpError } from '@sveltejs/kit';
import { MAX_DEFINITION_BYTES } from '$lib/modu-validation';
export {
	MAX_DEFINITION_BYTES,
	validateDefinition,
	validateAnswers,
	readDefinition,
	readEvent
} from '$lib/modu-validation';

/** @param {unknown} cause */
export function inputFailure(cause) {
	if (isHttpError(cause) && [400, 403, 409, 413].includes(cause.status))
		return fail(cause.status, { message: cause.body.message });
	throw cause;
}

/** Avoid reading unbounded request bodies, including chunked requests. @param {Request} request */
export async function boundedFormData(request) {
	const contentType = request.headers.get('content-type') || '';
	if (
		!contentType.startsWith('application/x-www-form-urlencoded') &&
		!contentType.startsWith('multipart/form-data')
	)
		error(415, '폼 요청이 필요합니다.');
	if (!request.body) error(400, '입력 내용이 없습니다.');
	const limit = MAX_DEFINITION_BYTES * 8; // UTF-8 form URL encoding and field metadata.
	const reader = request.body.getReader();
	/** @type {Uint8Array[]} */ const chunks = [];
	let size = 0;
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			size += value.length;
			if (size > limit) {
				await reader.cancel();
				error(413, '입력 내용이 너무 깁니다.');
			}
			chunks.push(value);
		}
	} finally {
		reader.releaseLock();
	}
	const bytes = new Uint8Array(size);
	let offset = 0;
	for (const chunk of chunks) {
		bytes.set(chunk, offset);
		offset += chunk.length;
	}
	try {
		return await new Response(bytes, { headers: { 'content-type': contentType } }).formData();
	} catch {
		error(400, '입력 형식을 확인해주세요.');
	}
}
