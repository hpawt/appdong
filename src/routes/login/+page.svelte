<script>
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
	import { enhance, applyAction } from '$app/forms';
	import { beginSubmission, focusFormError } from '$lib/form-feedback';
	import { invalidateAll } from '$app/navigation';

	export let form;

	// URL 쿼리 파라미터를 읽습니다.
	const messageCode = $page.url.searchParams.get('message');

	// 메시지 코드에 따라 표시할 텍스트를 결정합니다.
	let successMessage = '';
	if (messageCode === 'info_updated') {
		successMessage = '개인정보가 성공적으로 수정되었습니다. 다시 로그인해주세요.';
	} else if (messageCode === 'password_updated') {
		successMessage = '비밀번호가 성공적으로 변경되었습니다. 새로운 비밀번호로 로그인해주세요.';
	}
</script>

<div class="auth-wrapper">
	<div class="auth-container">
		{#if successMessage}
			<p class="success-message">{successMessage}</p>
		{/if}

		<h2 class="title">로그인</h2>
		<p class="subtitle">APPDONG에 오신 것을 환영합니다.</p>

		<form
			method="POST"
			use:enhance={({ formElement, cancel }) => {
				const finish = beginSubmission(formElement);
				if (!finish) {
					cancel();
					return;
				}
				return async ({ result }) => {
					try {
						if (result.type === 'redirect') {
							await invalidateAll();
						}
						await applyAction(result);
						if (result.type === 'failure') await focusFormError(formElement);
					} finally {
						finish();
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
					autocomplete="username"
					autocapitalize="none"
					spellcheck="false"
					placeholder="아이디를 입력하세요"
					required
				/>
			</div>
			<div class="form-group">
				<label for="password">비밀번호</label>
				<input
					type="password"
					id="password"
					name="password"
					autocomplete="current-password"
					placeholder="비밀번호를 입력하세요"
					required
				/>
			</div>

			{#if form?.message}
				<p class="error-message" role="alert" tabindex="-1">{form.message}</p>
			{/if}

			<button type="submit" class="submit-button">로그인</button>
		</form>
		<p class="switch-form">
			<a href={resolve('/forgot-password')}>비밀번호를 잊으셨나요?</a>
		</p>
		<p class="switch-form">
			계정이 없으신가요? <a href={resolve('/signup')}>회원가입</a>
		</p>
	</div>
</div>

<style>
	@media (max-width: 480px) {
		.auth-wrapper {
			padding: 0.5rem !important;
		}
		.auth-container {
			padding: 1.5rem 1rem !important;
		}
	}
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
	.success-message {
		color: #a5d6a7;
		background-color: rgba(165, 214, 167, 0.15);
		border: 1px solid rgba(165, 214, 167, 0.3);
		padding: 1rem;
		border-radius: 8px;
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.switch-form {
		text-align: center;
		margin-top: 1rem;
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

	/* (선택사항) readonly input에 포커스가 갔을 때 시각적 효과를 없애줍니다. */
</style>
