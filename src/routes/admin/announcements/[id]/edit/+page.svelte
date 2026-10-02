<script>
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import AnnouncementForm from '$lib/components/AnnouncementForm.svelte';
	export let data;
	export let form;
</script>

<div class="page-container">
	<header>
		<a href={resolve('/admin/announcements')}>&larr; 공지사항 관리로 돌아가기</a>
		<form
			method="POST"
			action="?/delete"
			use:enhance={({ cancel }) => {
				if (!confirm(`'${data.announcement.title}' 공지사항을 정말 삭제하시겠습니까?`)) cancel();
			}}
		>
			<button type="submit" class="delete-button">삭제하기</button>
		</form>
	</header>
	<h1>공지사항 수정</h1>
	{#key data.announcement.id}
		<AnnouncementForm
			message={form?.message ?? ''}
			action="?/update"
			initialTitle={data.announcement.title}
			initialContent={data.announcement.content}
			initialAttachments={data.announcement.attachments}
			submitLabel="수정 완료"
		/>
	{/key}
</div>

<style>
	.page-container {
		max-width: 800px;
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	a {
		color: var(--secondary-color);
	}
	.delete-button {
		background: #cf3f50;
		color: white;
		padding: 0.6rem 1rem;
		border: 0;
		border-radius: 6px;
		cursor: pointer;
	}
</style>
