<script>
	import EventForm from '$lib/components/EventForm.svelte';
	export let form;
</script>

<h1>일정 등록</h1>
<EventForm message={form?.message ?? ''} />
