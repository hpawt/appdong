<script>
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	export let data;
	export let form;
	/** @param {string|string[]|undefined} value */
	function answerText(value) {
		return Array.isArray(value) ? value.join(', ') : value || '미응답';
	}
</script>

<p><a href={resolve('/admin/forms/[id]', { id: data.definition.id })}>← 폼 편집</a></p>
<h1>{data.definition.title} · 응답</h1>
<p>총 {data.total}개 · 제출 당시의 질문과 응답을 표시합니다.</p>
<p>
	<a href={resolve('/admin/forms/[id]/responses/export', { id: data.definition.id })} download
		>CSV 내려받기</a
	>
</p>
{#if form?.message}<p role="status">{form.message}</p>{/if}
{#each data.responses as response (response.id)}
	<details>
		<summary
			>{new Date(response.submittedAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })} · {response.id.slice(
				0,
				8
			)}</summary
		>
		<dl>
			{#each response.questions as question (question.id)}<dt>{question.title}</dt>
				<dd>{answerText(response.answers[question.id])}</dd>{/each}
		</dl>
		<form
			method="POST"
			action="?/delete"
			use:enhance={({ cancel }) => {
				if (!confirm('이 응답을 삭제할까요?')) cancel();
			}}
		>
			<input type="hidden" name="responseId" value={response.id} /><button type="submit"
				>응답 삭제</button
			>
		</form>
	</details>
{:else}<p>이 페이지에 응답이 없습니다.</p>{/each}
<nav aria-label="응답 페이지">
	{#if data.page > 1}<a
			href={resolve(`/admin/forms/[id]/responses?page=${data.page - 1}`, {
				id: data.definition.id
			})}>이전</a
		>{/if}
	<span>{data.page}페이지</span>
	{#if data.page * 50 < data.total}<a
			href={resolve(`/admin/forms/[id]/responses?page=${data.page + 1}`, {
				id: data.definition.id
			})}>다음</a
		>{/if}
</nav>

<style>
	details {
		background: #252830;
		padding: 1rem;
		border: 1px solid var(--border-color);
		border-radius: 8px;
		margin-bottom: 0.75rem;
	}
	summary {
		cursor: pointer;
		overflow-wrap: anywhere;
	}
	dt {
		font-weight: 600;
		margin-top: 1rem;
	}
	dd {
		margin: 0.4rem 0;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	nav {
		display: flex;
		gap: 1rem;
	}
	button {
		background: #b43445;
		color: white;
		border: 0;
		border-radius: 6px;
		padding: 0.6rem;
		font: inherit;
		cursor: pointer;
	}
</style>
