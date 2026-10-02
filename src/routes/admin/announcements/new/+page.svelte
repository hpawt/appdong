<script>
	import { resolve } from '$app/paths';
	import AnnouncementForm from '$lib/components/AnnouncementForm.svelte';
	export let form;
</script>

<div class="page-container">
	<a href={resolve('/admin/announcements')}>&larr; 공지사항 관리로 돌아가기</a>
	<h1>새 공지사항 작성</h1>
	<AnnouncementForm message={form?.message ?? ''} />
</div>

<style>
	.page-container {
		max-width: 800px;
	}
	a {
		color: var(--secondary-color);
	}
</style>
