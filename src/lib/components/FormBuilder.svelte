<script>
	import { enhance } from '$app/forms';
	import { emptyForm, questionTypes } from '$lib/modu';
	import QuestionFields from '$lib/components/QuestionFields.svelte';
	/** @type {import('$lib/modu').FormDefinition} */ export let initial = emptyForm();
	export let version = '';
	export let message = '';
	export let submitLabel = '저장';
	let definition = structuredClone(initial);
	let busy = false;
	let preview = false;
	/** @type {Record<string, string>} */
	let choices = Object.fromEntries(definition.questions.map((q) => [q.id, q.options.join('\n')]));
	/** @param {import('$lib/modu').Question} question */
	function choiceType(question) {
		return ['radio', 'checkbox', 'select'].includes(question.type);
	}
	/** @param {import('$lib/modu').Question} question @param {Event} event */
	function changeType(question, event) {
		question.type = /** @type {import('$lib/modu').Question['type']} */ (
			/** @type {HTMLSelectElement} */ (event.currentTarget).value
		);
		question.options = choiceType(question)
			? question.options.length
				? question.options
				: ['선택지 1', '선택지 2']
			: [];
		choices[question.id] = question.options.join('\n');
		definition = definition;
	}
	/** @param {import('$lib/modu').Question} question @param {Event} event */
	function changeChoices(question, event) {
		const value = /** @type {HTMLTextAreaElement} */ (event.currentTarget).value;
		choices[question.id] = value;
		question.options = value
			.split('\n')
			.map((option) => option.trim())
			.filter(Boolean);
		definition = definition;
	}
	function addQuestion() {
		if (definition.questions.length >= 50) return;
		const id = 'q-' + crypto.randomUUID();
		definition.questions = [
			...definition.questions,
			{ id, title: '새 질문', type: 'text', required: false, options: [] }
		];
		choices[id] = '';
	}
	/** @param {number} index @param {number} direction */
	function move(index, direction) {
		const questions = [...definition.questions];
		[questions[index], questions[index + direction]] = [
			questions[index + direction],
			questions[index]
		];
		definition.questions = questions;
	}
	/** @param {string} id */
	function remove(id) {
		if (definition.questions.length <= 1) return;
		definition.questions = definition.questions.filter((question) => question.id !== id);
		delete choices[id];
	}
</script>

<form
	class="builder"
	method="POST"
	action="?/save"
	use:enhance={({ cancel }) => {
		if (busy) {
			cancel();
			return;
		}
		busy = true;
		return async ({ update }) => {
			try {
				await update();
			} finally {
				busy = false;
			}
		};
	}}
>
	<input type="hidden" name="definition" value={JSON.stringify(definition)} /><input
		type="hidden"
		name="version"
		value={version}
	/>
	<section class="intro">
		<label for="form-title">폼 제목</label><input
			id="form-title"
			required
			maxlength="150"
			bind:value={definition.title}
		/>
		<label for="form-description">폼 설명</label><textarea
			id="form-description"
			maxlength="5000"
			bind:value={definition.description}
		></textarea>
		<div class="settings">
			<label><input type="checkbox" bind:checked={definition.published} /> 링크로 공개</label><label
				><input type="checkbox" bind:checked={definition.accepting} /> 응답 받기</label
			>
		</div>
	</section>
	{#each definition.questions as question, index (question.id)}
		<section class="question-card" aria-label={`질문 ${index + 1} 편집`}>
			<div class="question-header">
				<strong>질문 {index + 1}</strong>
				<div class="actions">
					<button
						type="button"
						aria-label={`질문 ${index + 1} 위로`}
						disabled={index === 0}
						on:click={() => move(index, -1)}>↑</button
					>
					<button
						type="button"
						aria-label={`질문 ${index + 1} 아래로`}
						disabled={index === definition.questions.length - 1}
						on:click={() => move(index, 1)}>↓</button
					>
					<button
						type="button"
						aria-label={`질문 ${index + 1} 삭제`}
						disabled={definition.questions.length <= 1}
						on:click={() => remove(question.id)}>삭제</button
					>
				</div>
			</div>
			<label for={`${question.id}-title`}>질문 제목</label><input
				id={`${question.id}-title`}
				required
				maxlength="200"
				bind:value={question.title}
			/>
			<label for={`${question.id}-type`}>질문 유형</label><select
				id={`${question.id}-type`}
				value={question.type}
				on:change={(event) => changeType(question, event)}
			>
				{#each Object.entries(questionTypes) as [type, label] (type)}<option value={type}
						>{label}</option
					>{/each}
			</select>
			{#if choiceType(question)}<label for={`${question.id}-choices`}
					>선택지 · 한 줄에 하나, 2~30개</label
				><textarea
					id={`${question.id}-choices`}
					value={choices[question.id]}
					on:input={(event) => changeChoices(question, event)}
					maxlength="6030"
				></textarea>{/if}
			<label class="required"
				><input type="checkbox" bind:checked={question.required} /> 필수 질문</label
			>
		</section>
	{/each}
	<div class="actions">
		<button type="button" on:click={addQuestion} disabled={definition.questions.length >= 50}
			>+ 질문 추가</button
		><span>{definition.questions.length}/50개</span>
		<button type="button" aria-pressed={preview} on:click={() => (preview = !preview)}
			>미리보기</button
		>
	</div>
	{#if message}<p role="alert">{message}</p>{/if}
	<button class="save" type="submit" disabled={busy}>{busy ? '저장 중…' : submitLabel}</button>
</form>
{#if preview}<section class="preview">
		<h2>{definition.title || '제목 없는 폼'}</h2>
		<p class="description">{definition.description}</p>
		<p>미리보기 응답은 저장되지 않습니다.</p>
		<QuestionFields questions={definition.questions} prefix="preview" />
	</section>{/if}

<style>
	.builder {
		max-width: 760px;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.intro,
	.question-card,
	.preview {
		background: #252830;
		border: 1px solid var(--border-color);
		padding: 1.2rem;
		border-radius: 10px;
	}
	.intro,
	.question-card {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}
	input:not([type='checkbox']),
	textarea,
	select {
		width: 100%;
		border: 1px solid #555b68;
		border-radius: 6px;
		background: var(--bg-color);
		color: var(--text-color);
		padding: 0.7rem;
		font: inherit;
	}
	textarea {
		min-height: 100px;
		resize: vertical;
	}
	.actions,
	.question-header,
	.settings {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem;
	}
	.question-header {
		justify-content: space-between;
	}
	.settings {
		gap: 1.5rem;
		margin-top: 0.5rem;
	}
	button {
		font: inherit;
		background: #3a3f4b;
		color: white;
		border: 1px solid #555b68;
		padding: 0.5rem 0.8rem;
		border-radius: 6px;
		cursor: pointer;
	}
	button:disabled {
		opacity: 0.5;
		cursor: default;
	}
	.save {
		background: var(--primary-color);
		border: 0;
		padding: 0.85rem;
	}
	.preview {
		max-width: 760px;
		margin-top: 2rem;
		overflow-wrap: anywhere;
	}
	.description {
		white-space: pre-wrap;
	}
	[role='alert'] {
		color: #ffb6a0;
	}
	.required {
		margin-top: 0.5rem;
	}
</style>
