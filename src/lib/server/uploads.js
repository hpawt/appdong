import { error } from '@sveltejs/kit';

const types = new Map([
	['png', 'image/png'],
	['jpg', 'image/jpeg'],
	['jpeg', 'image/jpeg'],
	['gif', 'image/gif'],
	['webp', 'image/webp'],
	['pdf', 'application/pdf'],
	['txt', 'text/plain'],
	['zip', 'application/zip'],
	['docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
]);
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/** @param {FormDataEntryValue | null} value */
export async function validateUpload(value) {
	if (!(value instanceof File) || value.size === 0) error(400, '업로드할 파일이 없습니다.');
	if (value.size > MAX_UPLOAD_BYTES) error(413, '파일은 10MB 이하로 업로드해주세요.');
	const name = [...value.name]
		.map((char) => (char.charCodeAt(0) < 32 || ['/', '\\'].includes(char) ? '_' : char))
		.join('')
		.slice(-255);
	const extension = name.split('.').pop()?.toLowerCase() || '';
	const contentType = types.get(extension);
	if (
		!contentType ||
		(value.type &&
			value.type !== contentType &&
			!(extension === 'zip' && value.type === 'application/x-zip-compressed'))
	)
		error(400, '지원하지 않는 파일 형식입니다.');
	const header = new Uint8Array(await value.slice(0, 12).arrayBuffer());
	const signature = new TextDecoder('ascii').decode(header);
	const valid =
		extension === 'txt' ||
		(extension === 'png' && header[0] === 0x89 && signature.slice(1, 4) === 'PNG') ||
		(['jpg', 'jpeg'].includes(extension) &&
			header[0] === 0xff &&
			header[1] === 0xd8 &&
			header[2] === 0xff) ||
		(extension === 'gif' && /^GIF8[79]a/.test(signature)) ||
		(extension === 'webp' && signature.startsWith('RIFF') && signature.slice(8, 12) === 'WEBP') ||
		(extension === 'pdf' && signature.startsWith('%PDF-')) ||
		(['zip', 'docx'].includes(extension) && signature.startsWith('PK'));
	if (!valid) error(400, '파일 내용이 확장자와 일치하지 않습니다.');
	return { file: value, name, extension, contentType };
}
