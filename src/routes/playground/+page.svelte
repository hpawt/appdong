<script>
	import { todayKey, emptyForm } from '$lib/modu';
	import { readWorkspace, workspaceFile, inputMessage, MAX_WORKSPACE_BYTES } from '$lib/playground';
	import { downloadFile } from '$lib/calendar-tools';
	import { readEvent, readDefinition, validateAnswers } from '$lib/modu-validation';

	import CalendarBoard from '$lib/components/CalendarBoard.svelte';
	import EventForm from '$lib/components/EventForm.svelte';
	import FormBuilder from '$lib/components/FormBuilder.svelte';
	import QuestionFields from '$lib/components/QuestionFields.svelte';
	import { beforeNavigate } from '$app/navigation';
	import { tick } from 'svelte';

	// Core Page Memory State
	/** @type {import('$lib/modu').CalendarEvent[]} */
	let events = [];
	/** @type {import('$lib/modu').FormDefinition | null} */
	let savedForm = null;
	let dirty = false;
	beforeNavigate(({ cancel }) => {
		if (dirty && !confirm('이 페이지를 떠나면 작업 내용이 사라집니다. 이동할까요?')) cancel();
	});
	/** @param {BeforeUnloadEvent} event */
	function warnBeforeUnload(event) {
		if (dirty) {
			event.preventDefault();
			event.returnValue = '';
		}
	}

	// Revision keys for remounting components
	let eventFormRevision = 0;
	let formBuilderRevision = 0;
	let responseRevision = 0;

	// Active/editing selections
	/** @type {string | null} */
	let editingEventId = null;
	let month = todayKey().slice(0, 7);
	let importing = false;
	let alertMessage = '';
	let trialSuccessMessage = '';
	let trialErrorMessage = '';

	// File input binding element
	/** @type {HTMLInputElement} */
	let fileInputElement;

	// Derived parameters
	$: pinnedEvents = events.filter((e) => e.pinned);
	$: editingEvent = editingEventId ? events.find((e) => e.id === editingEventId) || null : null;
	$: isWorkspaceEmpty = events.length === 0 && savedForm === null;

	/** @param {string} targetMonth */
	function handleMonthChange(targetMonth) {
		month = targetMonth;
	}

	/** @param {import('$lib/modu').CalendarEvent} event */
	async function handleEditTrigger(event) {
		editingEventId = event.id;
		eventFormRevision += 1;
		await tick();
		document.getElementById('event-title')?.focus();
	}

	/** @param {FormData} formData */
	function handleEventSave(formData) {
		const parsed = readEvent(formData);
		const targetId = editingEventId;

		if (targetId) {
			// Replace existing
			events = events.map((e) => (e.id === targetId ? { ...parsed, id: targetId } : e));
		} else {
			// Add new
			if (events.length >= 100) {
				throw new Error('일정은 최대 100개까지만 등록할 수 있습니다.');
			}
			const newId = 'local-' + crypto.randomUUID();
			events = [...events, { ...parsed, id: newId }];
		}

		month = parsed.startDate.slice(0, 7);
		dirty = true;
		resetEventEditor();
	}

	function resetEventEditor() {
		editingEventId = null;
		eventFormRevision += 1;
	}

	function handleEventDelete() {
		if (!editingEventId) return;
		if (confirm('이 일정을 삭제하시겠습니까?')) {
			events = events.filter((e) => e.id !== editingEventId);
			dirty = true;
			resetEventEditor();
		}
	}

	/** @param {FormData} formData */
	function handleFormSave(formData) {
		const validated = readDefinition(formData);
		savedForm = validated;
		dirty = true;
		responseRevision += 1;
		trialSuccessMessage = '';
		trialErrorMessage = '';
	}

	/** @param {SubmitEvent & { currentTarget: HTMLFormElement }} e */
	function handleTrialSubmit(e) {
		e.preventDefault();
		if (!savedForm) return;
		trialSuccessMessage = '';
		trialErrorMessage = '';

		try {
			const data = new FormData(e.currentTarget);
			/** @type {Record<string, string | string[]>} */
			const payload = {};
			for (const question of savedForm.questions) {
				if (question.type === 'checkbox') {
					payload[question.id] = data.getAll(question.id).map(String);
				} else {
					payload[question.id] = String(data.get(question.id) || '');
				}
			}

			validateAnswers(payload, savedForm.questions);
			trialSuccessMessage =
				'응답이 성공적으로 로컬 검증을 통과했습니다! (서버로 전송되거나 저장되지 않음)';
			responseRevision += 1; // reset fields after successful trial simulation
		} catch (err) {
			trialErrorMessage = inputMessage(err);
		}
	}

	function triggerBackup() {
		const content = workspaceFile({ events, definition: savedForm });
		downloadFile(content, 'appdong-workspace.json', 'application/json');
	}

	/** @param {Event & { currentTarget: HTMLInputElement }} e */
	async function handleImport(e) {
		if (importing) return;
		const files = e.currentTarget.files;
		if (!files || files.length === 0) return;

		const file = files[0];
		if (file.size > MAX_WORKSPACE_BYTES) {
			alertMessage = '백업 파일은 2MB 이하로 선택해주세요.';
			fileInputElement.value = '';
			return;
		}

		importing = true;
		alertMessage = '';

		try {
			const text = await file.text();
			const workspace = readWorkspace(text);

			if (dirty || events.length || savedForm) {
				if (!confirm('현재 저장되지 않은 모든 변경 사항이 사라집니다. 백업을 불러오시겠습니까?')) {
					return;
				}
			}

			events = workspace.events;
			savedForm = workspace.definition;
			dirty = true;
			month = events[0]?.startDate.slice(0, 7) || todayKey().slice(0, 7);

			resetEventEditor();
			formBuilderRevision += 1;
			responseRevision += 1;
			trialSuccessMessage = '';
			trialErrorMessage = '';
		} catch (err) {
			alertMessage = inputMessage(err);
		} finally {
			importing = false;
			fileInputElement.value = '';
		}
	}

	function resetAll() {
		if (confirm('정말로 모든 일정과 설문 디자인을 삭제하고 초기화하시겠습니까?')) {
			events = [];
			savedForm = null;
			dirty = false;
			resetEventEditor();
			formBuilderRevision += 1;
			responseRevision += 1;
			trialSuccessMessage = '';
			trialErrorMessage = '';
			alertMessage = '';
		}
	}
