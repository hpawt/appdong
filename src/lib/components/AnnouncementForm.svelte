<script>
	import { onMount, onDestroy } from 'svelte';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import 'quill/dist/quill.snow.css';

	/** @type {string} */
	export let action = '?/create';
	/** @type {string} */
	export let initialTitle = '';
	/** @type {string} */
	export let initialContent = '';
	/** @type {Array<{name: string, url: string}>} */
	export let initialAttachments = [];
	/** @type {string} */
	export let submitLabel = '공지 등록';
	/** @type {string} */
	export let message = '';

	let title = initialTitle;
	let contentHTML = initialContent;
	/** @type {Array<{name: string, url: string}>} */
	let attachments = [...initialAttachments];

	let isUploading = false;
	let editorLoading = true;
	let editorError = '';
	let uploadError = '';
	let destroyed = false;

	/** @type {HTMLDivElement} */
	let editorElement;
	/** @type {import('quill').default | undefined} */
	let quillInstance;
	/** @type {HTMLInputElement} */
	let attachmentInput;
	/** @type {AbortController | null} */
	let abortController = null;

	onMount(async () => {
		abortController = new AbortController();
		try {
			const Quill = (await import('quill')).default;
			if (!editorElement || destroyed) return;

			quillInstance = new Quill(editorElement, {
				theme: 'snow',
				modules: {
					toolbar: {
						container: [
							[{ header: [1, 2, 3, false] }],
							['bold', 'italic', 'underline'],
							[{ list: 'ordered' }, { list: 'bullet' }],
							['link', 'image', 'clean']
						],
						handlers: { image: imageHandler }
					}
				}
			});

			if (initialContent) {
				quillInstance.clipboard.dangerouslyPasteHTML(initialContent);
			}
			quillInstance.on('text-change', handleTextChange);
			editorLoading = false;
		} catch {
			if (!destroyed) {
				editorError = '에디터 로드 실패';
				editorLoading = false;
			}
		}
	});

	function handleTextChange() {
		if (quillInstance && !destroyed) {
			contentHTML = quillInstance.root.innerHTML;
		}
	}

	onDestroy(() => {
		destroyed = true;
		if (quillInstance) quillInstance.off('text-change', handleTextChange);
		if (abortController) abortController.abort();
	});

	function imageHandler() {
		if (isUploading || destroyed) return;
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';
		input.click();
		input.onchange = async () => {
			const file = input.files?.[0];
			if (!file || destroyed) return;
			isUploading = true;
			uploadError = '';
			try {
				const formData = new FormData();
				formData.append('file', file);
				const res = await fetch(resolve('/api/upload'), {
					method: 'POST',
					body: formData,
					signal: abortController?.signal
				});
				if (!res.ok) throw new Error('업로드 실패');
				const data = await res.json();
				if (typeof data.url !== 'string' || typeof data.name !== 'string') {
					throw new Error('올바르지 않은 응답 형식');
				}
				if (!destroyed) {
					const range = quillInstance?.getSelection(true);
					quillInstance?.insertEmbed(range?.index ?? 0, 'image', data.url);
				}
			} catch (err) {
				if (!destroyed && err instanceof Error && err.name !== 'AbortError') {
					uploadError = err.message || '이미지 업로드 중 오류가 발생했습니다.';
				}
			} finally {
				if (!destroyed) isUploading = false;
			}
		};
	}

	/** @param {Event} event */
	async function handleAttachmentChange(event) {
		const target = /** @type {HTMLInputElement} */ (event.target);
		const files = Array.from(target.files || []);
		if (files.length === 0 || isUploading || destroyed) return;
		isUploading = true;
		uploadError = '';
		try {
			for (const file of files) {
				if (attachments.length >= 20) throw new Error('첨부파일은 최대 20개입니다.');
				const formData = new FormData();
				formData.append('file', file);
				const res = await fetch(resolve('/api/upload'), {
					method: 'POST',
					body: formData,
					signal: abortController?.signal
				});
				if (!res.ok) throw new Error(`${file.name} 업로드 실패`);
				const data = await res.json();
				if (typeof data.url !== 'string' || typeof data.name !== 'string') {
					throw new Error('올바르지 않은 응답 형식');
				}
				if (!destroyed && !attachments.some((item) => item.url === data.url)) {
					attachments = [...attachments, { name: data.name, url: data.url }];
				}
			}
		} catch (err) {
			if (!destroyed && err instanceof Error && err.name !== 'AbortError') {
				uploadError = err.message || '첨부파일 업로드 중 오류가 발생했습니다.';
			}
		} finally {
			if (!destroyed) {
				isUploading = false;
				target.value = '';
			}
		}
	}

	/** @param {number} idx */
	function removeAttachment(idx) {
		attachments = attachments.filter((_, i) => i !== idx);
	}
