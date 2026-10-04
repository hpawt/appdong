<script>
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { eventCategories, todayKey } from '$lib/modu';
	export let initial = {
		title: '',
		description: '',
		location: '',
		startDate: todayKey(),
		endDate: todayKey(),
		time: '',
		category: 'notice',
		pinned: false
	};
	export let message = '';
	export let submitLabel = '일정 등록';
	let values = { ...initial };
	let busy = false;
	/** @param {Event} event */
	function changeStart(event) {
		values.startDate = /** @type {HTMLInputElement} */ (event.currentTarget).value;
		if (values.endDate < values.startDate) values.endDate = values.startDate;
	}
</script>

<form
	method="POST"
	action="?/save"
	use:enhance={({ cancel }) => {
		if (busy) {
			cancel();
			return;
		}
		busy = true;
		return async ({ update }) => {
			try {
				await update();
			} finally {
				busy = false;
			}
		};
	}}
>
	<label for="event-title">일정 제목</label><input
		id="event-title"
		name="title"
		required
		maxlength="100"
		bind:value={values.title}
	/>
	<div class="row">
		<div>
			<label for="event-start">시작일</label><input
				id="event-start"
				name="startDate"
				type="date"
				min="1900-01-01"
				max="2100-12-31"
				required
				bind:value={values.startDate}
				on:change={changeStart}
			/>
		</div>
		<div>
			<label for="event-end">종료일</label><input
				id="event-end"
				name="endDate"
				type="date"
				min={values.startDate}
				max="2100-12-31"
				required
				bind:value={values.endDate}
			/>
		</div>
	</div>
	<div class="row">
		<div>
			<label for="event-category">일정 종류</label><select
				id="event-category"
				name="category"
				bind:value={values.category}
			>
				{#each Object.entries(eventCategories) as [key, label] (key)}<option value={key}
						>{label}</option
					>{/each}
			</select>
		</div>
		<div>
			<label for="event-time">시간 · 비우면 종일</label><input
				id="event-time"
				name="time"
				type="time"
				bind:value={values.time}
			/>
		</div>
	</div>
	<label for="event-location">장소</label><input
		id="event-location"
		name="location"
		maxlength="150"
		bind:value={values.location}
	/>
	<label for="event-description">공지 내용</label><textarea
		id="event-description"
		name="description"
		maxlength="5000"
		bind:value={values.description}
	></textarea>
	<label class="check"
		><input name="pinned" type="checkbox" bind:checked={values.pinned} /> 중요한 공지로 고정</label
	>
	{#if message}<p role="alert">{message}</p>{/if}
	<div class="actions">
		<a href={resolve('/admin/calendar')}>취소</a><button disabled={busy} type="submit"
			>{busy ? '저장 중…' : submitLabel}</button
		>
	</div>
</form>

<style>
	form {
		max-width: 720px;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	input:not([type='checkbox']),
	textarea,
	select {
		width: 100%;
		border: 1px solid #555b68;
		border-radius: 8px;
		padding: 0.75rem;
		font: inherit;
		color: var(--text-color);
		background: var(--bg-color);
	}
	textarea {
		min-height: 160px;
	}
	.row {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}
	.row label {
		display: block;
		margin-bottom: 0.5rem;
	}
	.actions,
	.check {
		display: flex;
		gap: 1rem;
		align-items: center;
	}
	.actions {
		justify-content: space-between;
	}
	button {
		background: var(--primary-color);
		color: white;
		border: 0;
		padding: 0.8rem 1.5rem;
		border-radius: 8px;
		cursor: pointer;
		font: inherit;
	}
	button:disabled {
		opacity: 0.6;
		cursor: wait;
	}
	[role='alert'] {
		color: #ffb6a0;
	}
	@media (max-width: 500px) {
		.row {
			grid-template-columns: 1fr;
		}
	}
</style>
