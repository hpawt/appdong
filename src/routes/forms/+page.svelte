<script>
	import { resolve } from '$app/paths';
	export let data;
</script>

<svelte:head><title>신청·설문 · APPDONG</title></svelte:head>
<h1>신청·설문</h1>
<p>공개된 신청서와 설문에 참여하세요.</p>
{#if data.unavailable}<p role="alert">폼을 불러올 수 없습니다. 잠시 후 다시 방문해주세요.</p>
{:else}<div class="forms">
		{#each data.forms as form (form.id)}<article>
				<h2><a href={resolve('/forms/[id]', { id: form.id })}>{form.title}</a></h2>
				<p>{form.description}</p>
				<span>{form.accepting ? '접수 중' : '접수 마감'}</span>
			</article>
		{:else}<p>현재 공개된 폼이 없습니다.</p>{/each}
	</div>{/if}

<style>
	.forms {
		display: grid;
		gap: 1rem;
	}
	article {
		background: #252830;
		padding: 1.2rem;
		border-radius: 10px;
		overflow-wrap: anywhere;
	}
	h2 {
		font-size: 1.4rem;
	}
	article p {
		white-space: pre-wrap;
	}
	span {
		color: var(--secondary-color);
	}
</style>
