<script>
	import CalendarBoard from '$lib/components/CalendarBoard.svelte';
	export let data;
</script>

<svelte:head><title>일정 캘린더 · APPDONG</title></svelte:head>
<h1>일정 캘린더</h1>
<p>동아리 공지, 미팅, 행사와 마감 일정을 확인하세요.</p>
<CalendarBoard {...data} />
