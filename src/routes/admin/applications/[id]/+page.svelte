<script>
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import { parseStringList } from '$lib/attachments';
	export let data;

	$: application = data.application;
	$: studySubjects = parseStringList(application.studySubjects);
	$: bootcampMemberLangs = parseStringList(application.bootcampMemberLangs);
	$: bootcampMentorLangs = parseStringList(application.bootcampMentorLangs);
</script>

<div class="application-view">
	<header class="page-header">
		<a href={resolve('/admin/applications')} class="back-link">&larr; 지원서 목록으로 돌아가기</a>

		<form
			method="POST"
			action="?/deleteApplication"
			use:enhance={({ cancel }) => {
				if (!confirm(`${application.fullName}님의 지원서를 정말 삭제하시겠습니까?`)) {
					cancel();
				}
			}}
		>
			<button type="submit" class="delete-button">지원서 삭제</button>
		</form>
	</header>

	<div class="applicant-info-card">
		<h1>{application.fullName} ({application.studentId})</h1>
		<p>{application.department}</p>
		<div class="contact-info">
			<span>{application.phoneNumber}</span>
			<span>{new Date(application.submittedAt).toLocaleString('ko-KR')} 제출</span>
		</div>
	</div>

	<div class="content-block">
		<h2>기본 정보</h2>
		<p><strong>GitHub 사용 경험:</strong> {application.githubExperience}</p>
		<p><strong>선택한 활동:</strong> <span class="highlight">{application.activityChoice}</span></p>
	</div>

	<div class="content-block">
		<h2>프로그래밍 경험</h2>
		<p><strong>경험 수준:</strong> {application.programmingExperience}</p>

		<!-- '보통' 또는 '숙련자'일 경우에만 표시 -->
		{#if application.programmingExperience === '보통' || application.programmingExperience === '숙련자'}
			{#if application.knownFields}
				<p><strong>다뤄본 분야:</strong> {application.knownFields}</p>
			{/if}
			{#if application.specificExperience}
				<p><strong>구체적인 경험 서술:</strong></p>
				<p class="content-text">{application.specificExperience}</p>
			{/if}
		{/if}
	</div>

	<!-- =================== 조건부 정보 표시 =================== -->

	{#if application.activityChoice === 'Vibe 클래스'}
		<div class="content-block">
			<h2>Vibe 클래스: 만들고 싶은 서비스 아이디어</h2>
			<p class="content-text">{application.vibeServiceIdea || '미작성'}</p>
		</div>
	{/if}

	{#if application.activityChoice === '스터디'}
		<div class="content-block">
			<h2>스터디: 배우고 싶은 과목</h2>
			{#if studySubjects.length > 0}
				<div class="tags-container">
					{#each studySubjects as subject (subject)}
						<span class="tag">{subject}</span>{/each}
				</div>
			{:else}
				<p>선택 항목 없음</p>
			{/if}
		</div>
	{/if}

	{#if application.activityChoice === '부트캠프 (일반)'}
		<div class="content-block">
			<h2>부트캠프 (일반): 정보</h2>
			<p><strong>진행하고 싶은 프로젝트 주제:</strong></p>
			<p class="content-text">{application.bootcampProjectIdea || '미작성'}</p>
			<p><strong>사용하고 싶은 언어:</strong></p>
			{#if bootcampMemberLangs.length > 0}
				<div class="tags-container">
					{#each bootcampMemberLangs as lang (lang)}
						<span class="tag">{lang}</span>{/each}
					{#if application.bootcampMemberLangsOther}
						<span class="tag other">{application.bootcampMemberLangsOther}</span>
					{/if}
				</div>
			{:else}
				<p>선택 항목 없음</p>
			{/if}
		</div>
	{/if}

	{#if application.activityChoice === '부트캠프 (멘토)'}
		<div class="content-block">
			<h2>부트캠프 (멘토): 정보</h2>
			<p><strong>지도 가능한 언어:</strong></p>
			{#if bootcampMentorLangs.length > 0}
				<div class="tags-container">
					{#each bootcampMentorLangs as lang (lang)}
						<span class="tag">{lang}</span>{/each}
					{#if application.bootcampMentorLangsOther}
						<span class="tag other">{application.bootcampMentorLangsOther}</span>
					{/if}
				</div>
			{:else}
				<p>선택 항목 없음</p>
			{/if}
			<p><strong>지도 가능 시간대:</strong></p>
			<p class="content-text">{application.mentorAvailableTime || '미작성'}</p>
			<p><strong>멘토링 관련 경험:</strong></p>
			<p class="content-text">{application.mentorExperience || '미작성'}</p>
		</div>
	{/if}

	<!-- ======================================================= -->

	<div class="content-block">
		<h2>지원 동기</h2>
		<p class="content-text">{application.motivation}</p>
	</div>

	{#if application.finalWords}
		<div class="content-block">
			<h2>마지막으로 할 말</h2>
			<p class="content-text">{application.finalWords}</p>
		</div>
	{/if}
</div>

<style>
	/* ==========================================================================
	   1. 페이지 최상위 레이아웃
	   ========================================================================== */

	.back-link {
		color: var(--secondary-color);
		text-decoration: none;
		font-weight: 500;
	}
	.back-link:hover {
		text-decoration: underline;
	}
	.delete-button {
		background-color: #e53e3e;
		color: white;
		border: none;
		padding: 0.6rem 1.2rem;
		border-radius: 6px;
		cursor: pointer;
		font-weight: 500;
	}

	/* ==========================================================================
	   2. 지원자 프로필 카드
	   ========================================================================== */
	.applicant-info-card {
		background-color: #252830;
		text-align: center;
		padding: 2.5rem;
		margin: 2rem 0 3rem;
		border-radius: 16px;
		border: 1px solid var(--border-color);
	}
	.applicant-info-card h1 {
		font-family: var(--font-serif);
		font-size: 2.5rem;
		margin: 0;
	}
	.applicant-info-card p {
		color: var(--secondary-color);
		margin: 0.5rem 0 0;
	}
	.contact-info {
		margin-top: 1rem;
		display: flex;
		justify-content: center;
		gap: 1.5rem;
		font-size: 0.9rem;
	}

	/* ==========================================================================
	   3. 공통 콘텐츠 블록 및 텍스트 스타일
	   ========================================================================== */
	.content-block {
		margin-bottom: 2.5rem;
	}
	.content-block h2 {
		border-bottom: 1px solid var(--border-color);
		padding-bottom: 0.8rem;
		margin-top: 0;
		margin-bottom: 1.5rem;
		font-size: 1.5rem;
	}
	.content-block p {
		margin: 0.5rem 0 1rem;
		line-height: 1.8;
	}
	.content-text {
		white-space: pre-wrap;
		line-height: 1.8;
		background-color: #1f2128;
		padding: 1.5rem;
		border-radius: 8px;
		border: 1px solid var(--border-color);
	}
	.highlight {
		color: var(--primary-color);
		font-weight: bold;
	}

	/* ==========================================================================
	   4. 태그 UI 스타일
	   ========================================================================== */
	.tags-container {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}
	.tag {
		background-color: #3a3f4b;
		padding: 0.4rem 1rem;
		border-radius: 999px;
		font-size: 0.9rem;
	}
	.tag.other {
		background-color: var(--primary-color);
		color: white;
	}
</style>
