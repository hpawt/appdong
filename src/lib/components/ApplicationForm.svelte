<script>
	import { resolve } from '$app/paths';
	import { enhance, applyAction } from '$app/forms';
	import { beforeNavigate } from '$app/navigation';
	import { applicationDraft, beginSubmission, focusFormError } from '$lib/form-feedback';
	let dirty = false;
	let submitting = false;
	beforeNavigate(({ cancel }) => {
		if (
			dirty &&
			!submitting &&
			!window.confirm('작성 중인 지원서가 있습니다. 이 페이지를 나갈까요?')
		)
			cancel();
	});
	export let data;
	export let form;

	// Translations for Korean and English
	const translations = {
		ko: {
			alreadySubmittedTitle: '지원서 제출 완료',
			alreadySubmittedSubtitle: '귀하의 지원서는 이미 제출되었습니다. 감사합니다.',
			successTitle: '제출 완료!',
			successSubtitle: '지원서가 성공적으로 제출되었습니다. 감사합니다.',
			goHome: '홈으로 돌아가기',
			formTitle: '지원서 작성',
			formSubtitle: 'APPDONG에 지원해주셔서 감사합니다. 아래 항목을 모두 작성해주세요.',
			fullName: '성명',
			phoneNumber: '전화번호',
			university: '대학',
			department: '학과',
			studentId: '학번',
			motivation: '지원 동기',
			charCounter: '자',
			programmingExperience: '프로그래밍 언어 경험',
			knownFields: '다뤄본 분야 (쉼표로 구분)',
			specificExperience: '구체적인 경험 서술',
			githubExperience: 'GitHub 사용 경험',
			activityChoice: '참가할 활동',
			vibeServiceIdea: '만들고 싶은 서비스 아이디어',
			studySubjects: '배우고 싶은 스터디 과목',
			bootcampProjectIdea: '진행하고 싶은 프로젝트 주제',
			bootcampMemberLangs: '사용하고 싶은 언어',
			bootcampMentorLangs: '지도 가능한 언어',
			mentorAvailableTime: '지도 가능 시간대',
			mentorExperience: '멘토링 관련 경험',
			finalWords: '마지막으로 할 말 (선택)',
			knownFieldsPlaceholder: '예: 웹 프론트엔드, 백엔드, 앱 개발, AI',
			specificExperiencePlaceholder:
				'진행했던 프로젝트, 사용 기술 스택, 기여한 부분 등을 자유롭게 서술해주세요.',
			otherLangPlaceholder: '기타 언어 직접 입력',
			selectOption: '선택하세요',
			expNone: '거의 없음',
			expIntermediate: '보통',
			expAdvanced: '숙련자',
			yes: '유',
			no: '무',
			activityVibe: 'Vibe 클래스',
			activityStudy: '스터디',
			activityBootcampMember: '부트캠프 (일반)',
			activityBootcampMentor: '부트캠프 (멘토)',
			other: '기타',
			submitButton: '제출하기'
		},
		en: {
			alreadySubmittedTitle: 'Application Submitted',
			alreadySubmittedSubtitle: 'Your application has already been submitted. Thank you.',
			successTitle: 'Submission Complete!',
			successSubtitle: 'Your application has been successfully submitted. Thank you.',
			goHome: 'Back to Home',
			formTitle: 'Application Form',
			formSubtitle: 'Thank you for applying to APPDONG. Please fill out all the fields below.',
			fullName: 'Full Name',
			phoneNumber: 'Phone Number',
			university: 'University / College',
			department: 'Department / Major',
			studentId: 'Student ID',
			motivation: 'Motivation for Applying',
			charCounter: 'characters',
			programmingExperience: 'Programming Language Experience',
			knownFields: 'Fields of Experience (comma-separated)',
			specificExperience: 'Describe Your Specific Experience',
			githubExperience: 'Experience with GitHub',
			activityChoice: 'Activity to Participate In',
			vibeServiceIdea: 'Service Idea You Want to Create',
			studySubjects: 'Study Subjects You Want to Learn',
			bootcampProjectIdea: 'Project Topic You Want to Work On',
			bootcampMemberLangs: 'Languages You Want to Use',
			bootcampMentorLangs: 'Languages You Can Mentor',
			mentorAvailableTime: 'Available Mentoring Hours',
			mentorExperience: 'Mentoring Experience',
			finalWords: 'Any Final Words (Optional)',
			knownFieldsPlaceholder: 'e.g., Web Frontend, Backend, App Development, AI',
			specificExperiencePlaceholder:
				'Please describe your projects, tech stacks used, contributions, etc.',
			otherLangPlaceholder: 'Please specify other language(s)',
			selectOption: 'Select an option',
			expNone: 'Almost None',
			expIntermediate: 'Intermediate',
			expAdvanced: 'Experienced',
			yes: 'Yes',
			no: 'No',
			activityVibe: 'Vibe Class',
			activityStudy: 'Study Group',
			activityBootcampMember: 'Bootcamp (Member)',
			activityBootcampMentor: 'Bootcamp (Mentor)',
			other: 'Other',
			submitButton: 'Submit'
		}
	};

	/** @type {'ko' | 'en'} */
	let lang = 'ko';
	$: t = translations[lang];

	let formData = {
		name: data.userData?.name ?? '',
		phone_number: data.userData?.phone_number ?? '',
		department: data.userData?.department ?? '',
		student_id: data.userData?.student_id ?? ''
	};
	let isLoggedIn = !!data.user;

	let motivationText = '',
		programmingExperience = '',
		activityChoice = '';
	let studySubjects = [],
		bootcampMemberLangs = [],
		bootcampMentorLangs = [];

	const studyOptions = ['JavaScript', 'Python', 'Java', 'C/C++', 'Go'];
	const bootcampMemberOptions = ['JavaScript', 'Python', 'Java'];
	const bootcampMentorOptions = ['JavaScript', 'Python', 'Java', 'Swift', 'Kotlin'];
