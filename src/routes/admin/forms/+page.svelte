<script>
	import { resolve } from '$app/paths';
	export let data;
</script>

<h1>신청·설문 폼 관리</h1>
<p><a href={resolve('/admin/forms/new')}>+ 새 폼 만들기</a></p>
<p>공개 링크로 신청을 받고, 제출된 응답을 확인하거나 CSV로 내려받으세요.</p>
<div class="forms">
	{#each data.forms as form (form.id)}<article>
			<h2>{form.title}</h2>
			<p>
				{form.published ? '공개' : '비공개'} · {form.accepting ? '접수 중' : '접수 마감'} · 응답 {form.responseCount}개
			</p>
			<div class="actions">
				<a href={resolve('/admin/forms/[id]', { id: form.id })}>편집·링크 공유</a><a
					href={resolve('/admin/forms/[id]/responses', { id: form.id })}>응답 보기</a
				>
			</div>
		</article>
	{:else}<p>아직 만든 폼이 없습니다.</p>{/each}
</div>

<style>
	.forms {
		display: grid;
		gap: 1rem;
	}
	article {
		background: #252830;
		padding: 1.2rem;
		border: 1px solid var(--border-color);
		border-radius: 10px;
		overflow-wrap: anywhere;
	}
	h2 {
		font: inherit;
		font-size: 1.2rem;
		font-weight: 600;
		margin: 0;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}
</style>
