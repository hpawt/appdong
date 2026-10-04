<script>
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import FormBuilder from '$lib/components/FormBuilder.svelte';
	export let data;
	export let form;
	let copyMessage = '';
	$: shareUrl = $page.url.origin + resolve('/forms/[id]', { id: data.definition.id });
	async function copyLink() {
		try {
			await navigator.clipboard.writeText(shareUrl);
			copyMessage = '링크를 복사했습니다.';
		} catch {
			copyMessage = '복사하지 못했습니다. 위 주소를 직접 복사해주세요.';
		}
	}
</script>

<p>
	<a href={resolve('/admin/forms')}>← 폼 목록</a> ·
	<a href={resolve('/admin/forms/[id]/responses', { id: data.definition.id })}>응답 보기</a>
</p>
<h1>폼 편집</h1>
{#if $page.url.searchParams.has('saved')}<p role="status">저장했습니다.</p>{/if}
<section class="share">
	<h2>응답 링크</h2>
	<p>
		{data.definition.published
			? '이 링크로 누구나 응답할 수 있습니다.'
			: '비공개 폼입니다. 링크로 공개를 켜고 저장하면 공유할 수 있습니다.'}
	</p>
	<label for="share-url">공유 주소</label><input id="share-url" readonly value={shareUrl} />
	<button type="button" on:click={copyLink}>링크 복사</button>
	<a href={resolve('/forms/[id]', { id: data.definition.id })}>응답 화면 보기</a>
	<p role="status">{copyMessage}</p>
</section>
{#key data.definition.version}<FormBuilder
		initial={data.definition}
		version={data.definition.version}
		submitLabel="변경사항 저장"
		message={form?.message ?? ''}
	/>{/key}
<form
	method="POST"
	action="?/delete"
	use:enhance={({ cancel }) => {
		if (!confirm('폼과 모든 응답을 삭제할까요?')) cancel();
	}}
>
	<button type="submit" class="danger">폼과 모든 응답 삭제</button>
</form>

<style>
	.share {
		background: #252830;
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 2rem;
	}
	h2 {
		font: inherit;
		font-weight: 600;
	}
	input {
		display: block;
		width: 100%;
		background: var(--bg-color);
		color: var(--text-color);
		border: 1px solid #555b68;
		padding: 0.7rem;
		margin: 0.5rem 0;
	}
	button {
		font: inherit;
		background: #3a3f4b;
		color: white;
		padding: 0.6rem;
		border: 0;
		border-radius: 6px;
		cursor: pointer;
	}
	.danger {
		margin-top: 2rem;
		background: #b43445;
	}
</style>
