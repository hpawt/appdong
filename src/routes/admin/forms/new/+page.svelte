<script>
	import { resolve } from '$app/paths';
	import FormBuilder from '$lib/components/FormBuilder.svelte';
	export let form;
</script>

<p><a href={resolve('/admin/forms')}>← 폼 목록</a></p>
<h1>새 폼 만들기</h1>
<FormBuilder message={form?.message ?? ''} />