</script>

<form
	class="announcement-form"
	method="POST"
	{action}
	use:enhance={({ cancel }) => {
		if (editorLoading || isUploading || editorError) cancel();
	}}
>
	<div class="form-group">
		<label for="title">제목</label>
		<input type="text" id="title" name="title" required maxlength="255" bind:value={title} />
	</div>

	<div class="form-group">
		<p id="editor-label">내용</p>
		<div id="editor" aria-labelledby="editor-label" bind:this={editorElement}></div>
		<input type="hidden" name="content" value={contentHTML} />
	</div>

	<div class="form-group">
		<label for="attachments">첨부파일 (최대 20개, 각 10MB 이하)</label>
		<button
			type="button"
			class="file-select-button"
			disabled={isUploading || attachments.length >= 20}
			on:click={() => attachmentInput?.click()}>+ 파일 선택</button
		>
		<input
			id="attachments"
			type="file"
			disabled={isUploading}
			bind:this={attachmentInput}
			on:change={handleAttachmentChange}
			multiple
			style="display: none;"
		/>
		{#if attachments.length > 0}
			<div class="attachment-list">
				{#each attachments as file, i (file.url)}
					<div class="attachment-item">
						<span>{file.name}</span>
						<button
							type="button"
							class="remove-attachment-button"
							on:click={() => removeAttachment(i)}
							aria-label="삭제">&times;</button
						>
					</div>
				{/each}
			</div>
		{/if}
		<input type="hidden" name="attachments" value={JSON.stringify(attachments)} />
	</div>

	{#if uploadError}
		<p class="error-message" role="alert">{uploadError}</p>
	{/if}
	{#if editorError}
		<p class="error-message" role="alert">{editorError}</p>
	{/if}
	{#if message}
		<p class="error-message" role="alert">{message}</p>
	{/if}

	<div class="form-actions">
		<button
			type="submit"
			class="submit-button"
			disabled={editorLoading || isUploading || !!editorError}
		>
			{#if isUploading}업로드 중...{:else if editorLoading}에디터 로딩 중...{:else}{submitLabel}{/if}
		</button>
	</div>
</form>

<style>
	.announcement-form {
		margin-top: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	label {
		font-weight: 500;
		color: var(--secondary-color, #a0aec0);
	}
	input[type='text'] {
		width: 100%;
		padding: 0.8rem 1rem;
		background-color: #2c2f38;
		border: 1px solid var(--border-color, #4a5568);
		border-radius: 8px;
		color: var(--text-color, #fff);
		font-size: 1rem;
	}
	input[type='text']:-webkit-autofill {
		-webkit-text-fill-color: var(--text-color, #fff);
	}
	input[type='text']:focus {
		outline: none;
		border-color: var(--primary-color, #ff3e00);
		box-shadow: 0 0 0 3px rgba(255, 62, 0, 0.2);
	}
	.file-select-button {
		align-self: flex-start;
		background-color: #3a3f4b;
		color: var(--text-color, #fff);
		border: 1px solid var(--border-color, #4a5568);
		padding: 0.5rem 1rem;
		border-radius: 6px;
		cursor: pointer;
	}
	.attachment-list {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.attachment-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: #2c2f38;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-size: 0.9rem;
	}
	.remove-attachment-button {
		background: none;
		border: none;
		color: var(--secondary-color, #a0aec0);
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0 0.5rem;
	}
	.form-actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 1rem;
	}
	.submit-button {
		background-color: var(--primary-color, #ff3e00);
		color: white;
		border: none;
		padding: 0.8rem 2rem;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: bold;
		cursor: pointer;
	}
	.submit-button:disabled {
		background-color: #4a5568;
		cursor: not-allowed;
	}
	.error-message {
		color: #ff9494;
		font-size: 0.9rem;
		margin: 0;
	}
	:global(.ql-toolbar) {
		border-top-left-radius: 8px;
		border-top-right-radius: 8px;
		border-color: var(--border-color, #4a5568) !important;
	}
	:global(.ql-container) {
		border-bottom-left-radius: 8px;
		border-bottom-right-radius: 8px;
		border-color: var(--border-color, #4a5568) !important;
		min-height: 300px;
		font-size: 1rem;
	}
	:global(.ql-editor) {
		padding: 1.2rem;
		color: var(--text-color, #fff);
	}
	:global(.ql-snow .ql-stroke) {
		stroke: var(--secondary-color, #a0aec0);
	}
	:global(.ql-snow .ql-picker-label) {
		color: var(--secondary-color, #a0aec0);
	}
</style>
