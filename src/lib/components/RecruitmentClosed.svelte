<script>
	import { resolve } from '$app/paths';
</script>

<section class="closed-notice">
	<p class="eyebrow">APPDONG</p>
	<h1>현재는 모집 기간이 아닙니다</h1>
	<p>지원서 접수가 종료되었습니다. 다음 모집은 공지사항을 통해 안내할 예정입니다.</p>
	<div class="links">
		<a href={resolve('/announce')}>공지사항 보기</a>
		<a href={resolve('/about-us')}>동아리 알아보기</a>
	</div>
</section>

<style>
	.closed-notice {
		max-width: 640px;
		margin: clamp(2rem, 8vw, 6rem) auto;
		padding: clamp(1.25rem, 5vw, 3rem);
		border: 1px solid var(--border-color);
		border-radius: 20px;
		background: #252830;
		text-align: center;
	}
	.eyebrow {
		color: var(--primary-color);
		letter-spacing: 0.15em;
	}
	h1 {
		font-size: clamp(1.6rem, 5vw, 2.4rem);
		word-break: keep-all;
	}
	p {
		line-height: 1.8;
	}
	.links {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1rem;
		margin-top: 2rem;
	}
	a {
		border: 1px solid var(--border-color);
		border-radius: 8px;
		padding: 0.75rem 1rem;
	}
</style>
