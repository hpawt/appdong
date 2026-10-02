import sanitizeHtml from 'sanitize-html';
import { error } from '@sveltejs/kit';
import { parseAttachments } from '$lib/attachments';
import { readText } from '$lib/server/validation';

/** @param {string} content */
export function sanitizeContent(content) {
	return sanitizeHtml(content, {
		allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img'],
		allowedAttributes: {
			'*': ['class', 'style'],
			a: ['href', 'title', 'target', 'rel'],
			img: ['src', 'alt', 'width', 'height'],
			li: ['data-list']
		},
		allowedClasses: {
			'*': [
				'ql-align-center',
				'ql-align-right',
				'ql-align-justify',
				'ql-size-small',
				'ql-size-large',
				'ql-size-huge',
				'ql-font-serif',
				'ql-font-monospace',
				...Array.from({ length: 8 }, (_, i) => 'ql-indent-' + (i + 1))
			]
		},
		allowedStyles: {
			'*': {
				color: [/^#[0-9a-f]{3,8}$/i, /^rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)$/],
				'background-color': [/^#[0-9a-f]{3,8}$/i, /^rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)$/],
				'text-align': [/^(?:left|right|center|justify)$/]
			}
		},
		allowedSchemes: ['https', 'http', 'mailto'],
		allowedSchemesByTag: { img: ['https', 'http'] },
		allowProtocolRelative: false,
		transformTags: { a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }) }
	});
}

/** @param {FormData} form */
export function readAnnouncement(form) {
	const title = readText(form, 'title', { max: 255 });
	const content = sanitizeContent(readText(form, 'content', { max: 200000 }));
	const text = sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} }).trim();
	if (!title || (!text && !/<img\s/.test(content))) error(400, '제목과 내용을 모두 입력해주세요.');
	const raw = readText(form, 'attachments', { max: 30000 }) || '[]';
	let values;
	try {
		values = JSON.parse(raw);
	} catch {
		error(400, '첨부파일 정보가 올바르지 않습니다.');
	}
	const attachments = parseAttachments(values);
	if (!Array.isArray(values) || values.length > 20 || attachments.length !== values.length)
		error(400, '첨부파일 정보가 올바르지 않습니다.');
	return { title, content, attachments: JSON.stringify(attachments) };
}
