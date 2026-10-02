<script>
	import { resolve } from '$app/paths';
</script>

<!-- src/routes/components/Hero.svelte -->
<section class="hero-section">
	<div class="text-content">
		<h1>
			Hello,<br />
			APPDONG!
		</h1>
		<h2>경북대학교 중앙동아리 앱동</h2>
		<a href={resolve('/accession')} class="cta-button">가입 안내</a>
	</div>
	<div class="graphic-content">
		<!-- 실제 3D 그래픽이나 고품질 이미지가 들어갈 자리입니다. -->
		<!-- 예시로 Svelte 로고 이미지 URL을 사용합니다. -->
		<img src="/apdomk.png" alt="img" />
	</div>
</section>

<style>
	@media (max-width: 768px) {
		.hero-section {
			flex-direction: column;
			text-align: center;
			padding: 4rem 0;
		}
		.text-content {
			max-width: 100%;
			order: 2;
		}
		.graphic-content {
			order: 1;
			margin-bottom: 2rem;
		}
		.graphic-content img {
			width: 300px;
		}
	}
	.hero-section {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6rem 0;
		gap: 2rem;
	}
	.text-content {
		max-width: 50%;
	}
	h1 {
		font-size: 7rem;
		line-height: 1.1;
		margin: 0 0 2rem 0;
		color: #fff;
	}
	h2 {
		font-size: 2rem;
		line-height: 1.1;
		margin: 0 0 2rem 0;
		color: #fff;
	}
	.cta-button {
		font-weight: 500;
		font-size: 1.2rem;
		color: var(--primary-color);
		letter-spacing: 1px;
	}
	.graphic-content {
		flex-shrink: 0;
		/* 아래 스타일은 3D 그래픽을 돋보이게 하기 위함입니다. */
		padding: 2rem;
		border-radius: 50%;
		z-index: 0;
	}
	.graphic-content img {
		width: 400px;
		height: auto;
	}

	/* 모바일 화면 대응 */
	@media (max-width: 768px) {
		.hero-section {
			flex-direction: column;
			text-align: center;
		}
		.text-content {
			max-width: 100%;
			order: 2; /* 텍스트를 이미지 아래로 */
		}
		.graphic-content {
			order: 1;
		}
		h1 {
			font-size: 3rem;
		}
	}
</style>
