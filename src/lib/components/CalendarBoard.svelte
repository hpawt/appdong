<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { tick } from 'svelte';
	import { calendarDays, occursOn, todayKey, shiftMonth, eventCategories } from '$lib/modu';
	export let month = todayKey().slice(0, 7);
	/** @type {import('$lib/modu').CalendarEvent[]} */ export let events = [];
	/** @type {import('$lib/modu').CalendarEvent[]} */ export let pinnedEvents = [];
	export let unavailable = false;
	export let admin = false;
	let selected = month === todayKey().slice(0, 7) ? todayKey() : month + '-01';
	let activeMonth = month;
	let view = 'calendar';
	let navigationError = '';
	/** @type {import('$lib/modu').CalendarEvent | null} */ let detail = null;
	/** @type {HTMLDialogElement} */ let dialog;
	$: days = calendarDays(month);
	$: if (activeMonth !== month) {
		activeMonth = month;
		selected = month === todayKey().slice(0, 7) ? todayKey() : month + '-01';
	}
	$: selectedEvents = events.filter((event) => occursOn(event, selected));
	$: monthEvents = events.filter(
		(event) => event.startDate.slice(0, 7) <= month && event.endDate.slice(0, 7) >= month
	);
	/** @param {string} target */
	async function navigate(target) {
		navigationError = '';
		try {
			const options = { keepFocus: true, noScroll: true };
			if (admin) await goto(resolve(`/admin/calendar?month=${target}`), options);
			else await goto(resolve(`/calendar?month=${target}`), options);
		} catch {
			navigationError = '일정을 불러오지 못했습니다. 다시 시도해주세요.';
		}
	}
	/** @param {import('$lib/modu').CalendarEvent} event */
	async function showDetail(event) {
		detail = event;
		await tick();
		dialog.showModal();
	}
	/** @param {string} category */
	function categoryLabel(category) {
		return Object.entries(eventCategories).find(([key]) => key === category)?.[1] || category;
	}
</script>

