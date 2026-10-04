<script>
	import { enhance } from '$app/forms';
	import EventForm from '$lib/components/EventForm.svelte';
	export let data;
	export let form;
</script>

<h1>일정 수정</h1>
{#key data.event.id}<EventForm
		initial={data.event}
		message={form?.message ?? ''}
		submitLabel="수정 저장"
	/>{/key}
<form
	method="POST"
	action="?/delete"
	use:enhance={({ cancel }) => {
		if (!confirm('이 일정을 삭제할까요?')) cancel();
	}}
>
	<button type="submit" class="danger">일정 삭제</button>
</form>

<style>
	.danger {
		margin-top: 2rem;
		background: #b43445;
		color: white;
		border: 0;
		padding: 0.75rem;
		border-radius: 6px;
		cursor: pointer;
	}
</style>