</script>

<svelte:window on:beforeunload={warnBeforeUnload} />

<div class="playground-container">
	<header class="hero-section">
		<span class="badge">기능 체험</span>
		<h1>일정·설문 체험</h1>
		<p class="disclaimer">
			일정을 등록하고 설문을 만들어 볼 수 있습니다. 동아리 공식 일정이나 실제 접수로 공개되지
			않습니다.<br />
			<strong>작업은 이 화면에만 남으며, 새로고침하거나 나가면 사라집니다.</strong><br />
			등록한 일정과 적용한 설문은 백업 파일로 보관하세요. 작성 중인 입력과 테스트 응답은 백업에 포함되지
			않습니다.
		</p>
	</header>
	<noscript><p role="alert">이 기능은 JavaScript를 켜야 사용할 수 있습니다.</p></noscript>

	<div class="control-bar">
		<button type="button" on:click={triggerBackup} disabled={isWorkspaceEmpty || importing}>
			💾 백업 다운로드
		</button>
		<label class="file-label" class:disabled={importing}>
			📂 백업 가져오기
			<input
				bind:this={fileInputElement}
				type="file"
				accept="application/json,.json"
				on:change={handleImport}
				disabled={importing}
			/>
		</label>
		<button
			type="button"
			class="danger-btn"
			on:click={resetAll}
			disabled={(!dirty && isWorkspaceEmpty) || importing}
		>
			⚠️ 전체 초기화
		</button>
	</div>

	{#if alertMessage}
		<div class="alert-banner" role="alert">
			<strong>경고:</strong>
			{alertMessage}
		</div>
	{/if}

	<div class="workspace-grid">
		<!-- 1. Calendar Section -->
		<section class="workspace-block" aria-labelledby="calendar-heading">
			<div class="section-header">
				<h2 id="calendar-heading">📅 일정 관리 공간 ({events.length}/100)</h2>
			</div>

			<div class="editor-box" on:input={() => (dirty = true)}>
				<h3>{editingEventId ? '일정 수정·삭제' : '새 일정 작성'}</h3>
				{#key eventFormRevision}
					<EventForm
						initial={editingEvent || undefined}
						submitLabel={editingEventId ? '일정 수정 반영' : '일정 등록'}
						onSave={handleEventSave}
						onCancel={resetEventEditor}
					/>
				{/key}

				{#if editingEventId}
					<div class="extra-actions">
						<button type="button" class="danger-btn text-btn" on:click={handleEventDelete}>
							🗑️ 일정 완전히 삭제
						</button>
					</div>
				{/if}
			</div>

			<div class="board-wrapper">
				<CalendarBoard
					{month}
					{events}
					{pinnedEvents}
					onMonthChange={handleMonthChange}
					onEdit={handleEditTrigger}
				/>
			</div>
		</section>

		<!-- 2. Form Builder Section -->
		<section class="workspace-block" aria-labelledby="builder-heading">
			<div class="section-header">
				<h2 id="builder-heading">📝 설문 설계 공간</h2>
			</div>

			<div class="builder-box" on:input={() => (dirty = true)}>
				{#key formBuilderRevision}
					<FormBuilder
						initial={savedForm || emptyForm()}
						submitLabel="설문 디자인 임시 적용"
						onSave={handleFormSave}
					/>
				{/key}
			</div>

			<!-- Response Test Form Area -->
			{#if savedForm}<div class="trial-box">
					<h3>✏️ 응답 시뮬레이터</h3>
					<p class="trial-info">
						상단에서 임시 적용한 설문 구조로 즉석에서 응답 필드와 유효성 검증을 테스트합니다.
					</p>

					{#key responseRevision}
						<form on:submit={handleTrialSubmit} class="trial-form">
							<fieldset class="trial-fieldset">
								<legend class="sr-only">{savedForm.title || '테스트 설문'} 질문 항목</legend>
								<h4>{savedForm.title || '제목 없는 폼'}</h4>
								{#if savedForm.description}
									<p class="trial-desc">{savedForm.description}</p>
								{/if}

								<QuestionFields questions={savedForm.questions} prefix="trial" />
							</fieldset>

							{#if trialSuccessMessage}
								<div class="status-success" role="status" aria-live="polite">
									{trialSuccessMessage}
								</div>
							{/if}

							{#if trialErrorMessage}
								<div class="status-error" role="alert">
									{trialErrorMessage}
								</div>
							{/if}

							<button type="submit" class="submit-trial-btn"> 응답 테스트 실행 </button>
						</form>
					{/key}
				</div>{:else}<p>
					질문을 편집하고 ‘설문 디자인 임시 적용’을 누르면 응답 테스트가 열립니다.
				</p>{/if}
		</section>
	</div>
</div>

<style>
	h1 {
		font-size: clamp(1.6rem, 5vw, 2.7rem);
		overflow-wrap: anywhere;
	}
	.trial-fieldset {
		min-width: 0;
	}
	.file-label:focus-within {
		outline: 2px solid #b8cee7;
		outline-offset: 2px;
	}
	.playground-container {
		max-width: 1100px;
		margin: 0 auto;
		padding: clamp(0.75rem, 3vw, 2rem);
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		color: var(--text-color, #e2e8f0);
		background-color: var(--bg-color, #1a1d24);
		box-sizing: border-box;
	}

	* {
		box-sizing: border-box;
	}

	.hero-section {
		background: #252830;
		border: 1px solid #3a3f4b;
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 2rem;
	}

	.badge {
		display: inline-block;
		background: #ff5a5f;
		color: #fff;
		font-weight: bold;
		font-size: 0.75rem;
		padding: 0.2rem 0.6rem;
		border-radius: 50px;
		margin-bottom: 0.75rem;
	}

	.disclaimer {
		font-size: 0.9rem;
		line-height: 1.6;
		color: #a0aec0;
		margin: 0.5rem 0 0 0;
	}

	.control-bar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
		background: #20222a;
		padding: 1rem;
		border-radius: 8px;
		align-items: center;
	}

	.control-bar button,
	.file-label {
		font-size: 0.9rem;
		padding: 0.6rem 1rem;
		border-radius: 6px;
		cursor: pointer;
		background: #30343e;
		color: #fff;
		border: 1px solid #555b68;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.control-bar button:disabled,
	.file-label.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.file-label input[type='file'] {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.danger-btn {
		background: #4a1c1d !important;
		border-color: #742a2a !important;
	}

	.danger-btn:hover {
		background: #5f2425 !important;
	}

	.alert-banner {
		background: #3d231d;
		border: 1px solid #8c4333;
		color: #ffb6a0;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		margin-bottom: 1.5rem;
	}

	.workspace-grid {
		display: flex;
		flex-direction: column;
		gap: 3rem;
	}

	.workspace-block {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.section-header h2 {
		font-size: 1.5rem;
		margin: 0;
		border-left: 4px solid var(--primary-color, #4f46e5);
		padding-left: 0.75rem;
	}

	.editor-box,
	.builder-box,
	.trial-box {
		background: #20222a;
		border: 1px solid #3a3f4b;
		border-radius: 12px;
		padding: 1.5rem;
	}

	.editor-box h3,
	.trial-box h3 {
		margin-top: 0;
		margin-bottom: 1rem;
		font-size: 1.15rem;
	}

	.extra-actions {
		margin-top: 1rem;
		display: flex;
		justify-content: flex-end;
	}

	.text-btn {
		background: transparent;
		border: none;
		color: #fc8181;
		cursor: pointer;
		text-decoration: underline;
		padding: 0.5rem;
	}

	.board-wrapper {
		background: #1e2028;
		border-radius: 12px;
		padding: 0.5rem;
	}

	.trial-info {
		color: #a0aec0;
		font-size: 0.9rem;
		margin-bottom: 1.25rem;
	}

	.trial-form {
		background: #252830;
		border: 1px solid #3a3f4b;
		border-radius: 8px;
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.trial-fieldset {
		border: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.trial-fieldset h4 {
		font-size: 1.2rem;
		margin: 0;
		color: #fff;
	}

	.trial-desc {
		font-size: 0.95rem;
		color: #cbd5e0;
		margin: 0 0 0.5rem 0;
		white-space: pre-wrap;
	}

	.submit-trial-btn {
		background: var(--primary-color, #4f46e5);
		color: white;
		border: none;
		padding: 0.8rem 1.5rem;
		border-radius: 8px;
		font-weight: bold;
		cursor: pointer;
		width: 100%;
		font-size: 1rem;
	}

	.status-success {
		background: #1c3d27;
		border: 1px solid #276749;
		color: #9ae6b4;
		padding: 0.75rem 1rem;
		border-radius: 6px;
		font-size: 0.9rem;
	}

	.status-error {
		background: #3d231d;
		border: 1px solid #8c4333;
		color: #ffb6a0;
		padding: 0.75rem 1rem;
		border-radius: 6px;
		font-size: 0.9rem;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	@media (max-width: 480px) {
		.playground-container {
			padding: 0.5rem;
		}
		.control-bar {
			flex-direction: column;
			align-items: stretch;
		}
		.control-bar button,
		.file-label {
			width: 100%;
		}
	}
</style>
