<script>
	import { resolve } from '$app/paths';
</script>

<div class="recovery">
	<h1>비밀번호 찾기</h1>
	<p>계정 복구를 위해 동아리 운영진에게 문의해주세요.</p>
	<p>확인 후 비밀번호 재설정 방법을 안내해드립니다.</p>
	<a href={resolve('/about-us/members')}>운영진 확인</a>
	<a href={resolve('/login')}>로그인으로 돌아가기</a>
</div>

<style>
	.recovery {
		max-width: 480px;
		margin: 4rem auto;
		padding: 2rem;
		background: #252830;
		border-radius: 16px;
	}
	a {
		display: block;
		margin-top: 1rem;
		color: var(--primary-color);
	}
</style>
