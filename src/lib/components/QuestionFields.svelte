<script>
	/** @type {import('$lib/modu').Question[]} */
	export let questions = [];
	export let prefix = 'answer';
</script>

{#each questions as question (question.id)}
	<fieldset class="question">
		<legend
			>{question.title}{#if question.required}<span aria-label="필수"> *</span>{/if}</legend
		>
		{#if question.type === 'checkbox' || question.type === 'radio'}
			{#each question.options as option, index (index)}
				<label class="choice" for={`${prefix}-${question.id}-${index}`}>
					<input
						id={`${prefix}-${question.id}-${index}`}
						name={question.id}
						type={question.type}
						value={option}
						required={question.type === 'radio' && question.required}
					/>
					{option}
				</label>
			{/each}
		{:else if question.type === 'select'}
			<label class="sr-only" for={`${prefix}-${question.id}`}>{question.title}</label>
			<select id={`${prefix}-${question.id}`} name={question.id} required={question.required}>
				<option value="">선택해주세요</option>
				{#each question.options as option, index (index)}<option value={option}>{option}</option
					>{/each}
			</select>
		{:else if question.type === 'textarea'}
			<label class="sr-only" for={`${prefix}-${question.id}`}>{question.title}</label>
			<textarea
				id={`${prefix}-${question.id}`}
				name={question.id}
				maxlength="5000"
				required={question.required}
			></textarea>
		{:else}
			<label class="sr-only" for={`${prefix}-${question.id}`}>{question.title}</label>
			<input
				id={`${prefix}-${question.id}`}
				name={question.id}
				type={question.type === 'email' ? 'email' : 'text'}
				maxlength="5000"
				required={question.required}
			/>
		{/if}
		{#if question.required && question.type === 'checkbox'}<small>하나 이상 선택해주세요.</small
			>{/if}
	</fieldset>
{/each}

<style>
	.question {
		border: 0;
		padding: 0;
		margin: 0 0 1.75rem;
		min-width: 0;
	}
	legend {
		font-weight: 600;
		margin-bottom: 0.75rem;
		overflow-wrap: anywhere;
	}
	legend span {
		color: #ffb6a0;
	}
	input:not([type='checkbox']):not([type='radio']),
	textarea,
	select {
		width: 100%;
		padding: 0.8rem;
		background: var(--bg-color);
		color: var(--text-color);
		border: 1px solid #555b68;
		border-radius: 8px;
		font: inherit;
	}
	textarea {
		min-height: 120px;
		resize: vertical;
	}
	.choice {
		display: flex;
		gap: 0.6rem;
		align-items: baseline;
		padding: 0.35rem 0;
		overflow-wrap: anywhere;
	}
	.choice input {
		flex-shrink: 0;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}
	small {
		color: var(--secondary-color);
	}
</style>
