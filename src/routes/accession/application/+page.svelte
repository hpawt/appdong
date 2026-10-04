<script>
	import ApplicationForm from '$lib/components/ApplicationForm.svelte';
	import RecruitmentClosed from '$lib/components/RecruitmentClosed.svelte';
	export let data;
	export let form;
</script>

{#if data.recruitmentOpen}<ApplicationForm {data} {form} />{:else}<RecruitmentClosed />{/if}
