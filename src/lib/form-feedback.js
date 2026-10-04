import { tick } from 'svelte';

/** @param {HTMLFormElement} form */
export function beginSubmission(form) {
	if (form.getAttribute('aria-busy') === 'true') return null;
	const buttons = Array.from(form.querySelectorAll('button[type="submit"]'));
	const previous = buttons.map((button) => ({
		button: /** @type {HTMLButtonElement} */ (button),
		disabled: /** @type {HTMLButtonElement} */ (button).disabled,
		label: button.textContent
	}));
	form.setAttribute('aria-busy', 'true');
	for (const { button } of previous) {
		button.disabled = true;
		button.textContent = '처리 중…';
	}
	const status = document.createElement('p');
	status.setAttribute('role', 'status');
	status.textContent = '요청을 처리하고 있습니다.';
	form.append(status);
	return () => {
		form.removeAttribute('aria-busy');
		for (const { button, disabled, label } of previous) {
			button.disabled = disabled;
			button.textContent = label;
		}
		status.remove();
	};
}

/** @param {HTMLFormElement} form */
export async function focusFormError(form) {
	await tick();
	const message = form.parentElement?.querySelector('.error-message');
	if (message instanceof HTMLElement) {
		message.setAttribute('tabindex', '-1');
		message.focus();
	}
}

/** Long answers only, explicit opt-in, current browser tab, 24-hour expiry.
 * @param {HTMLFormElement} node
 * @param {{key: string, onDirty: (dirty: boolean) => void}} options
 */
export function applicationDraft(node, options) {
	const checkbox = node.querySelector('[data-draft-toggle]');
	const restore = node.querySelector('[data-draft-restore]');
	const clear = node.querySelector('[data-draft-clear]');
	const statusElement = node.querySelector('[data-draft-status]');
	if (!(checkbox instanceof HTMLInputElement) || !restore || !clear || !statusElement) return;
	const status = /** @type {HTMLElement} */ (statusElement);
	const fields = [
		'motivation',
		'specificExperience',
		'vibeServiceIdea',
		'bootcampProjectIdea',
		'mentorAvailableTime',
		'mentorExperience',
		'finalWords'
	];
	let dirty = false;
	/** @type {Record<string, string>} */ let answers = {};
	function readSaved() {
		try {
			const saved = JSON.parse(sessionStorage.getItem(options.key) || 'null');
			if (
				!saved ||
				typeof saved.savedAt !== 'number' ||
				Date.now() - saved.savedAt > 86400000 ||
				saved.savedAt > Date.now() ||
				!saved.answers ||
				typeof saved.answers !== 'object'
			) {
				sessionStorage.removeItem(options.key);
				return {};
			}
			return Object.fromEntries(
				fields
					.filter((name) => typeof saved.answers[name] === 'string')
					.map((name) => [name, saved.answers[name].slice(0, 10000)])
			);
		} catch {
			return {};
		}
	}
	answers = readSaved();
	status.textContent = Object.keys(answers).length
		? '이 탭에 저장된 답변이 있습니다. 복원 버튼으로 불러오세요.'
		: '임시 저장은 선택한 경우에만 이 브라우저 탭에서 작동합니다.';
	function save() {
		if (!(/** @type {HTMLInputElement} */ (checkbox).checked)) return;
		for (const name of fields) {
			const field = node.elements.namedItem(name);
			if (field instanceof HTMLTextAreaElement) answers[name] = field.value.slice(0, 10000);
		}
		try {
			const serialized = JSON.stringify({ savedAt: Date.now(), answers });
			if (new TextEncoder().encode(serialized).length > 64000) {
				status.textContent = '답변이 너무 길어 임시 저장하지 못했습니다.';
				return;
			}
			sessionStorage.setItem(options.key, serialized);
			status.textContent = '긴 답변을 이 탭에 임시 저장했습니다.';
		} catch {
			status.textContent = '브라우저에서 임시 저장을 사용할 수 없습니다. 답변을 따로 보관해주세요.';
		}
	}
	function changed(/** @type {Event} */ event) {
		if (
			!(
				event.target instanceof HTMLInputElement ||
				event.target instanceof HTMLTextAreaElement ||
				event.target instanceof HTMLSelectElement
			) ||
			event.target === checkbox
		)
			return;
		dirty = true;
		options.onDirty(true);
		save();
	}
	function erased() {
		try {
			sessionStorage.removeItem(options.key);
		} catch {
			/* Browsers may deny storage. */
		}
		answers = {};
		/** @type {HTMLInputElement} */ (checkbox).checked = false;
		status.textContent = '임시 저장본을 삭제했습니다. 작성 중인 화면은 유지됩니다.';
	}
	function restored() {
		answers = readSaved();
		let count = 0;
		for (const [name, value] of Object.entries(answers)) {
			const field = node.elements.namedItem(name);
			if (field instanceof HTMLTextAreaElement) {
				field.value = value;
				field.dispatchEvent(new Event('input', { bubbles: true }));
				count++;
			}
		}
		/** @type {HTMLInputElement} */ (checkbox).checked = count > 0;
		status.textContent = count
			? '답변을 복원했습니다. 선택한 활동의 추가 문항도 확인해주세요.'
			: '복원할 답변이 없습니다.';
	}
	function consentChanged() {
		if (/** @type {HTMLInputElement} */ (checkbox).checked) save();
		else erased();
	}
	function saved() {
		dirty = false;
		options.onDirty(false);
		erased();
	}
	function warn(/** @type {BeforeUnloadEvent} */ event) {
		if (dirty && node.getAttribute('aria-busy') !== 'true') {
			event.preventDefault();
			event.returnValue = '';
		}
	}
	node.addEventListener('input', changed);
	checkbox.addEventListener('change', consentChanged);
	restore.addEventListener('click', restored);
	clear.addEventListener('click', erased);
	node.addEventListener('form:saved', saved);
	window.addEventListener('beforeunload', warn);
	return {
		destroy() {
			node.removeEventListener('input', changed);
			checkbox.removeEventListener('change', consentChanged);
			restore.removeEventListener('click', restored);
			clear.removeEventListener('click', erased);
			node.removeEventListener('form:saved', saved);
			window.removeEventListener('beforeunload', warn);
		}
	};
}