</script>

<div class="page-wrapper">
	<div class="language-toggle">
		<div class="language-toggle-inner">
			<button on:click={() => (lang = 'ko')} class:active={lang === 'ko'}>한국어</button>
			<button on:click={() => (lang = 'en')} class:active={lang === 'en'}>English</button>
		</div>
	</div>

	<div class="application-container">
		{#if data.alreadySubmitted}
			<h1 class="title">{t.alreadySubmittedTitle}</h1>
			<p class="subtitle">{t.alreadySubmittedSubtitle}</p>
		{:else if form?.success}
			<h1 class="title">{t.successTitle}</h1>
			<p class="subtitle">{t.successSubtitle}</p>
			<div class="home-link-container"><a href={resolve('/')} class="home-link">{t.goHome}</a></div>
		{:else}
			<h1 class="title">{t.formTitle}</h1>
			<p class="subtitle">{t.formSubtitle}</p>

			<form
				method="POST"
				use:applicationDraft={{
					key: `appdong:application:${data.user?.id ?? 'guest'}`,
					onDirty: (value) => (dirty = value)
				}}
				use:enhance={({ formElement, cancel }) => {
					const finish = beginSubmission(formElement);
					if (!finish) {
						cancel();
						return;
					}
					submitting = true;
					return async ({ result }) => {
						try {
							if (result.type === 'success' && result.data?.success) {
								dirty = false;
								formElement.dispatchEvent(new Event('form:saved'));
							}
							await applyAction(result);
							if (result.type === 'failure') await focusFormError(formElement);
						} finally {
							submitting = false;
							finish();
						}
					};
				}}
			>
				<aside class="draft-tools">
					<label><input type="checkbox" data-draft-toggle /> 긴 답변을 이 탭에 임시 저장</label>
					<p>
						이름·전화번호·학번은 저장하지 않습니다. 저장본은 복원할 때만 입력되며 24시간 뒤
						만료됩니다. 공용 기기에서는 사용하지 마세요.
					</p>
					<div>
						<button type="button" data-draft-restore>저장한 답변 복원</button>
						<button type="button" data-draft-clear>저장본 삭제</button>
					</div>
					<p data-draft-status role="status"></p>
				</aside>
				<div class="form-grid">
					<div class="form-group">
						<label for="fullName">{t.fullName}</label><input
							type="text"
							id="fullName"
							name="fullName"
							bind:value={formData.name}
							readonly={isLoggedIn}
							class:readonly-input={isLoggedIn}
							required
						/>
					</div>
					<div class="form-group">
						<label for="phoneNumber">{t.phoneNumber}</label><input
							type="tel"
							id="phoneNumber"
							name="phoneNumber"
							bind:value={formData.phone_number}
							readonly={isLoggedIn}
							class:readonly-input={isLoggedIn}
							required
						/>
					</div>
					<div class="form-group">
						<label for="university">{t.university}</label><input
							type="text"
							id="university"
							name="university"
							value=""
							required
						/>
					</div>
					<div class="form-group">
						<label for="department">{t.department}</label><input
							type="text"
							id="department"
							name="department"
							bind:value={formData.department}
							readonly={isLoggedIn}
							class:readonly-input={isLoggedIn}
							required
						/>
					</div>
					<div class="form-group">
						<label for="studentId">{t.studentId}</label><input
							type="text"
							id="studentId"
							name="studentId"
							bind:value={formData.student_id}
							readonly={isLoggedIn}
							class:readonly-input={isLoggedIn}
							required
						/>
					</div>
				</div>
				<hr />
				<div class="form-group">
					<label for="motivation">{t.motivation}</label><textarea
						id="motivation"
						name="motivation"
						rows="8"
						required
						bind:value={motivationText}
					></textarea>
					<div class="char-counter">{motivationText.length} {t.charCounter}</div>
				</div>
				<div class="form-group">
					<label for="programmingExperience">{t.programmingExperience}</label><select
						id="programmingExperience"
						name="programmingExperience"
						bind:value={programmingExperience}
						required
						><option value="" disabled>{t.selectOption}</option><option value="거의 없음"
							>{t.expNone}</option
						><option value="보통">{t.expIntermediate}</option><option value="숙련자"
							>{t.expAdvanced}</option
						></select
					>
				</div>
				{#if programmingExperience === '보통' || programmingExperience === '숙련자'}
					<div class="form-group extra-fields">
						<label for="knownFields">{t.knownFields}</label><input
							type="text"
							id="knownFields"
							name="knownFields"
							placeholder={t.knownFieldsPlaceholder}
						/>
					</div>
					<div class="form-group extra-fields">
						<label for="specificExperience">{t.specificExperience}</label><textarea
							id="specificExperience"
							name="specificExperience"
							rows="6"
							placeholder={t.specificExperiencePlaceholder}
						></textarea>
					</div>
				{/if}
				<div class="form-group">
					<p class="group-label">{t.githubExperience}</p>
					<div class="radio-group">
						<label
							><input type="radio" name="githubExperience" value="유" required /><span
								class="custom-radio"
							></span><span>{t.yes}</span></label
						><label
							><input type="radio" name="githubExperience" value="무" /><span class="custom-radio"
							></span><span>{t.no}</span></label
						>
					</div>
				</div>
				<div class="form-group">
					<label for="activityChoice">{t.activityChoice}</label><select
						id="activityChoice"
						name="activityChoice"
						bind:value={activityChoice}
						required
						><option value="" disabled>{t.selectOption}</option><option value="Vibe 클래스"
							>{t.activityVibe}</option
						><option value="스터디">{t.activityStudy}</option><option value="부트캠프 (일반)"
							>{t.activityBootcampMember}</option
						><option value="부트캠프 (멘토)">{t.activityBootcampMentor}</option></select
					>
				</div>
				{#if activityChoice === 'Vibe 클래스'}
					<div class="form-group conditional">
						<label for="vibeServiceIdea">{t.vibeServiceIdea}</label><textarea
							id="vibeServiceIdea"
							name="vibeServiceIdea"
							rows="4"
						></textarea>
					</div>
				{/if}
				{#if activityChoice === '스터디'}
					<div class="form-group conditional">
						<p class="group-label">{t.studySubjects}</p>
						<div class="checkbox-group">
							{#each studyOptions as subject (subject)}
								<label
									><input
										type="checkbox"
										name="studySubjects"
										value={subject}
										bind:group={studySubjects}
									/><span class="custom-checkbox"></span><span>{subject}</span></label
								>{/each}
						</div>
					</div>
				{/if}
				{#if activityChoice === '부트캠프 (일반)'}
					<div class="conditional">
						<div class="form-group">
							<label for="bootcampProjectIdea">{t.bootcampProjectIdea}</label><textarea
								id="bootcampProjectIdea"
								name="bootcampProjectIdea"
								rows="4"
							></textarea>
						</div>
						<div class="form-group">
							<p class="group-label">{t.bootcampMemberLangs}</p>
							<div class="checkbox-group">
								{#each bootcampMemberOptions as lang (lang)}
									<label
										><input
											type="checkbox"
											name="bootcampMemberLangs"
											value={lang}
											bind:group={bootcampMemberLangs}
										/><span class="custom-checkbox"></span><span>{lang}</span></label
									>{/each}<label
									><input
										type="checkbox"
										name="bootcampMemberLangs"
										value="기타"
										bind:group={bootcampMemberLangs}
									/><span class="custom-checkbox"></span><span>{t.other}</span></label
								>
							</div>
							{#if bootcampMemberLangs.includes('기타')}<input
									type="text"
									name="bootcampMemberLangsOther"
									placeholder={t.otherLangPlaceholder}
								/>{/if}
						</div>
					</div>
				{/if}
				{#if activityChoice === '부트캠프 (멘토)'}
					<div class="conditional">
						<div class="form-group">
							<p class="group-label">{t.bootcampMentorLangs}</p>
							<div class="checkbox-group">
								{#each bootcampMentorOptions as lang (lang)}
									<label
										><input
											type="checkbox"
											name="bootcampMentorLangs"
											value={lang}
											bind:group={bootcampMentorLangs}
										/><span class="custom-checkbox"></span><span>{lang}</span></label
									>{/each}<label
									><input
										type="checkbox"
										name="bootcampMentorLangs"
										value="기타"
										bind:group={bootcampMentorLangs}
									/><span class="custom-checkbox"></span><span>{t.other}</span></label
								>
							</div>
							{#if bootcampMentorLangs.includes('기타')}<input
									type="text"
									name="bootcampMentorLangsOther"
									placeholder={t.otherLangPlaceholder}
								/>{/if}
						</div>
						<div class="form-group">
							<label for="mentorAvailableTime">{t.mentorAvailableTime}</label><textarea
								id="mentorAvailableTime"
								name="mentorAvailableTime"
								rows="3"
							></textarea>
						</div>
						<div class="form-group">
							<label for="mentorExperience">{t.mentorExperience}</label><textarea
								id="mentorExperience"
								name="mentorExperience"
								rows="5"
							></textarea>
						</div>
					</div>
				{/if}
				<div class="form-group">
					<label for="finalWords">{t.finalWords}</label><textarea
						id="finalWords"
						name="finalWords"
						rows="4"
					></textarea>
				</div>
				{#if form?.message}<p class="error-message" role="alert" tabindex="-1">
						{form.message}
					</p>{/if}
				<button type="submit" class="submit-button">{t.submitButton}</button>
			</form>
		{/if}
	</div>
</div>

<style>
	.draft-tools {
		border: 1px solid var(--border-color);
		border-radius: 12px;
		padding: 1rem;
	}
	.draft-tools p {
		font-size: 0.85rem;
		color: var(--secondary-color);
	}
	.draft-tools button {
		background: var(--bg-color);
		color: var(--text-color);
		border: 1px solid var(--border-color);
		border-radius: 6px;
		padding: 0.6rem;
		margin-bottom: 0.5rem;
	}
	.draft-tools label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.submit-button {
		padding: 0.9rem 1.5rem;
		border: none;
		border-radius: 8px;
		background: var(--primary-color);
		color: white;
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}
	.submit-button:focus-visible {
		outline: 2px solid var(--text-color);
		outline-offset: 3px;
	}
	/* ==========================================================================
	   1. 모바일 우선 스타일 (기본)
	   ========================================================================== */
	.application-container {
		max-width: 800px;
		margin: 1rem auto;
		padding: 1.5rem;
		background-color: #252830;
		border-radius: 16px;
		border: 1px solid var(--border-color);
	}
	.title {
		text-align: center;
		font-size: 2rem;
		margin-bottom: 0.5rem;
	}
	.subtitle {
		text-align: center;
		color: var(--secondary-color);
		margin-bottom: 2.5rem;
	}
	form {
		display: flex;
		flex-direction: column;
		gap: 1.8rem;
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.8rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	label {
		font-weight: 500;
		font-size: 0.9rem;
		color: var(--secondary-color);
	}

	input[type='text'],
	input[type='tel'],
	textarea,
	select {
		width: 100%;
		padding: 0.9rem 1rem;
		background-color: var(--bg-color);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		color: var(--text-color);
		font-size: 1rem;
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
	}
	input:focus,
	textarea:focus,
	select:focus {
		outline: none;
		border-color: var(--primary-color);
		box-shadow: 0 0 0 3px rgba(255, 62, 0, 0.2);
	}
	.readonly-input {
		background-color: #1c1e24;
		cursor: not-allowed;
	}
	.readonly-input:focus {
		border-color: var(--border-color);
		box-shadow: none;
	}

	hr {
		border: none;
		border-top: 1px solid var(--border-color);
		margin: 1.5rem 0;
	}

	.conditional {
		border-left: 3px solid var(--primary-color);
		padding-left: 1.5rem;
		margin-top: 1rem;
		animation: fadeIn 0.5s;
	}
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	/* ==========================================================================
	   2. (핵심 병합) 커스텀 폼 컨트롤 스타일
	   ========================================================================== */

	/* --- 커스텀 Select (드롭다운) --- */
	select {
		appearance: none;
		-webkit-appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23676778' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 1rem center;
		padding-right: 3rem;
	}

	/* --- 커스텀 Radio & Checkbox --- */
	.radio-group,
	.checkbox-group {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		gap: 1rem;
		padding-top: 0.5rem;
	}
	.radio-group label,
	.checkbox-group label {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 6px;
		transition: background-color 0.2s;
		-webkit-tap-highlight-color: transparent; /* 모바일 탭 하이라이트 제거 */
	}
	.radio-group label:hover,
	.checkbox-group label:hover {
		background-color: rgba(255, 255, 255, 0.05);
	}

	/* 실제 input을 화면에서 숨깁니다. */
	.radio-group input,
	.checkbox-group input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	/* 가짜 버튼 (span)의 기본 모양 */
	.custom-radio,
	.custom-checkbox {
		display: inline-block;
		width: 20px;
		height: 20px;
		border: 2px solid var(--secondary-color);
		transition: all 0.2s;
		flex-shrink: 0;
	}
	.custom-radio {
		border-radius: 50%;
	}
	.custom-checkbox {
		border-radius: 4px;
	}

	/* 실제 input이 체크되었을 때, 바로 뒤(+)의 가짜 버튼 스타일 변경 */
	input[type='radio']:checked + .custom-radio {
		border-color: var(--primary-color);
		background-color: var(--primary-color);
		box-shadow: 0 0 0 3px var(--bg-color) inset;
	}
	input[type='checkbox']:checked + .custom-checkbox {
		border-color: var(--primary-color);
		background-color: var(--primary-color);
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: center;
	}

	/* 키보드 사용자를 위한 포커스 스타일 */
	input:focus-visible + span {
		outline: 2px solid var(--primary-color);
		outline-offset: 2px;
	}

	/* ==========================================================================
	   3. PC 화면용 스타일 (@media 쿼리)
	   ========================================================================== */
	@media (min-width: 640px) {
		.application-container {
			padding: 2.5rem;
			margin: 2rem auto;
		}
		.title {
			font-size: 2.5rem;
		}
		.form-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	.page-wrapper {
		max-width: 800px;
		margin: 2rem auto;
	}

	/* (핵심) 언어 변환 버튼 스타일 */
	.language-toggle {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 1rem;
	}
	.language-toggle-inner {
		display: inline-flex;
		background-color: #3a3f4b;
		padding: 4px;
		border-radius: 8px;
	}
	.language-toggle button {
		background: transparent;
		border: none;
		padding: 0.5rem 1rem;
		cursor: pointer;
		border-radius: 6px;
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--secondary-color);
		transition: all 0.2s ease;
	}
	.language-toggle button.active {
		background-color: #252830;
		color: var(--text-color);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
	}
</style>
