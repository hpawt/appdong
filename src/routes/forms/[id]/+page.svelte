<script>
	import { enhance } from '$app/forms';
	import QuestionFields from '$lib/components/QuestionFields.svelte';
	export let data;
	export let form;
	let busy = false;
</script>

<svelte:head><title>{data.definition.title} · APPDONG</title></svelte:head>
<article>
	<h1>{data.definition.title}</h1>
	<p class="description">{data.definition.description}</p>
	{#if !data.definition.published}<p>
			비공개 폼의 관리자 미리보기입니다. 공개 후 응답을 받을 수 있습니다.
		</p>{/if}
	{#if form?.success}<p role="status" class="success">{form.message}</p>
	{:else if !data.definition.accepting}<p role="status">접수가 마감되었습니다.</p>
	{:else}<form
			method="POST"
			action="?/submit"
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
			<input type="hidden" name="version" value={data.definition.version} />
			{#key data.definition.version}<QuestionFields questions={data.definition.questions} />{/key}
			{#if form?.message}<p role="alert">{form.message}</p>{/if}
			<p class="note">입력한 내용은 동아리 운영진에게 전달됩니다. 제출 전 내용을 확인해주세요.</p>
			<button type="submit" disabled={busy || !data.definition.published}
				>{busy ? '제출 중…' : '응답 제출'}</button
			>
		</form>{/if}
</article>

<style>
	article {
		max-width: 760px;
		margin: auto;
		background: #252830;
		border-radius: 12px;
		padding: clamp(1rem, 4vw, 2rem);
	}
	h1 {
		font-family: inherit;
		font-size: 2rem;
		overflow-wrap: anywhere;
	}
	.description {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		margin-bottom: 2rem;
	}
	.note {
		color: var(--secondary-color);
		font-size: 0.9rem;
	}
	button {
		font: inherit;
		color: white;
		border: 0;
		padding: 0.9rem 2rem;
		border-radius: 8px;
		background: var(--primary-color);
		cursor: pointer;
	}
	button:disabled {
		opacity: 0.6;
	}
	[role='alert'] {
		color: #ffb6a0;
	}
	.success {
		color: #a5d6a7;
	}
</style>
