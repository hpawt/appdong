<script>
	import { resolve } from '$app/paths';
	import CalendarBoard from '$lib/components/CalendarBoard.svelte';
	export let data;
</script>

<h1>일정 관리</h1>
<p>
	<a href={resolve('/admin/calendar/new')}>+ 일정 등록</a> ·
	<a href={resolve('/calendar')}>공개 캘린더</a>
</p>
<CalendarBoard {...data} admin />