{#if unavailable}<p role="alert">일정을 불러올 수 없습니다. 잠시 후 다시 방문해주세요.</p>{/if}
{#if navigationError}<p role="alert">{navigationError}</p>{/if}
<div class="toolbar">
	<div class="month-controls">
		<button
			aria-label="이전 달"
			on:click={() => navigate(shiftMonth(month, -1))}
			disabled={month === '1900-01'}>←</button
		>
		<h2>{month.replace('-', '년 ')}월</h2>
		<button
			aria-label="다음 달"
			on:click={() => navigate(shiftMonth(month, 1))}
			disabled={month === '2100-12'}>→</button
		>
		<button
			on:click={() => {
				selected = todayKey();
				navigate(selected.slice(0, 7));
			}}>오늘</button
		>
	</div>
	<div class="view-controls">
		<button aria-pressed={view === 'calendar'} on:click={() => (view = 'calendar')}
			>월간 보기</button
		><button aria-pressed={view === 'list'} on:click={() => (view = 'list')}>목록 보기</button>
	</div>
</div>
<div class="board">
	<div class="calendar">
		{#if view === 'calendar'}
			<div class="weekdays">
				{#each ['일', '월', '화', '수', '목', '금', '토'] as day (day)}<span>{day}</span>{/each}
			</div>
			<div class="days">
				{#each days as day (day)}
					{@const dailyEvents = events.filter((event) => occursOn(event, day))}
					<div class="day" class:other={!day.startsWith(month)} class:selected={day === selected}>
						<button
							class="date"
							on:click={() => (selected = day)}
							aria-label={`${day}, 일정 ${dailyEvents.length}개`}
							aria-pressed={day === selected}
							aria-current={day === todayKey() ? 'date' : undefined}>{Number(day.slice(8))}</button
						>
						{#each dailyEvents.slice(0, 2) as event (event.id)}<button
								class="event"
								on:click={() => showDetail(event)}
								title={event.title}>{event.pinned ? '★ ' : ''}{event.title}</button
							>{/each}
						{#if dailyEvents.length > 2}<button class="more" on:click={() => (selected = day)}
								>+{dailyEvents.length - 2}개</button
							>{/if}
					</div>
				{/each}
			</div>
		{:else}
			{#each monthEvents as event (event.id)}<button
					class="event-row"
					on:click={() => showDetail(event)}
					><span>{event.startDate} ~ {event.endDate} · {event.time || '종일'}</span><strong
						>{event.title}</strong
					><small
						>{categoryLabel(event.category)}{event.location ? ' · ' + event.location : ''}</small
					></button
				>
			{:else}<p class="empty">이번 달에 등록된 일정이 없습니다.</p>{/each}
		{/if}
	</div>
	<aside>
		<h3>중요 공지</h3>
		{#each pinnedEvents as event (event.id)}<button
				class="event-row"
				on:click={() => showDetail(event)}
				><strong>★ {event.title}</strong><small
					>{event.startDate} · {categoryLabel(event.category)}</small
				></button
			>
		{:else}<p>고정된 공지가 없습니다.</p>{/each}
	</aside>
</div>
<section class="selected-day" aria-live="polite">
	<h3>{selected} · 일정 {selectedEvents.length}개</h3>
	{#each selectedEvents as event (event.id)}<button
			class="event-row"
			on:click={() => showDetail(event)}
			><span>{event.time || '종일'} · {categoryLabel(event.category)}</span><strong
				>{event.title}</strong
			><small>{event.location}</small></button
		>
	{:else}<p>등록된 일정이 없습니다.</p>{/each}
</section>
<dialog bind:this={dialog} on:close={() => (detail = null)}>
	{#if detail}<div class="dialog-header">
			<h2>일정 상세</h2>
			<button on:click={() => dialog.close()} aria-label="닫기">닫기</button>
		</div>
		<p>{categoryLabel(detail.category)}{detail.pinned ? ' · 중요 공지' : ''}</p>
		<h3>{detail.title}</h3>
		<p>{detail.startDate} ~ {detail.endDate} · {detail.time || '종일'}</p>
		{#if detail.location}<p>장소: {detail.location}</p>{/if}
		<p class="description">{detail.description}</p>
		{#if admin}<a href={resolve('/admin/calendar/[id]', { id: detail.id })}>일정 수정·삭제</a>{/if}
	{/if}
</dialog>

<style>
	.toolbar,
	.month-controls,
	.view-controls,
	.dialog-header {
		display: flex;
		gap: 0.6rem;
		align-items: center;
		flex-wrap: wrap;
	}
	.toolbar,
	.dialog-header {
		justify-content: space-between;
		margin-bottom: 1rem;
	}
	h2 {
		font-family: inherit;
		font-size: 1.3rem;
		margin: 0;
	}
	button {
		font: inherit;
		color: var(--text-color);
		background: #30343e;
		border: 1px solid #555b68;
		border-radius: 6px;
		padding: 0.4rem 0.7rem;
		cursor: pointer;
	}
	button:focus-visible {
		outline: 2px solid #b8cee7;
		outline-offset: 2px;
	}
	button[aria-pressed='true'] {
		background: #454d60;
	}
	button:disabled {
		opacity: 0.5;
	}
	.board {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 230px;
		gap: 1rem;
	}
	.calendar,
	aside,
	.selected-day {
		background: #252830;
		border: 1px solid var(--border-color);
		border-radius: 10px;
		overflow: hidden;
	}
	aside,
	.selected-day {
		padding: 1rem;
	}
	.weekdays,
	.days {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
	}
	.weekdays {
		text-align: center;
		padding: 0.6rem 0;
		color: var(--secondary-color);
	}
	.day {
		min-height: 105px;
		padding: 0.3rem;
		border-top: 1px solid #3a3e49;
		border-right: 1px solid #3a3e49;
		min-width: 0;
	}
	.day.selected {
		background: #343a48;
	}
	.day.other {
		opacity: 0.55;
	}
	.date {
		background: transparent;
		border: 0;
		padding: 0.1rem 0.35rem;
	}
	.date[aria-current='date'] {
		border: 1px solid #b8cee7;
	}
	.event,
	.more {
		display: block;
		width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		text-align: left;
		font-size: 0.75rem;
		padding: 0.15rem 0.3rem;
		margin-top: 0.25rem;
	}
	.event-row {
		display: flex;
		flex-direction: column;
		text-align: left;
		width: 100%;
		gap: 0.2rem;
		padding: 0.75rem;
		margin-bottom: 0.5rem;
		overflow-wrap: anywhere;
	}
	small,
	.event-row span {
		color: var(--secondary-color);
	}
	.selected-day {
		margin-top: 1rem;
	}
	.empty {
		padding: 1rem;
	}
	dialog {
		width: min(600px, 90vw);
		background: #252830;
		color: var(--text-color);
		border: 1px solid #555b68;
		border-radius: 12px;
		padding: 1.5rem;
		max-height: 85vh;
		overflow-y: auto;
	}
	dialog::backdrop {
		background: #0009;
	}
	.description {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	[role='alert'] {
		color: #ffb6a0;
	}
	@media (max-width: 900px) {
		.board {
			grid-template-columns: 1fr;
		}
		.day {
			min-height: 90px;
		}
	}
	@media (max-width: 500px) {
		.day {
			min-height: 80px;
			padding: 0.15rem;
		}
		.event {
			font-size: 0.65rem;
		}
	}
</style>
