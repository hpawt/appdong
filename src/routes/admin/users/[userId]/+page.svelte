<script>
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';

	export let data;
	export let form;

	$: user = data.user;
	$: successMessage = form?.success ? form.message : '';
</script>

<div class="header-actions">
	<a href={resolve('/admin/users')}>&larr; 회원 목록으로 돌아가기</a>

	<form
		method="POST"
		action="?/deleteUser"
		use:enhance={({ cancel }) => {
			if (!confirm(`${user.name}(${user.username})님의 계정을 정말 삭제하시겠습니까?`)) cancel();
		}}
	>
		<button type="submit" class="delete-button">회원 삭제</button>
	</form>
</div>

<h1>{user.username}님 정보 수정</h1>

<form class="edit-form" method="POST" action="?/updateUser">
	<div class="form-group">
		<label for="name">이름</label>
		<input type="text" id="name" name="name" value={user.name} />
	</div>
	<div class="form-group">
		<label for="student_id">학번</label>
		<input type="text" id="student_id" name="student_id" value={user.student_id} />
	</div>
	<div class="form-group">
		<label for="department">학과</label>
		<input type="text" id="department" name="department" value={user.department} />
	</div>
	<div class="form-group">
		<label for="phone_number">전화번호</label>
		<input type="tel" id="phone_number" name="phone_number" value={user.phone_number} />
	</div>
	<div class="form-group">
		<label for="role">역할</label>
		<select id="role" name="role" value={user.role}>
			<option value="USER">USER</option>
			<option value="ADMIN">ADMIN</option>
		</select>
	</div>

	{#if form?.message && !form?.success}
		<p class="error-message">{form.message}</p>
	{:else if successMessage}
		<p class="success-message">{successMessage}</p>
	{/if}

	<button type="submit">수정 완료</button>
</form>

<section class="password-reset">
	<h2>비밀번호 재설정</h2>
	<p>운영진이 본인 확인을 마친 회원에게만 재설정해주세요. 기존 로그인 세션은 모두 종료됩니다.</p>
	<form method="POST" action="?/resetPassword" use:enhance>
		<label for="reset-password">새 비밀번호</label><input
			id="reset-password"
			name="password"
			type="password"
			minlength="6"
			maxlength="255"
			autocomplete="new-password"
			required
		/>
		<label for="reset-confirm">새 비밀번호 확인</label><input
			id="reset-confirm"
			name="confirm_password"
			type="password"
			minlength="6"
			maxlength="255"
			autocomplete="new-password"
			required
		/>
		<button type="submit">비밀번호 재설정</button>
	</form>
</section>

<style>
	.edit-form {
		max-width: 600px;
		margin-top: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	input,
	select {
		padding: 0.8rem;
		background-color: #2c2f38;
		border: 1px solid var(--border-color);
		border-radius: 4px;
		color: var(--text-color);
	}
	button {
		padding: 0.8rem;
		background-color: var(--primary-color);
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
	}
	.error-message {
		color: #ff9494;
	}
	.header-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
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
	.success-message {
		color: #a5d6a7;
		background-color: rgba(165, 214, 167, 0.15);
		padding: 0.5rem;
		border-radius: 4px;
		text-align: center;
	}
</style>
