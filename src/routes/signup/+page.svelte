<script>
	import { resolve } from '$app/paths';
	import { enhance, applyAction } from '$app/forms';
	import { goto } from '$app/navigation';
	import { onDestroy } from 'svelte';

	export let form;

	// 상태 변수들
	let password = '';
	let confirmPassword = '';
	let showPassword = false;

	let signupSuccess = false;
	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let redirectTimer;
	onDestroy(() => clearTimeout(redirectTimer));
	let phone1 = '',
		phone2 = '',
		phone3 = '';
	/** @type {HTMLInputElement | undefined} */
	let phoneEl2;
	/** @type {HTMLInputElement | undefined} */
	let phoneEl3;

	// 전화번호 입력 시 다음 칸으로 자동 포커스 이동 함수
	/** @param {number} part @param {Event} event */
	function handlePhoneInput(part, event) {
		const input = /** @type {HTMLInputElement} */ (event.target);
		if (input.value.length === input.maxLength) {
			if (part === 1) phoneEl2?.focus();
			if (part === 2) phoneEl3?.focus();
		}
	}
</script>

<div class="auth-wrapper">
	<div class="auth-container">
		{#if signupSuccess}
			<div class="success-container">
				<h2 class="title">가입 완료!</h2>
				<p class="subtitle">{form?.message || '회원가입이 성공적으로 완료되었습니다.'}</p>
				<p class="redirect-notice">잠시 후 홈페이지로 이동합니다...</p>
			</div>
		{:else}
			<div>
				<h2 class="title">회원가입</h2>
				<p class="subtitle">비밀번호는 해시로 저장되며, 가입 정보는 동아리 운영에 사용됩니다.</p>

				<form
					method="POST"
					use:enhance={() => {
						// 서버로부터 응답이 오면 실행될 콜백
						return async ({ result }) => {
							if (result.type === 'success') {
								await applyAction(result);
								signupSuccess = true;

								redirectTimer = setTimeout(() => {
									goto(resolve('/'));
								}, 2500);
							} else {
								await applyAction(result);
							}
						};
					}}
				>
					<div class="form-group">
						<label for="username">아이디</label>
						<input
							type="text"
							id="username"
							name="username"
							placeholder="아이디 (3자 이상)"
							required
						/>
					</div>

					<div class="form-group">
						<label for="name">성함</label>
						<input type="text" id="name" name="name" placeholder="성함을 입력하세요" required />
					</div>

					<div class="form-group">
						<label for="student_id">학번</label>
						<input
							type="tel"
							id="student_id"
							name="student_id"
							placeholder="학번 10자리"
							required
							inputmode="numeric"
						/>
					</div>

					<div class="form-group">
						<label for="department">학과(부)</label>
						<input
							type="text"
							id="department"
							name="department"
							placeholder="학과(부)를 입력하세요"
							required
						/>
					</div>

					<div class="form-group">
						<label for="phone1">전화번호</label>
						<div class="phone-input-group">
							<!-- 👇 문제가 되었던 pattern과 title 속성을 모두 제거했습니다. -->
							<input
								type="tel"
								id="phone1"
								name="phone1"
								maxlength="3"
								required
								inputmode="numeric"
								bind:value={phone1}
								on:input={(e) => handlePhoneInput(1, e)}
							/>
							<span>-</span>
							<input
								type="tel"
								id="phone2"
								name="phone2"
								maxlength="4"
								required
								inputmode="numeric"
								bind:value={phone2}
								bind:this={phoneEl2}
								on:input={(e) => handlePhoneInput(2, e)}
							/>
							<span>-</span>
							<input
								type="tel"
								id="phone3"
								name="phone3"
								maxlength="4"
								required
								inputmode="numeric"
								bind:value={phone3}
								bind:this={phoneEl3}
							/>
						</div>
					</div>

					<div class="form-group">
						<label for="password">비밀번호</label>
						<div class="password-input-wrapper">
							<input
								type={showPassword ? 'text' : 'password'}
								id="password"
								name="password"
								placeholder="비밀번호 (6자 이상)"
								required
								bind:value={password}
							/>
							<button
								type="button"
								class="toggle-password"
								on:click={() => (showPassword = !showPassword)}
								aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
							>
								<img
									src={showPassword ? '/eye.png' : '/eye.png'}
									alt="toggle password visibility"
								/>
							</button>
						</div>
					</div>

					<div class="form-group">
						<label for="confirm_password">비밀번호 확인</label>
						<input
							type="password"
							id="confirm_password"
							name="confirm_password"
							placeholder="비밀번호를 다시 입력하세요"
							required
							bind:value={confirmPassword}
						/>
						{#if password && confirmPassword && password !== confirmPassword}
							<p class="password-mismatch">비밀번호가 일치하지 않습니다.</p>
						{/if}
					</div>

					{#if form?.message && !signupSuccess}
						<p class="error-message">{form.message}</p>
					{/if}

					<button type="submit" class="submit-button">가입하기</button>
				</form>
				<p class="switch-form">
					이미 계정이 있으신가요? <a href={resolve('/login')}>로그인</a>
				</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.auth-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 70vh;
		padding: 2rem;
	}

	.auth-container {
		width: 100%;
		max-width: 420px;
		background-color: #252830;
		padding: 2.5rem 3rem;
		border-radius: 16px;
		border: 1px solid var(--border-color);
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		animation: fadeIn 0.5s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.title {
		font-family: var(--font-serif);
		font-size: 2.5rem;
		text-align: center;
		color: #fff;
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
		gap: 1.25rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
	}

	label {
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
		color: var(--secondary-color);
	}

	input {
		background-color: var(--bg-color);
		border: 1px solid var(--border-color);
		color: var(--text-color);
		padding: 0.9rem 1rem;
		border-radius: 8px;
		font-size: 1rem;
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease;
	}

	input::placeholder {
		color: var(--secondary-color);
		opacity: 0.7;
	}

	input:focus {
		outline: none;
		border-color: var(--primary-color);
		box-shadow: 0 0 0 3px rgba(255, 62, 0, 0.2);
	}

	.submit-button {
		background-color: var(--primary-color);
		color: white;
		border: none;
		padding: 1rem;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: bold;
		cursor: pointer;
		margin-top: 1rem;
		transition:
			transform 0.2s ease,
			filter 0.2s ease;
	}

	.submit-button:hover {
		filter: brightness(1.1);
		transform: translateY(-2px);
	}

	.error-message {
		color: #ff9494;
		background-color: rgba(255, 77, 77, 0.15);
		border: 1px solid rgba(255, 77, 77, 0.3);
		padding: 1rem;
		border-radius: 8px;
		text-align: center;
	}

	.switch-form {
		text-align: center;
		margin-top: 2rem;
		font-size: 0.9rem;
		color: var(--secondary-color);
	}

	.switch-form a {
		color: var(--primary-color);
		font-weight: 500;
		text-decoration: none;
		transition: opacity 0.2s;
	}

	.switch-form a:hover {
		opacity: 0.8;
		text-decoration: underline;
	}
	.success-container {
		text-align: center;
		padding: 2rem 0;
	}
	.redirect-notice {
		margin-top: 1.5rem;
		color: var(--secondary-color);
		font-size: 0.9rem;
	}
	.phone-input-group {
		display: flex;
		align-items: center;
		gap: 0.75rem; /* 간격을 살짝 넓혀줍니다 */
	}
	.phone-input-group input {
		text-align: center;
		/* 기본 너비를 100%로 설정하여 flex가 크기를 조절할 수 있도록 합니다. */
		width: 100%;
	}
	/* name 속성을 이용해 각 input을 개별적으로 타겟팅합니다. */
	.phone-input-group input[name='phone1'] {
		flex-grow: 3; /* 3의 비율로 공간을 차지합니다. */
	}
	.phone-input-group input[name='phone2'] {
		flex-grow: 4; /* 4의 비율로 공간을 차지합니다. */
	}
	.phone-input-group input[name='phone3'] {
		flex-grow: 4; /* 4의 비율로 공간을 차지합니다. */
	}

	.phone-input-group span {
		color: var(--secondary-color);
	}
	.password-input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}
	/* 래퍼 안의 input은 오른쪽 패딩을 추가해 버튼과 겹치지 않게 함 */
	.password-input-wrapper input {
		width: 100%;
		padding-right: 3rem; /* 버튼이 들어갈 공간 확보 */
	}

	/* 비밀번호 보기/숨기기 버튼 스타일 */
	.toggle-password {
		position: absolute;
		right: 0;
		top: 0;
		bottom: 0;
		background: none;
		border: none;
		padding: 0 1rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--secondary-color);
	}
	.toggle-password img {
		width: 20px;
		height: 20px;
		opacity: 0.6;
		transition: opacity 0.2s;
	}
	.toggle-password:hover img {
		opacity: 1;
	}

	/* 비밀번호 불일치 메시지 스타일 */
	.password-mismatch {
		font-size: 0.8rem;
		color: #ff9494;
		margin-top: 0.5rem;
	}
	@media (max-width: 480px) {
		.auth-wrapper {
			padding: 1rem;
			min-height: 80vh;
		}
		.auth-container {
			padding: 2rem 1.5rem;
		}
		.title {
			font-size: 2rem;
		}
	}
</style>
